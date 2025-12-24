const express = require("express");
const router = express.Router();
const Receipt = require("../src/shared/models/Receipt.model");
const Staff = require("../src/shared/models/Staff.model");
const Student = require("../src/shared/models/Student.model");
const Class = require("../src/shared/models/Class.model");
const mongoose = require("mongoose");
const Finance = require("../src/shared/models/Finance.model");
const Notification = require("../src/shared/models/Notification.model");
const { auth, checkRole } = require("../middleware/auth");

// ⚠️ IMPORTANT: Statistics route MUST come before /:id route
// Get statistics - MUST BE FIRST
router.get(
  "/stats/summary",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Query cơ sở cho ngày tháng
      const dateQuery = {};
      if (startDate || endDate) {
        dateQuery.createdAt = {};
        if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
        if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
      }

      // 1. Lấy tổng thu (Chỉ Active)
      const revenueReceipts = await Receipt.find({
        ...dateQuery,
        status: "active",
      });
      const totalRevenue = revenueReceipts.reduce(
        (sum, r) => sum + r.amount,
        0
      );
      const totalReceipts = revenueReceipts.length;

      // 2. Lấy tổng chi/hoàn tiền (Status = refunded)
      const refundReceipts = await Receipt.find({
        ...dateQuery,
        $or: [{ status: "refunded" }, { type: "refund" }],
      });
      const totalRefunds = refundReceipts.reduce((sum, r) => sum + r.amount, 0);

      // 3. Thống kê theo phương thức (Chỉ tính trên phiếu thu Active)
      const byMethod = await Receipt.aggregate([
        { $match: { ...dateQuery, status: "active" } },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      // 4. Thống kê theo ngày (Doanh thu thuần)
      // Logic: Group theo ngày, sum amount nếu active, trừ amount nếu refunded
      const dailyStats = await Receipt.aggregate([
        { $match: dateQuery }, // Lấy tất cả trong khoảng ngày
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            // Nếu active thì cộng, refunded thì trừ (hoặc bỏ qua tùy nghiệp vụ)
            total: {
              $sum: {
                $cond: [{ $eq: ["$status", "active"] }, "$amount", 0],
              },
            },
            count: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        success: true,
        message: "Lấy thống kê thành công",
        totalAmount: totalRevenue, // Tổng thu
        totalRefunds: totalRefunds, // Tổng hoàn (Mới thêm)
        netAmount: totalRevenue - totalRefunds, // Thực thu (Mới thêm)
        totalReceipts,
        byMethod,
        dailyStats: dailyStats.map((stat) => ({
          date: stat._id,
          amount: stat.total,
          receipts: stat.count,
        })),
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
        error: error.message,
      });
    }
  }
);

// Get 5 recent receipts for dashboard
router.get(
  "/recent/list",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      console.log("📋 GET /receipts/recent/list - Fetching 5 recent receipts");

      // Query receipts sorted by most recent
      let receipts = await Receipt.find({}, null, {
        sort: { createdAt: -1 },
        limit: 5,
      });

      console.log(`✅ Found ${receipts.length} recent receipts`);

      // Populate references manually for each receipt
      try {
        receipts = await Promise.all(
          receipts.map(async (receipt) => {
            try {
              let receiptObj = receipt.toObject
                ? receipt.toObject()
                : { ...receipt };

              // Populate student
              try {
                if (receiptObj.student) {
                  const student = await Student.findById(receiptObj.student);
                  if (student) {
                    receiptObj.student = {
                      _id: student._id,
                      studentCode: student.studentCode,
                      fullName: student.fullName,
                    };
                  }
                }
              } catch (err) {
                console.log("Could not populate student");
              }

              // Populate createdBy
              try {
                if (receiptObj.createdBy) {
                  const staff = await Staff.findById(receiptObj.createdBy);
                  if (staff) {
                    receiptObj.createdBy = {
                      _id: staff._id,
                      fullName: staff.fullName,
                    };
                  }
                }
              } catch (err) {
                console.log("Could not populate createdBy");
              }

              // Populate class
              try {
                if (receiptObj.class) {
                  const cls = await Class.findById(receiptObj.class);
                  if (cls) {
                    receiptObj.class = {
                      _id: cls._id,
                      name: cls.name,
                    };
                  }
                }
              } catch (err) {
                console.log("Could not populate class");
              }

              return receiptObj;
            } catch (itemErr) {
              console.error("❌ Error populating item:", itemErr.message);
              return receipt.toObject ? receipt.toObject() : { ...receipt };
            }
          })
        );
      } catch (populateErr) {
        console.error("⚠️ Population failed:", populateErr.message);
        receipts = receipts.map((r) => (r.toObject ? r.toObject() : { ...r }));
      }

      console.log("✅ Population complete");

      res.json({
        success: true,
        message: "Lấy danh sách 5 giao dịch gần đây thành công",
        receipts,
      });
    } catch (error) {
      console.error("❌ Error in GET /receipts/recent/list:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách giao dịch gần đây",
        error: error.message,
      });
    }
  }
);

