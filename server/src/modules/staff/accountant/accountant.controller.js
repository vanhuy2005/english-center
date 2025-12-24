const Finance = require("../../../shared/models/Finance.model");
const Student = require("../../../shared/models/Student.model");
const Course = require("../../../shared/models/Course.model");
const Receipt = require("../../../shared/models/Receipt.model");
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

    // Pending payments (chỉ đếm status = pending)
    const pendingPayments = await Finance.countDocuments({
      status: "pending",
    });

    // Overdue payments (quá hạn và chưa thanh toán)
    const overduePayments = await Finance.countDocuments({
      status: "overdue",
    });

    // Recent transactions
    const recentTransactions = await Finance.find()
      .limit(10)
      .sort({ createdAt: -1 })
      .populate("student", "studentCode fullName")
      .populate("course", "name courseCode")
      .lean();

    // Revenue trend (this month by day)
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Revenue trend - 18-23 Dec (6 days)
    const endDate = new Date('2025-12-23T23:59:59');
    const startDate = new Date('2025-12-18T00:00:00');
    
    const dailyRevenue = await Finance.aggregate([
      {
        $match: {
          paidDate: { $gte: startDate, $lte: endDate },
          status: { $in: ["paid", "partial"] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidDate" }
          },
          total: { $sum: "$paidAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tạo map để tra cứu nhanh
    const revenueMap = {};
    dailyRevenue.forEach(item => {
      revenueMap[item._id] = item.total;
    });

    // Tạo array cho 6 ngày (18-23/12)
    const daysInMonth = [];
    const revenueData = [];
    
    for (let day = 18; day <= 23; day++) {
      const date = new Date(2025, 11, day); // Month is 0-indexed
      const dateStr = date.toISOString().split('T')[0];
      
      daysInMonth.push(
        date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      );
      revenueData.push(revenueMap[dateStr] || 0);
    }

    const dashboardData = {
      stats: {
        totalRevenue: Math.round(totalRevenue),
        monthRevenue: Math.round(monthRevenue),
        pendingPayments,
        overduePayments,
      },
      recentTransactions,
      revenueTrend: {
        labels: daysInMonth,
        datasets: [
          {
            label: "Doanh thu (VNĐ)",
            data: revenueData,
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
    console.log("📝 getTransactions called with query:", req.query);

    const {
      status,
      studentId,
      courseId,
      startDate,
      endDate,
      type,
      paymentMethod,
      search,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    // Handle different status parameter names
    if (status) filter.status = status;
    if (type) filter.type = type; // Finance model uses 'type' field
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (studentId) filter.student = studentId;
    if (courseId) filter.course = courseId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start)) filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end)) filter.createdAt.$lte = end;
      }
    }

    console.log("🔍 Filter:", filter);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Finance.find(filter)
      .populate("student", "studentCode fullName phone email")
      .populate("course", "name courseCode")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Finance.countDocuments(filter);

    console.log("✅ Found", transactions.length, "transactions");

    return ApiResponse.success(
      res,
      {
        receipts: transactions,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      "Lấy danh sách giao dịch thành công"
    );
  } catch (error) {
    console.error("❌ Get transactions error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return ApiResponse.error(
      res,
      error.message || "Không thể lấy danh sách giao dịch",
      400
    );
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Finance.findById(id)
      .populate("student", "studentCode fullName phone email")
      .populate("course", "name courseCode")
      .populate("createdBy", "fullName");

    if (!transaction) {
      return ApiResponse.notFound(res, "Giao dịch không tồn tại");
    }

    return ApiResponse.success(
      res,
      transaction,
      "Lấy chi tiết giao dịch thành công"
    );
  } catch (error) {
    console.error("❌ Get transaction by ID error:", error);
    return ApiResponse.error(res, "Không thể lấy chi tiết giao dịch", 400);
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

    // Get total revenue from Finance (paid and partial payments)
    const revenueData = await Finance.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [
            {
              $match: {
                paidDate: dateFilter,
                status: { $in: ["paid", "partial"] },
              },
            },
          ]
        : [{ $match: { status: { $in: ["paid", "partial"] } } }]),
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: "$paidAmount" },
        },
      },
    ]);

    // Get refunds (assuming status='refunded' or negative amounts)
    // For now, assume refunds are 0 as Finance model doesn't track refunds
    const totalRefunds = 0;

    // Get revenue by payment method
    const revenueByType = await Finance.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [
            {
              $match: {
                paidDate: dateFilter,
                status: { $in: ["paid", "partial"] },
              },
            },
          ]
        : [{ $match: { status: { $in: ["paid", "partial"] } } }]),
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const netRevenue = totalRevenue - totalRefunds;

    return ApiResponse.success(
      res,
      {
        summary: {
          totalRevenue,
          totalRefunds,
          netRevenue,
          totalTransactions: revenueData[0]?.totalTransactions || 0,
          avgTransactionAmount: revenueData[0]?.avgTransactionAmount || 0,
        },
        revenueByType,
      },
      "Lấy báo cáo tài chính thành công"
    );
  } catch (error) {
    console.error("Get financial report error:", error);
    return ApiResponse.error(res, "Không thể lấy báo cáo tài chính");
  }
};
// Export report
exports.exportReport = async (req, res) => {
  try {
    const { reportType = "revenue", dateFrom = "", dateTo = "" } = req.body;

    const query = {};
    if (dateFrom && dateTo) {
      query.paidDate = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    let data = [];
    let headers = [];

    if (reportType === "revenue") {
      data = await Finance.find({
        ...query,
        status: { $in: ["paid", "partial"] },
      })
        .populate("student", "fullName studentCode")
        .populate("course", "name courseCode")
        .lean();
      headers = [
        "Mã GD",
        "Học viên",
        "Khóa học",
        "Tổng số tiền",
        "Đã thanh toán",
        "Còn lại",
        "Phương thức",
        "Trạng thái",
        "Ngày thanh toán",
        "Ngày tạo",
      ];
    } else if (reportType === "debt") {
      data = await Finance.find({ ...query, status: { $in: ["pending", "overdue"] } })
        .populate("student", "fullName studentCode")
        .populate("course", "name courseCode")
        .lean();
      headers = ["Mã GD", "Học viên", "Khóa học", "Số tiền còn nợ", "Hạn chót", "Trạng thái"];
    } else if (reportType === "receipts") {
      data = await Finance.find(query)
        .populate("student", "fullName studentCode")
        .populate("course", "name courseCode")
        .lean();
      headers = ["Mã GD", "Học viên", "Khóa học", "Số tiền", "Phương thức", "Trạng thái", "Ngày tạo"];
    } else if (reportType === "refunds") {
      // No refund data in Finance model currently
      data = []
      headers = ["Mã phiếu", "Học viên", "Số tiền", "Ngày hoàn"];
    }

    // Convert data to HTML table format that Excel understands
    let htmlContent = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #4472C4; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
    `;

    // Add data rows
    if (reportType === "revenue") {
      data.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.transactionCode || ""}</td>
            <td>${row.student?.fullName || ""} (${row.student?.studentCode || ""})</td>
            <td>${row.course?.name || ""}</td>
            <td>${row.amount || 0}</td>
            <td>${row.paidAmount || 0}</td>
            <td>${row.remainingAmount || 0}</td>
            <td>${row.paymentMethod || ""}</td>
            <td>${row.status || ""}</td>
            <td>${
              row.paidDate
                ? new Date(row.paidDate).toLocaleDateString("vi-VN")
                : ""
            }</td>
            <td>${
              row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("vi-VN")
                : ""
            }</td>
          </tr>
        `;
      });
    } else if (reportType === "debt") {
      data.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.transactionCode || ""}</td>
            <td>${row.student?.fullName || ""} (${row.student?.studentCode || ""})</td>
            <td>${row.course?.name || ""}</td>
            <td>${row.remainingAmount || 0}</td>
            <td>${
              row.dueDate
                ? new Date(row.dueDate).toLocaleDateString("vi-VN")
                : ""
            }</td>
            <td>${row.status || ""}</td>
          </tr>
        `;
      });
    } else if (reportType === "receipts") {
      data.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.transactionCode || ""}</td>
            <td>${row.student?.fullName || ""} (${row.student?.studentCode || ""})</td>
            <td>${row.course?.name || ""}</td>
            <td>${row.paidAmount || 0}</td>
            <td>${row.paymentMethod || ""}</td>
            <td>${row.status || ""}</td>
            <td>${
              row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("vi-VN")
                : ""
            }</td>
          </tr>
        `;
      });
    } else if (reportType === "refunds") {
      // No refund data
      data.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.transactionCode || ""}</td>
            <td>${row.student?.fullName || ""}</td>
            <td>${row.amount || 0}</td>
            <td>${
              row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("vi-VN")
                : ""
            }</td>
          </tr>
        `;
      });
    }

    htmlContent += `
          </tbody>
        </table>
      </body>
    </html>
    `;

    // Set response headers for Excel file download
    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bao_cao_${reportType}_${Date.now()}.xls"`
    );

    res.send(htmlContent);
  } catch (error) {
    console.error("Export report error:", error);
    return ApiResponse.error(res, "Không thể xuất báo cáo");
  }
};

