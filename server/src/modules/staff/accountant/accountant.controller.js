const Finance = require("../../../shared/models/Finance.model");
const Student = require("../../../shared/models/Student.model");
const Course = require("../../../shared/models/Course.model");
const ApiResponse = require("../../../shared/utils/ApiResponse");

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Total revenue
    const revenueStats = await Finance.aggregate([
      { $match: { status: { $in: ["paid", "partial"] } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);
    const totalRevenue = revenueStats[0]?.total || 0;

    // This month revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthRevenueStats = await Finance.aggregate([
      {
        $match: {
          status: { $in: ["paid", "partial"] },
          paidDate: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);
    const monthRevenue = monthRevenueStats[0]?.total || 0;

    // Pending payments
    const pendingPayments = await Finance.countDocuments({
      status: { $in: ["pending", "partial"] },
    });

    // Overdue payments
    const overduePayments = await Finance.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $in: ["pending", "partial"] },
    });

    // Recent transactions
    const recentTransactions = await Finance.find()
      .limit(10)
      .sort({ createdAt: -1 })
      .populate("student", "studentCode fullName")
      .populate("course", "name courseCode")
      .lean();

    // Revenue trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const revenueTrend = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayRevenue = await Finance.aggregate([
          {
            $match: {
              paidDate: { $gte: date, $lt: nextDay },
              status: { $in: ["paid", "partial"] },
            },
          },
          { $group: { _id: null, total: { $sum: "$paidAmount" } } },
        ]);

        return dayRevenue[0]?.total || 0;
      })
    );

    const dashboardData = {
      stats: {
        totalRevenue: Math.round(totalRevenue),
        monthRevenue: Math.round(monthRevenue),
        pendingPayments,
        overduePayments,
      },
      recentTransactions,
      revenueTrend: {
        labels: last7Days.map((d) =>
          d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
        ),
        datasets: [
          {
            label: "Doanh thu (VNĐ)",
            data: revenueTrend,
            borderColor: "rgb(59, 151, 151)",
            backgroundColor: "rgba(59, 151, 151, 0.1)",
          },
        ],
      },
      paymentStatus: {
        labels: [
          "Đã thanh toán",
          "Chưa thanh toán",
          "Thanh toán một phần",
          "Quá hạn",
        ],
        datasets: [
          {
            data: [
              await Finance.countDocuments({ status: "paid" }),
              await Finance.countDocuments({ status: "pending" }),
              await Finance.countDocuments({ status: "partial" }),
              overduePayments,
            ],
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(251, 191, 36, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
          },
        ],
      },
    };

    return ApiResponse.success(
      res,
      dashboardData,
      "Lấy dữ liệu dashboard thành công"
    );
  } catch (error) {
    console.error("Get dashboard error:", error);
    return ApiResponse.error(res, "Không thể lấy dữ liệu dashboard");
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const { status, studentId, courseId, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (studentId) filter.student = studentId;
    if (courseId) filter.course = courseId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Finance.find(filter)
      .populate("student", "studentCode fullName phone email")
      .populate("course", "name courseCode")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      res,
      transactions,
      "Lấy danh sách giao dịch thành công"
    );
  } catch (error) {
    console.error("Get transactions error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách giao dịch");
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Finance.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Finance.findById(transaction._id)
      .populate("student", "studentCode fullName")
      .populate("course", "name courseCode");

    return ApiResponse.success(res, populated, "Tạo giao dịch thành công", 201);
  } catch (error) {
    console.error("Create transaction error:", error);
    return ApiResponse.error(res, error.message || "Không thể tạo giao dịch");
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("student", "studentCode fullName")
      .populate("course", "name courseCode");

    if (!transaction) {
      return ApiResponse.notFound(res, "Không tìm thấy giao dịch");
    }

    return ApiResponse.success(
      res,
      transaction,
      "Cập nhật giao dịch thành công"
    );
  } catch (error) {
    console.error("Update transaction error:", error);
    return ApiResponse.error(res, "Không thể cập nhật giao dịch");
  }
};

// Record payment
exports.recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, paidDate } = req.body;

    const transaction = await Finance.findById(req.params.id);

    if (!transaction) {
      return ApiResponse.notFound(res, "Không tìm thấy giao dịch");
    }

    transaction.paidAmount += amount;
    transaction.paymentMethod = paymentMethod;
    transaction.paidDate = paidDate || new Date();

    await transaction.save();

    const populated = await Finance.findById(transaction._id)
      .populate("student", "studentCode fullName email")
      .populate("course", "name courseCode");

    return ApiResponse.success(
      res,
      populated,
      "Ghi nhận thanh toán thành công"
    );
  } catch (error) {
    console.error("Record payment error:", error);
    return ApiResponse.error(res, "Không thể ghi nhận thanh toán");
  }
};

// Issue receipt
exports.issueReceipt = async (req, res) => {
  try {
    const { receiptNumber, receiptUrl } = req.body;

    const transaction = await Finance.findByIdAndUpdate(
      req.params.id,
      {
        "receipt.number": receiptNumber,
        "receipt.url": receiptUrl,
        "receipt.issuedBy": req.user._id,
        "receipt.issuedAt": new Date(),
      },
      { new: true }
    ).populate("student", "studentCode fullName email");

    if (!transaction) {
      return ApiResponse.notFound(res, "Không tìm thấy giao dịch");
    }

    return ApiResponse.success(res, transaction, "Xuất biên lai thành công");
  } catch (error) {
    console.error("Issue receipt error:", error);
    return ApiResponse.error(res, "Không thể xuất biên lai");
  }
};

// Get student payment history
exports.getStudentPayments = async (req, res) => {
  try {
    const payments = await Finance.find({ student: req.params.studentId })
      .populate("course", "name courseCode")
      .sort({ createdAt: -1 });

    const summary = {
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
    };

    payments.forEach((p) => {
      summary.totalAmount += p.amount;
      summary.paidAmount += p.paidAmount;
      summary.remainingAmount += p.remainingAmount;
    });

    return ApiResponse.success(
      res,
      { payments, summary },
      "Lấy lịch sử thanh toán thành công"
    );
  } catch (error) {
    console.error("Get student payments error:", error);
    return ApiResponse.error(res, "Không thể lấy lịch sử thanh toán");
  }
};

// Get financial report
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const report = await Finance.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$remainingAmount", 0],
            },
          },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: "$amount" },
        },
      },
    ]);

    const revenueByType = await Finance.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      {
        $group: {
          _id: "$type",
          total: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return ApiResponse.success(
      res,
      {
        summary: report[0] || {},
        revenueByType,
      },
      "Lấy báo cáo tài chính thành công"
    );
  } catch (error) {
    console.error("Get financial report error:", error);
    return ApiResponse.error(res, "Không thể lấy báo cáo tài chính");
  }
};
