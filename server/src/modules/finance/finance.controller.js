const Finance = require("../../shared/models/Finance.model");
const Student = require("../../shared/models/Student.model");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../../shared/utils/response.util");

/**
 * @desc    Get finance overview
 * @route   GET /api/finance/overview
 * @access  Private (director, accountant)
 */
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total revenue (all paid)
    const totalRevenueResult = await Finance.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    // This month revenue
    const thisMonthRevenueResult = await Finance.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: firstDayThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    // Last month revenue
    const lastMonthRevenueResult = await Finance.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    // Pending payments
    const pendingResult = await Finance.aggregate([
      { $match: { status: { $in: ["pending", "partial"] } } },
      { $group: { _id: null, total: { $sum: "$remainingAmount" } } },
    ]);

    // New students this month
    const newStudentsThisMonth = await Student.countDocuments({
      createdAt: { $gte: firstDayThisMonth },
    });

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;
    const pendingPayments = pendingResult[0]?.total || 0;

    /**
     * Revenue growth calculation:
     * - If lastMonthRevenue === 0 and thisMonthRevenue === 0 => 0
     * - If lastMonthRevenue === 0 and thisMonthRevenue > 0 => 'infinite' (or Number.POSITIVE_INFINITY)
     * - Otherwise: ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
     * Returns: number | 'infinite'
     */
    let revenueGrowth;
    if (lastMonthRevenue === 0) {
      if (thisMonthRevenue === 0) {
        revenueGrowth = 0;
      } else {
        revenueGrowth = "infinite"; // or use Number.POSITIVE_INFINITY
      }
    } else {
      revenueGrowth =
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }

    const data = {
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      pendingPayments,
      newStudentsThisMonth,
      revenueGrowth:
        typeof revenueGrowth === "number"
          ? Math.round(revenueGrowth * 10) / 10
          : revenueGrowth,
    };

    successResponse(res, data, "Lấy tổng quan tài chính thành công");
  } catch (error) {
    console.error("Get Finance Overview Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all finance records
 * @route   GET /api/finance
 * @access  Private (director, accountant)
 */
exports.getAllFinance = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status = "",
      type = "",
      studentId = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.student = studentId;

    // Count total
    const total = await Finance.countDocuments(query);

    // Execute query
    const finances = await Finance.find(query)
      .populate({
        path: "student",
        select: "studentCode",
        populate: { path: "user", select: "fullName email" },
      })
      .populate("course", "name courseCode")
      .populate("createdBy", "fullName")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    paginatedResponse(
      res,
      finances,
      page,
      pageSize,
      total,
      "Lấy danh sách giao dịch thành công"
    );
  } catch (error) {
    console.error("Get All Finance Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get finance by student
 * @route   GET /api/finance/student/:studentId
 * @access  Private
 */
exports.getFinanceByStudent = async (req, res) => {
  try {
    const allowedRoles = ["finance_admin", "staff", "director", "accountant"];
    const studentId = req.params.studentId;

    // Fetch student to check ownership
    const student = await require("../../models/Student")
      .findById(studentId)
      .populate("user", "_id");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy học viên.",
      });
    }

    const isOwner =
      String(req.user._id) === String(student.user?._id || student.user);
    if (!allowedRoles.includes(req.user.role) && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền truy cập thông tin tài chính của học viên này.",
      });
    }

    const finances = await Finance.find({ student: studentId })
      .populate("course", "name courseCode fee")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    successResponse(res, finances, "Lấy lịch sử giao dịch thành công");
  } catch (error) {
    console.error("Get Finance By Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create finance record
 * @route   POST /api/finance
 * @access  Private (director, accountant, enrollment)
 */
exports.createFinance = async (req, res) => {
  try {
    const {
      student,
      course,
      type,
      amount,
      paymentMethod,
      dueDate,
      description,
      paidAmount,
    } = req.body;

    // Validate required fields
    if (!student || !course || !type || !amount || !paymentMethod) {
      return errorResponse(res, "Vui lòng điền đầy đủ thông tin", 400);
    }

    // Validate paidAmount before DB write
    if (!paidAmount) {
      return errorResponse(res, "Số tiền thanh toán là bắt buộc", 400);
    }
    const parsedPaidAmount = parseFloat(paidAmount);
    if (isNaN(parsedPaidAmount) || parsedPaidAmount <= 0) {
      return errorResponse(res, "Số tiền thanh toán không hợp lệ", 400);
    }

    // Create finance record
    const finance = await Finance.create({
      student,
      course,
      type,
      amount,
      paymentMethod,
      dueDate,
      description,
      createdBy: req.user._id,
    });

    // Populate
    await finance.populate([
      { path: "student", populate: { path: "user", select: "fullName" } },
      { path: "course", select: "name courseCode" },
      { path: "createdBy", select: "fullName" },
    ]);

    // Success response
    return successResponse(res, finance, "Tạo giao dịch thành công");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Process payment
 * @route   POST /api/finance/:id/payment
 * @access  Private (director, accountant)
 */
exports.processPayment = async (req, res) => {
  try {
    const { paidAmount, paymentMethod, receiptNumber } = req.body;

    if (!paidAmount) {
      return errorResponse(res, "Số tiền thanh toán là bắt buộc", 400);
    }
    const amountToPay = parseFloat(paidAmount);
    if (isNaN(amountToPay) || amountToPay <= 0) {
      return errorResponse(res, "Số tiền thanh toán không hợp lệ", 400);
    }

    // Read current finance document
    const finance = await Finance.findById(req.params.id);
    if (!finance) {
      return errorResponse(res, "Không tìm thấy giao dịch", 404);
    }

    const paidAmountPrior = finance.paidAmount || 0;
    const totalAmount = finance.amount || 0;
    const newPaidAmount = paidAmountPrior + amountToPay;
    const remaining = totalAmount - newPaidAmount;

    // Overpayment validation
    if (newPaidAmount > totalAmount) {
      return errorResponse(
        res,
        "Số tiền thanh toán vượt quá số tiền phải trả",
        400
      );
    }

    // Determine new status
    let newStatus = "partial";
    if (newPaidAmount === totalAmount) {
      newStatus = "paid";
    }

    // Build update object
    const update = {
      $inc: { paidAmount: amountToPay },
      $set: {
        status: newStatus,
        remainingAmount: remaining < 0 ? 0 : remaining,
      },
    };
    if (paymentMethod) update.$set.paymentMethod = paymentMethod;
    if (receiptNumber) {
      update.$set["receipt"] = {
        number: receiptNumber,
        issuedBy: req.user._id,
        issuedAt: new Date(),
      };
    }

    // Atomic update
    const updatedFinance = await Finance.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate([
      { path: "student", populate: { path: "user", select: "fullName" } },
      { path: "course", select: "name courseCode" },
    ]);

    successResponse(res, updatedFinance, "Xử lý thanh toán thành công");
  } catch (error) {
    console.error("Process Payment Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