// Get all receipts
router.get(
  "/",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      console.log("📋 GET /receipts - Fetching receipts list");

      // Parse pagination parameters
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;

      // Validate parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      const skip = (page - 1) * limit;

      console.log(`📊 Pagination: page=${page}, limit=${limit}, skip=${skip}`);

      // Build query filter
      const query = {};

      // Handle search filter
      if (req.query.search) {
        query.$or = [
          { receiptNumber: { $regex: req.query.search, $options: "i" } },
          { "student.fullName": { $regex: req.query.search, $options: "i" } },
          {
            "student.studentCode": { $regex: req.query.search, $options: "i" },
          },
          { description: { $regex: req.query.search, $options: "i" } },
        ];
      }

      // Handle payment method filter
      if (req.query.paymentMethod) {
        query.paymentMethod = req.query.paymentMethod;
      }

      // Handle status filter
      if (req.query.status) {
        query.status = req.query.status;
      }

      // Query receipts
      console.log("🔍 Querying database with filter:", query);
      let receipts = await Receipt.find(query, null, {
        sort: { createdAt: -1 },
        limit: limit,
        skip: skip,
      });

      console.log(`✅ Found ${receipts.length} receipts`);

      // Populate references manually for each receipt
      console.log("🔗 Populating references...");
      try {
        receipts = await Promise.all(
          receipts.map(async (receipt) => {
            try {
              // Convert to plain object
              let receiptObj = receipt.toObject
                ? receipt.toObject()
                : { ...receipt };

              // Populate student
              try {
                if (receiptObj.student) {
                  const student = await Student.findById(receiptObj.student);
                  if (student) {
                    receiptObj.student = {
                      _id: student._id,
                      studentCode: student.studentCode,
                      fullName: student.fullName,
                      email: student.email,
                      phone: student.phone,
                    };
                  }
                }
              } catch (err) {
                console.log("Could not populate student");
              }

              // Populate createdBy
              try {
                if (receiptObj.createdBy) {
                  const staff = await Staff.findById(receiptObj.createdBy);
                  if (staff) {
                    receiptObj.createdBy = {
                      _id: staff._id,
                      fullName: staff.fullName,
                      staffCode: staff.staffCode,
                    };
                  }
                }
              } catch (err) {
                console.log("Could not populate createdBy");
              }

              // Populate class
              try {
                if (receiptObj.class) {
                  const cls = await Class.findById(receiptObj.class);
                  if (cls) {
                    receiptObj.class = {
                      _id: cls._id,
                      name: cls.name,
                      classCode: cls.classCode,
                    };
                  }
                }
              } catch (err) {
                console.log("Could not populate class");
              }

              return receiptObj;
            } catch (itemErr) {
              console.error("❌ Error populating item:", itemErr.message);
              return receipt.toObject ? receipt.toObject() : { ...receipt };
            }
          })
        );
      } catch (populateErr) {
        console.error("⚠️ Population failed:", populateErr.message);
        // Continue with unpopulated data
        receipts = receipts.map((r) => (r.toObject ? r.toObject() : { ...r }));
      }

      console.log("✅ Population complete");

      // Count total with the same filter
      const total = await Receipt.countDocuments(query);

      // Response
      res.json({
        success: true,
        message: "Lấy danh sách phiếu thu thành công",
        receipts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("❌ Error in GET /receipts:", error);
      console.error("Error message:", error.message);

      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách phiếu thu",
        error: error.message,
      });
    }
  }
);

// Get receipt by ID - MUST come after specific routes like /stats/summary
router.get(
  "/:id",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      console.log("🔍 Fetching receipt by ID:", req.params.id);

      let receipt;
      try {
        receipt = await Receipt.findById(req.params.id)
          .populate("student", "studentCode fullName email phone")
          .populate("createdBy", "fullName staffCode")
          .populate("class", "name classCode")
          .exec();
      } catch (populateError) {
        console.error(
          "❌ Error with populate, trying without:",
          populateError.message
        );
        receipt = await Receipt.findById(req.params.id).lean();
      }

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu thu",
        });
      }

      res.json({
        success: true,
        message: "Lấy thông tin phiếu thu thành công",
        data: receipt,
      });
    } catch (error) {
      console.error("❌ Error fetching receipt:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin phiếu thu",
        error: error.message,
      });
    }
  }
);

