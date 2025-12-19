const express = require("express");
const router = express.Router();
const Receipt = require("../src/shared/models/Receipt.model");
const Staff = require("../src/shared/models/Staff.model");
const Student = require("../src/shared/models/Student.model");
const Class = require("../src/shared/models/Class.model");
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
      const query = { status: "active" };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const receipts = await Receipt.find(query);
      const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
      const totalReceipts = receipts.length;

      const byMethod = await Receipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      // Daily statistics
      const dailyStats = await Receipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        success: true,
        message: "Lấy thống kê thành công",
        totalAmount,
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

// Create new receipt
router.post(
  "/",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      const {
        studentId,
        amount,
        paymentMethod,
        description,
        note,
        classId,
        date,
      } = req.body;

      console.log("📝 Creating receipt with data:", {
        studentId,
        amount,
        paymentMethod,
        classId,
      });

      // Validate required fields
      if (!studentId || !amount || !paymentMethod) {
        console.warn("⚠️ Missing required fields:", {
          studentId: !!studentId,
          amount: !!amount,
          paymentMethod: !!paymentMethod,
        });
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc: studentId, amount, paymentMethod",
        });
      }

      // Validate user is authenticated
      if (!req.user || !req.user._id) {
        console.warn("⚠️ User not authenticated");
        return res.status(401).json({
          success: false,
          message: "Người dùng chưa được xác thực",
        });
      }

      console.log("✅ Creating receipt object for student:", studentId);

      const receipt = new Receipt({
        student: studentId,
        amount: parseInt(amount) || amount, // Ensure it's a number
        paymentMethod: paymentMethod.toLowerCase(), // Normalize to lowercase
        description,
        note,
        class: classId,
        createdBy: req.user._id,
      });

      console.log("💾 Saving receipt...");
      await receipt.save();
      console.log("✅ Receipt saved:", receipt._id);

      // Convert to plain object to avoid populate issues
      const receiptObj = receipt.toObject ? receipt.toObject() : { ...receipt };

      // Manually populate references
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

        if (receiptObj.createdBy) {
          const staff = await Staff.findById(receiptObj.createdBy);
          if (staff) {
            receiptObj.createdBy = {
              _id: staff._id,
              fullName: staff.fullName,
            };
          }
        }

        if (receiptObj.class) {
          const cls = await Class.findById(receiptObj.class);
          if (cls) {
            receiptObj.class = {
              _id: cls._id,
              name: cls.name,
            };
          }
        }
      } catch (populateError) {
        console.warn("⚠️ Error in manual population:", populateError.message);
        // Continue without full population
      }

      console.log("📤 Sending response with receipt:", receiptObj);

      res.status(201).json({
        success: true,
        message: "Tạo phiếu thu thành công",
        data: receiptObj,
      });
    } catch (error) {
      console.error("❌ Error creating receipt:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        errors: error.errors,
      });
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo phiếu thu",
        error: error.message,
        details: error.errors || error.validationErrors,
      });
    }
  }
);

module.exports = router;
