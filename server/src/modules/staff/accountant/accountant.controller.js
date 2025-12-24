const Finance = require("../../../shared/models/Finance.model");
const Student = require("../../../shared/models/Student.model");
const Course = require("../../../shared/models/Course.model");
const Receipt = require("../../../shared/models/Receipt.model");
const Notification = require("../../../shared/models/Notification.model");
const Staff = require("../../../shared/models/Staff.model");
const ApiResponse = require("../../../shared/utils/ApiResponse");

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    // 1. TÍNH TỔNG DOANH THU THỰC TẾ (NET REVENUE)
    // Logic: Cộng tổng paidAmount của tất cả các bản ghi Finance
    const revenueStats = await Finance.aggregate([
      { $match: { paidAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);
    const totalRevenue = revenueStats[0]?.total || 0;

    // 2. TÍNH DOANH THU THÁNG NÀY (DÙNG RECEIPT để phân biệt refund)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const ReceiptModel = require("../../../shared/models/Receipt.model");

    const incomeMonth = await ReceiptModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: "active",
          type: { $ne: "refund" },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const refundMonth = await ReceiptModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          $or: [{ status: "refunded" }, { type: "refund" }],
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthRevenue =
      (incomeMonth[0]?.total || 0) - (refundMonth[0]?.total || 0);

    // 3. CÁC CHỈ SỐ KHÁC
    const pendingPayments = await Finance.countDocuments({
      status: { $in: ["pending", "partial"] },
    });
    const overduePayments = await Finance.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $in: ["pending", "partial"] },
    });

    // 4. GIAO DỊCH GẦN ĐÂY (Lấy từ Receipt để hiện cả Thu và Hoàn)
    const recentTransactions = await ReceiptModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("student", "studentCode fullName")
      .populate("class", "name classCode")
      .lean();

    // 4. BIỂU ĐỒ 1: XU HƯỚNG DOANH THU (7 NGÀY GẦN NHẤT)
    const last7Days = [];
    const revenueTrendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayString = d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      last7Days.push(dayString);

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const dayIncome = await ReceiptModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: "active",
            type: { $ne: "refund" },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const dayRefund = await ReceiptModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            $or: [{ status: "refunded" }, { type: "refund" }],
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const netDay = (dayIncome[0]?.total || 0) - (dayRefund[0]?.total || 0);
      revenueTrendData.push(netDay);
    }

    // 5. BIỂU ĐỒ 2: TỶ LỆ THANH TOÁN (Pie Chart)
    const paidCount = await Finance.countDocuments({ status: "paid" });

    const dashboardData = {
      stats: {
        totalRevenue: totalRevenue,
        monthRevenue: monthRevenue,
        pendingPayments,
        overduePayments,
      },
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        transactionCode: t.receiptNumber || "N/A",
        course: t.class,
      })),
      // --- Dữ liệu cho Line Chart ---
      revenueTrend: {
        labels: last7Days,
        datasets: [
          {
            label: "Doanh thu (VNĐ)",
            data: revenueTrendData,
            borderColor: "rgb(59, 151, 151)",
            backgroundColor: "rgba(59, 151, 151, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      // --- Dữ liệu cho Pie Chart ---
      paymentStatus: {
        labels: ["Đã thanh toán", "Chưa thanh toán", "Quá hạn"],
        datasets: [
          {
            data: [paidCount, pendingPayments, overduePayments],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 0,
          },
        ],
      },
    };

    // Return
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

// Helper: notify accountants/directors
exports.notifyAccountants = async ({
  title,
  message,
  relatedModel,
  relatedId,
}) => {
  try {
    // Find staff with staffType 'accountant' or 'director'
    const accountants = await Staff.find({
      staffType: { $in: ["accountant", "director"] },
    }).select("_id");
    if (!accountants || accountants.length === 0) return;

    const notifications = accountants.map((acc) => ({
      recipient: acc._id,
      type: "system",
      title,
      message,
      relatedModel,
      relatedId,
      isRead: false,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    console.log(
      `🔔 Sent ${notifications.length} notifications to accountants/directors.`
    );
  } catch (err) {
    console.error("Error notifying accountants:", err);
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

// Create transaction (tạo phiếu thu và đồng bộ Finance + Notification)
exports.createTransaction = async (req, res) => {
  const session = await Finance.startSession();
  session.startTransaction();
  try {
    const { student, course, amount, paymentMethod, type, notes } = req.body;

    // A. Create Finance transaction (giao dịch tài chính)
    // Resolve course: prefer provided course, fallback to class.course if class provided
    let resolvedCourse = course;

    if (!resolvedCourse && req.body.classId) {
      // If a classId was sent, fetch class and derive course
      try {
        const cls = await require("../../../shared/models/Class.model")
          .findById(req.body.classId)
          .select("course");
        if (cls && cls.course) resolvedCourse = cls.course;
      } catch (e) {
        // ignore
      }
    }

    const paidDateValue = req.body.date ? new Date(req.body.date) : new Date();

    const newTransaction = new Finance({
      student: student || req.body.studentId,
      course: resolvedCourse,
      amount,
      paymentMethod,
      type: type || "tuition",
      status: "paid",
      paidAmount: amount,
      remainingAmount: 0,
      paidDate: paidDateValue,
      notes,
      createdBy: req.user._id,
    });

    await newTransaction.save({ session });

    // C. Create Receipt and link to Finance
    let createdReceipt = null;
    try {
      const ReceiptModel = require("../../../shared/models/Receipt.model");

      const receiptPayload = {
        student: student || req.body.studentId,
        class: req.body.classId || null,
        amount,
        paymentMethod,
        description: `Thu phí học viên`,
        note: notes || "",
        createdBy: req.user._id,
        createdAt: req.body.date ? new Date(req.body.date) : undefined,
      };

      const receiptDoc = new ReceiptModel(receiptPayload);
      createdReceipt = await receiptDoc.save({ session });

      // Update finance record with receipt info
      newTransaction.receipt = {
        number: createdReceipt.receiptNumber,
        url: createdReceipt.url || "",
        issuedBy: req.user._id,
        issuedAt: new Date(),
      };

      await newTransaction.save({ session });
    } catch (receiptErr) {
      console.warn("Could not create receipt:", receiptErr.message);
      // don't fail if receipt creation fails, but log
    }

    // B. Create Notification for student
    try {
      await Notification.create(
        [
          {
            recipient: student || req.body.studentId,
            type: "payment_reminder",
            title: "Xác nhận thanh toán học phí",
            message: `Bạn đã thanh toán thành công số tiền ${new Intl.NumberFormat(
              "vi-VN",
              { style: "currency", currency: "VND" }
            ).format(amount)}. Mã giao dịch: ${newTransaction.transactionCode}`,
            relatedModel: "Finance",
            relatedId: newTransaction._id,
            isRead: false,
          },
        ],
        { session }
      );
    } catch (notifErr) {
      console.warn("Could not create notification:", notifErr.message);
      // don't fail the whole transaction for a notification error
    }
    await session.commitTransaction();
    session.endSession();

    // Populate để trả về frontend hiển thị ngay
    const populatedTrans = await Finance.findById(newTransaction._id)
      .populate("student", "studentCode fullName")
      .populate("course", "name courseCode");

    return ApiResponse.success(
      res,
      populatedTrans,
      "Lập phiếu thu & gửi thông báo thành công",
      201
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create transaction error:", error);
    return ApiResponse.error(res, error.message || "Lỗi khi tạo giao dịch");
  }
};

// Lấy tình hình học phí (list từ Finance)
exports.getTuitionStatus = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const tuitionData = await Finance.find(query)
      .populate("student", "studentCode fullName email phone")
      .populate("course", "name courseCode")
      .sort({ createdAt: -1 });

    let finalData = tuitionData;
    if (search) {
      const lowerSearch = search.toLowerCase();
      finalData = tuitionData.filter(
        (item) =>
          item.student?.fullName?.toLowerCase().includes(lowerSearch) ||
          item.student?.studentCode?.toLowerCase().includes(lowerSearch)
      );
    }

    return ApiResponse.success(
      res,
      finalData,
      "Lấy tình hình học phí thành công"
    );
  } catch (error) {
    console.error("Get tuition status error:", error);
    return ApiResponse.error(res, "Không thể tải dữ liệu học phí");
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

    // ==========================================
    // 1. TÍNH DOANH THU (Chỉ lấy phiếu thu Active)
    // ==========================================
    const revenueMatch = {
      status: "active", // Chỉ lấy phiếu đang active
      // Đảm bảo không dính phiếu hoàn tiền nếu lỡ có phiếu hoàn mà status active (phòng hờ)
      $and: [{ type: { $ne: "refund" } }, { paymentMethod: { $ne: "refund" } }],
    };
    if (Object.keys(dateFilter).length > 0) revenueMatch.createdAt = dateFilter;

    const revenueData = await Receipt.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: "$amount" },
        },
      },
    ]);

    // ==========================================
    // 2. TÍNH HOÀN TIỀN (SỬA LỖI TẠI ĐÂY)
    // ==========================================
    const refundMatch = {};
    if (Object.keys(dateFilter).length > 0) refundMatch.createdAt = dateFilter;

    // QUAN TRỌNG: Thêm điều kiện status: "refunded"
    refundMatch.$or = [
      { status: "refunded" }, // Ưu tiên bắt theo trạng thái này
      { type: "refund" }, // Backup bắt theo loại
      { paymentMethod: "refund" }, // Backup bắt theo phương thức
    ];

    const refundData = await Receipt.aggregate([
      { $match: refundMatch },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: "$amount" },
          refundCount: { $sum: 1 },
        },
      },
    ]);

    // ==========================================
    // 3. TÍNH THEO LOẠI (DOANH THU)
    // ==========================================
    const revenueByType = await Receipt.aggregate([
      { $match: revenueMatch }, // Dùng chung bộ lọc với Revenue
      {
        $group: {
          _id: { $ifNull: ["$type", "$paymentMethod"] }, // Gom nhóm theo type hoặc method
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Tổng hợp số liệu
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalRefunds = refundData[0]?.totalRefunds || 0;
    const netRevenue = totalRevenue - totalRefunds; // Lợi nhuận ròng = Thu - Hoàn

    return ApiResponse.success(
      res,
      {
        summary: {
          totalRevenue,
          totalRefunds,
          netRevenue,
          totalTransactions: revenueData[0]?.totalTransactions || 0,
          avgTransactionAmount: revenueData[0]?.avgTransactionAmount || 0,
          refundCount: refundData[0]?.refundCount || 0, // Trả thêm số lượng phiếu hoàn
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
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    let data = [];
    let headers = [];

    if (reportType === "revenue") {
      data = await Finance.find(query)
        .populate("student", "fullName studentCode")
        .lean();
      headers = [
        "Mã GD",
        "Học viên",
        "Số tiền",
        "Trạng thái",
        "Ngày thanh toán",
        "Ngày tạo",
      ];
    } else if (reportType === "debt") {
      data = await Finance.find({ ...query, status: "pending" })
        .populate("student", "fullName studentCode")
        .lean();
      headers = ["Mã GD", "Học viên", "Số tiền còn nợ", "Hạn chót"];
    } else if (reportType === "receipts") {
      // Exclude refunds by status/type/paymentMethod
      data = await Receipt.find({
        ...query,
        $and: [
          { type: { $ne: "refund" } },
          { status: { $ne: "refunded" } },
          { paymentMethod: { $ne: "refund" } },
        ],
      })
        .populate("student", "fullName studentCode")
        .lean();
      headers = ["Mã phiếu", "Học viên", "Số tiền", "Phương thức", "Ngày tạo"];
    } else if (reportType === "refunds") {
      // Include refunds marked by status or type (or paymentMethod for legacy)
      data = await Receipt.find({
        ...query,
        $or: [
          { status: "refunded" },
          { type: "refund" },
          { paymentMethod: "refund" },
        ],
      })
        .populate("student", "fullName studentCode")
        .lean();
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
            <td>${row.student?.fullName || ""}</td>
            <td>${row.amount || 0}</td>
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
            <td>${row.student?.fullName || ""}</td>
            <td>${row.remainingAmount || 0}</td>
            <td>${
              row.dueDate
                ? new Date(row.dueDate).toLocaleDateString("vi-VN")
                : ""
            }</td>
          </tr>
        `;
      });
    } else if (reportType === "receipts") {
      data.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.receiptNumber || ""}</td>
            <td>${row.student?.fullName || ""}</td>
            <td>${row.amount || 0}</td>
            <td>${row.paymentMethod || ""}</td>
            <td>${
              row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("vi-VN")
                : ""
            }</td>
          </tr>
        `;
      });
    } else if (reportType === "refunds") {
      data.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.receiptNumber || ""}</td>
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
    const refunds = await Receipt.countDocuments({
      $or: [
        { status: "refunded" },
        { type: "refund" },
        { paymentMethod: "refund" },
      ],
    });
    const nonRefundReceipts = await Receipt.countDocuments({
      status: "active",
      $and: [{ type: { $ne: "refund" } }, { paymentMethod: { $ne: "refund" } }],
    });

    const totalAmount = await Receipt.aggregate([
      {
        $match: {
          status: "active",
          $and: [
            { type: { $ne: "refund" } },
            { paymentMethod: { $ne: "refund" } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const refundAmount = await Receipt.aggregate([
      {
        $match: {
          $or: [
            { status: "refunded" },
            { type: "refund" },
            { paymentMethod: "refund" },
          ],
        },
      },
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