// Debug: Check receipt data
exports.checkReceiptData = async (req, res) => {
  try {
    const totalReceipts = await Receipt.countDocuments();
    const activeReceipts = await Receipt.countDocuments({ status: "active" });
    const refunds = await Receipt.countDocuments({ paymentMethod: "refund" });
    const nonRefundReceipts = await Receipt.countDocuments({
      status: "active",
      paymentMethod: { $ne: "refund" },
    });

    const totalAmount = await Receipt.aggregate([
      { $match: { status: "active", paymentMethod: { $ne: "refund" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const refundAmount = await Receipt.aggregate([
      { $match: { paymentMethod: "refund" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const sampleReceipts = await Receipt.find().limit(5).lean();

    return ApiResponse.success(
      res,
      {
        stats: {
          totalReceipts,
          activeReceipts,
          refunds,
          nonRefundReceipts,
          totalAmount: totalAmount[0]?.total || 0,
          refundAmount: refundAmount[0]?.total || 0,
        },
        sampleReceipts,
      },
      "Receipt data check"
    );
  } catch (error) {
    console.error("Check receipt data error:", error);
    return ApiResponse.error(res, "Không thể kiểm tra dữ liệu");
  }
};

// Get Receipt Statistics
exports.getReceiptStatistics = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    if (!startDate && !endDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      startDate = sevenDaysAgo.toISOString();
      endDate = today.toISOString();
    }
    
    const filter = { status: { $in: ["paid", "partial"] } };
    
    if (startDate || endDate) {
      filter.paidDate = {};
      if (startDate) filter.paidDate.$gte = new Date(startDate);
      if (endDate) filter.paidDate.$lte = new Date(endDate);
    }

    // Total amount and receipts
    const totalStats = await Finance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$paidAmount" },
          totalReceipts: { $sum: 1 },
        },
      },
    ]);

    // By payment method
    const byMethod = await Finance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily stats
    const dailyStats = await Finance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidDate" },
          },
          amount: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return ApiResponse.success(
      res,
      {
        totalAmount: totalStats[0]?.totalAmount || 0,
        totalReceipts: totalStats[0]?.totalReceipts || 0,
        byMethod: byMethod.map((item) => ({
          method: item._id,
          amount: item.amount,
          count: item.count,
        })),
        dailyStats: dailyStats.map((item) => ({
          date: item._id,
          amount: item.amount,
          count: item.count,
        })),
      },
      "Lấy thống kê phiếu thu thành công"
    );
  } catch (error) {
    console.error("Get receipt statistics error:", error);
    return ApiResponse.error(res, "Không thể lấy thống kê", 400);
  }
};