// === REWRITE: CREATE NEW RECEIPT (THU & HOÀN) with class->course mapping ===
router.post(
  "/",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log("📥 CREATE RECEIPT REQUEST:", req.body);

      const {
        studentId,
        amount,
        paymentMethod,
        description,
        note,
        classId,
        type = "tuition",
        date,
      } = req.body;

      // 1. Xác định trạng thái Receipt
      const receiptStatus = type === "refund" ? "refunded" : "active";

      // 2. Tạo Receipt (Biên lai lưu classId để truy vết)
      const newReceipt = new Receipt({
        student: studentId,
        class: classId || null,
        amount: parseInt(amount),
        paymentMethod,
        description:
          description ||
          (type === "refund" ? "Hoàn trả học phí" : "Thu học phí"),
        note,
        type: type,
        status: receiptStatus,
        createdBy: req.user._id,
        createdAt: date ? new Date(date) : new Date(),
      });

      await newReceipt.save({ session });
      console.log("✅ Saved Receipt:", {
        id: newReceipt._id,
        type: newReceipt.type,
        status: newReceipt.status,
      });

      // 3. XỬ LÝ TÌM KIẾM FINANCE (Map classId -> courseId nếu cần)
      let courseId = null;
      if (classId) {
        try {
          const classInfo = await Class.findById(classId).select("course");
          if (classInfo) courseId = classInfo.course;
        } catch (e) {
          console.warn(
            "⚠️ Error fetching class info for classId:",
            classId,
            e.message
          );
        }
      }

      // Use safe ObjectId for queries
      const studentObjId = new mongoose.Types.ObjectId(studentId);

      // Strategy for finding finance:
      // 1) Student + Course + status in pending/partial (best candidate)
      // 2) Student + Course (any status) newest
      // 3) Student + status in pending/partial (any course)
      let financeRecord = null;

      if (courseId) {
        financeRecord = await Finance.findOne({
          student: studentObjId,
          course: courseId,
          status: { $in: ["pending", "partial"] },
        }).session(session);
      }

      if (!financeRecord && courseId) {
        financeRecord = await Finance.findOne({
          student: studentObjId,
          course: courseId,
        })
          .sort({ createdAt: -1 })
          .session(session);
      }

      if (!financeRecord) {
        financeRecord = await Finance.findOne({
          student: studentObjId,
          status: { $in: ["pending", "partial"] },
        })
          .sort({ createdAt: -1 })
          .session(session);
      }

      if (financeRecord) {
        console.log(
          `✅ Found Finance Record: ${financeRecord._id} | Status: ${financeRecord.status}`
        );

        if (type === "refund") {
          const refundAmount = parseInt(amount);
          financeRecord.paidAmount = Math.max(
            0,
            (financeRecord.paidAmount || 0) - refundAmount
          );
          financeRecord.status = "refunded";
          financeRecord.notes =
            (financeRecord.notes || "") +
            `\n[${new Date().toLocaleDateString()}] Đã hoàn: ${new Intl.NumberFormat(
              "vi-VN"
            ).format(refundAmount)}đ`;
        } else {
          const payAmount = parseInt(amount);
          financeRecord.paidAmount =
            (financeRecord.paidAmount || 0) + payAmount;

          // update latest payment method
          financeRecord.paymentMethod = paymentMethod;

          if (financeRecord.paidAmount >= financeRecord.amount) {
            financeRecord.status = "paid";
            financeRecord.paidDate = new Date();
          } else {
            financeRecord.status = "partial";
          }
        }

        financeRecord.remainingAmount = Math.max(
          0,
          (financeRecord.amount || 0) - (financeRecord.paidAmount || 0)
        );
        await financeRecord.save({ session });
      } else {
        console.warn(
          "⚠️ Không tìm thấy công nợ. Tự động tạo mới hồ sơ tài chính..."
        );

        const newFinance = new Finance({
          student: studentObjId,
          course: courseId || null,
          type: type,
          amount: parseInt(amount),
          paidAmount: parseInt(amount),
          remainingAmount: 0,
          paymentMethod: paymentMethod,
          status: type === "refund" ? "refunded" : "paid",
          paidDate: new Date(),
          createdBy: req.user._id,
          receipt: {
            number: newReceipt.receiptNumber,
            url: "",
            issuedBy: req.user._id,
            issuedAt: new Date(),
          },
        });

        await newFinance.save({ session });
      }

      // 4. Tạo Thông báo
      const notiTitle =
        type === "refund" ? "Thông báo hoàn tiền" : "Xác nhận thanh toán";
      const notiMsg =
        type === "refund"
          ? `Bạn đã được hoàn trả ${new Intl.NumberFormat("vi-VN").format(
              amount
            )}đ.`
          : `Đã thanh toán thành công ${new Intl.NumberFormat("vi-VN").format(
              amount
            )}đ.`;

      await Notification.create(
        [
          {
            recipient: studentId,
            type: type === "refund" ? "system" : "payment_reminder",
            title: notiTitle,
            message: notiMsg,
            relatedModel: "Receipt",
            relatedId: newReceipt._id,
            isRead: false,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Populate để trả về frontend
      const populatedReceipt = await Receipt.findById(newReceipt._id)
        .populate("student", "fullName studentCode")
        .populate("class", "name");

      return res.status(201).json({
        success: true,
        message:
          type === "refund"
            ? "Hoàn tiền thành công"
            : "Tạo phiếu thu thành công",
        data: populatedReceipt,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Create Transaction Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
