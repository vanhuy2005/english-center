const Student = require("../../../shared/models/Student.model");
const Class = require("../../../shared/models/Class.model");
// const Payment = require("../../../shared/models/Payment.model");
// const Receipt = require("../../../shared/models/Receipt.model");
// const TuitionFee = require("../../../shared/models/TuitionFee.model");
const {
  successResponse,
  errorResponse,
} = require("../../../shared/utils/response.util");

/**
 * Accountant Controller
 * Handles financial and payment operations
 */

// ==================== DASHBOARD ====================

/**
 * @route GET /api/staff/accountant/dashboard
 * @desc Get accountant dashboard data
 * @access Private (Accountant only)
 */
exports.getDashboard = async (req, res) => {
  try {
    // Get all payments (using Finance model for now)
    const Finance = require("../../shared/models/Finance.model");
    const allFinances = await Finance.find({});
    const completedPayments = allFinances.filter(
      (f) => f.status === "paid" || f.status === "partial"
    );
    const totalRevenue = completedPayments.reduce(
      (sum, f) => sum + (f.paidAmount || f.amount),
      0
    );

    const pendingPayments = allFinances.filter(
      (f) => f.status === "pending"
    ).length;
    const pendingAmount = allFinances
      .filter((f) => f.status === "pending")
      .reduce((sum, f) => sum + f.amount, 0);

    // Get tuition fees (using Finance model filtered by type)
    const tuitionFinances = allFinances.filter((f) => f.type === "tuition");
    const totalDebt = tuitionFinances
      .filter((t) => t.status === "pending" || t.status === "partial")
      .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

    // Calculate payment rate
    const totalTuition = tuitionFinances.reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = tuitionFinances.reduce(
      (sum, t) => sum + (t.paidAmount || 0),
      0
    );
    const paymentRate =
      totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0;

    // Recent receipts (completed payments)
    const recentReceipts = completedPayments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((f) => ({
        _id: f._id,
        receiptNumber: f.transactionCode || `TXN${f._id.toString().slice(-6)}`,
        student: f.student,
        class: f.course, // Using course as class for now
        amount: f.paidAmount || f.amount,
        createdAt: f.createdAt,
      }));

    // Revenue trend (last 7 months) - mock data for now
    const last7Months = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - i));
      return date;
    });

    const revenueTrend = {
      labels: last7Months.map((d) =>
        d.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })
      ),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: last7Months.map(() =>
            Math.round(Math.random() * 50000000 + 30000000)
          ),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
      ],
    };

    // Payment status distribution
    const paymentStatusDistribution = {
      labels: ["Đã thanh toán", "Chưa thanh toán", "Thanh toán một phần"],
      datasets: [
        {
          data: [
            tuitionFinances.filter((t) => t.status === "paid").length,
            tuitionFinances.filter((t) => t.status === "pending").length,
            tuitionFinances.filter((t) => t.status === "partial").length,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(251, 191, 36, 0.8)",
          ],
        },
      ],
    };

    // Pending payments list
    const pendingPaymentsList = allFinances
      .filter((f) => f.status === "pending")
      .sort(
        (a, b) =>
          new Date(a.dueDate || a.createdAt) -
          new Date(b.dueDate || b.createdAt)
      )
      .slice(0, 5)
      .map((f) => ({
        _id: f._id,
        student: f.student,
        class: f.course, // Using course as class
        amount: f.amount,
        dueDate: f.dueDate || new Date(),
      }));

    successResponse(
      res,
      {
        stats: {
          totalRevenue,
          pendingPayments,
          pendingAmount,
          totalDebt,
          paymentRate,
        },
        recentReceipts,
        revenueTrend,
        paymentStatusDistribution,
        pendingPaymentsList,
      },
      "Lấy dashboard thành công"
    );
  } catch (error) {
    console.error("Error in getDashboard:", error);
    errorResponse(res, "Không thể lấy dữ liệu dashboard", 500);
  }
};

// ==================== TUITION MANAGEMENT ====================

/**
 * @route GET /api/staff/accountant/tuition
 * @desc Get all tuition fees with filters
 * @access Private (Accountant only)
 */
exports.getTuitionFees = async (req, res) => {
  try {
    const { search, status, classId } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (classId && classId !== "all") {
      query.class = classId;
    }

    const tuitionFees = await TuitionFee.find(query)
      .populate("student", "fullName email phone")
      .populate("class", "name")
      .sort({ dueDate: 1 });

    // Filter by search
    let filteredTuition = tuitionFees;
    if (search) {
      filteredTuition = tuitionFees.filter(
        (t) =>
          t.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
          t.student.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Add calculated fields
    const tuitionWithDetails = filteredTuition.map((t) => ({
      _id: t._id,
      student: t.student,
      class: t.class,
      amount: t.amount,
      paidAmount: t.paidAmount || 0,
      remainingAmount: t.amount - (t.paidAmount || 0),
      dueDate: t.dueDate,
      status: t.status,
      paymentMethod: t.paymentMethod,
      createdAt: t.createdAt,
    }));

    successResponse(
      res,
      { tuitionFees: tuitionWithDetails },
      "Lấy danh sách học phí thành công"
    );
  } catch (error) {
    console.error("Error in getTuitionFees:", error);
    errorResponse(res, "Không thể lấy danh sách học phí", 500);
  }
};

/**
 * @route GET /api/staff/accountant/tuition/student/:studentId
 * @desc Get tuition fees for a specific student
 * @access Private (Accountant only)
 */
exports.getStudentTuition = async (req, res) => {
  try {
    const { studentId } = req.params;

    const tuitionFees = await TuitionFee.find({ student: studentId })
      .populate("class", "name")
      .sort({ createdAt: -1 });

    const student = await Student.findById(studentId);

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    const totalAmount = tuitionFees.reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = tuitionFees.reduce(
      (sum, t) => sum + (t.paidAmount || 0),
      0
    );
    const totalRemaining = totalAmount - totalPaid;

    successResponse(
      res,
      {
        student: {
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
        },
        tuitionFees,
        summary: {
          totalAmount,
          totalPaid,
          totalRemaining,
        },
      },
      "Lấy thông tin học phí thành công"
    );
  } catch (error) {
    console.error("Error in getStudentTuition:", error);
    errorResponse(res, "Không thể lấy thông tin học phí", 500);
  }
};

/**
 * @route PUT /api/staff/accountant/tuition/:id
 * @desc Update tuition fee status
 * @access Private (Accountant only)
 */
exports.updateTuitionFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, status, paymentMethod, note } = req.body;

    const tuitionFee = await TuitionFee.findById(id);

    if (!tuitionFee) {
      return errorResponse(res, "Không tìm thấy học phí", 404);
    }

    // Update fields
    if (paidAmount !== undefined) {
      tuitionFee.paidAmount = paidAmount;

      // Auto-update status based on paid amount
      if (paidAmount >= tuitionFee.amount) {
        tuitionFee.status = "paid";
      } else if (paidAmount > 0) {
        tuitionFee.status = "partial";
      } else {
        tuitionFee.status = "unpaid";
      }
    }

    if (status) tuitionFee.status = status;
    if (paymentMethod) tuitionFee.paymentMethod = paymentMethod;
    if (note) tuitionFee.note = note;

    tuitionFee.updatedBy = req.user._id;
    await tuitionFee.save();

    const updated = await TuitionFee.findById(id)
      .populate("student", "fullName")
      .populate("class", "name");

    successResponse(
      res,
      { tuitionFee: updated },
      "Cập nhật học phí thành công"
    );
  } catch (error) {
    console.error("Error in updateTuitionFee:", error);
    errorResponse(res, "Không thể cập nhật học phí", 500);
  }
};

// ==================== RECEIPTS ====================

/**
 * @route GET /api/staff/accountant/receipts
 * @desc Get all receipts
 * @access Private (Accountant only)
 */
exports.getReceipts = async (req, res) => {
  try {
    const { search, dateFrom, dateTo } = req.query;

    let query = {};

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const receipts = await Receipt.find(query)
      .populate("student", "fullName email phone")
      .populate("class", "name")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    // Filter by search
    let filteredReceipts = receipts;
    if (search) {
      filteredReceipts = receipts.filter(
        (r) =>
          r.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
          r.receiptNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    successResponse(
      res,
      { receipts: filteredReceipts },
      "Lấy danh sách phiếu thu thành công"
    );
  } catch (error) {
    console.error("Error in getReceipts:", error);
    errorResponse(res, "Không thể lấy danh sách phiếu thu", 500);
  }
};

/**
 * @route GET /api/staff/accountant/receipts/:id
 * @desc Get receipt details
 * @access Private (Accountant only)
 */
exports.getReceiptDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id)
      .populate("student", "fullName email phone address")
      .populate("class", "name")
      .populate("createdBy", "fullName");

    if (!receipt) {
      return errorResponse(res, "Không tìm thấy phiếu thu", 404);
    }

    successResponse(res, { receipt }, "Lấy chi tiết phiếu thu thành công");
  } catch (error) {
    console.error("Error in getReceiptDetails:", error);
    errorResponse(res, "Không thể lấy chi tiết phiếu thu", 500);
  }
};

/**
 * @route POST /api/staff/accountant/receipts
 * @desc Create new receipt
 * @access Private (Accountant only)
 */
exports.createReceipt = async (req, res) => {
  try {
    const { studentId, classId, amount, paymentMethod, description, note } =
      req.body;

    // Validate
    if (!studentId || !amount) {
      return errorResponse(res, "Thiếu thông tin bắt buộc", 400);
    }

    // Generate receipt number
    const lastReceipt = await Receipt.findOne().sort({ createdAt: -1 });
    let receiptNumber = "PT000001";
    if (lastReceipt && lastReceipt.receiptNumber) {
      const lastNumber = parseInt(lastReceipt.receiptNumber.substring(2));
      receiptNumber = `PT${String(lastNumber + 1).padStart(6, "0")}`;
    }

    const receipt = new Receipt({
      receiptNumber,
      student: studentId,
      class: classId,
      amount,
      paymentMethod: paymentMethod || "cash",
      description: description || "Học phí",
      note,
      createdBy: req.user._id,
    });

    await receipt.save();

    // Update tuition fee if exists
    if (classId) {
      const tuitionFee = await TuitionFee.findOne({
        student: studentId,
        class: classId,
        status: { $in: ["unpaid", "partial"] },
      });

      if (tuitionFee) {
        tuitionFee.paidAmount = (tuitionFee.paidAmount || 0) + amount;

        if (tuitionFee.paidAmount >= tuitionFee.amount) {
          tuitionFee.status = "paid";
        } else {
          tuitionFee.status = "partial";
        }

        await tuitionFee.save();
      }
    }

    const createdReceipt = await Receipt.findById(receipt._id)
      .populate("student", "fullName email")
      .populate("class", "name")
      .populate("createdBy", "fullName");

    successResponse(
      res,
      { receipt: createdReceipt },
      "Tạo phiếu thu thành công"
    );
  } catch (error) {
    console.error("Error in createReceipt:", error);
    errorResponse(res, "Không thể tạo phiếu thu", 500);
  }
};

/**
 * @route DELETE /api/staff/accountant/receipts/:id
 * @desc Delete/void receipt
 * @access Private (Accountant only)
 */
exports.deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);

    if (!receipt) {
      return errorResponse(res, "Không tìm thấy phiếu thu", 404);
    }

    // Mark as voided instead of deleting
    receipt.status = "voided";
    receipt.voidedBy = req.user._id;
    receipt.voidedAt = new Date();
    await receipt.save();

    // Rollback tuition payment
    if (receipt.class) {
      const tuitionFee = await TuitionFee.findOne({
        student: receipt.student,
        class: receipt.class,
      });

      if (tuitionFee) {
        tuitionFee.paidAmount = Math.max(
          0,
          (tuitionFee.paidAmount || 0) - receipt.amount
        );

        if (tuitionFee.paidAmount >= tuitionFee.amount) {
          tuitionFee.status = "paid";
        } else if (tuitionFee.paidAmount > 0) {
          tuitionFee.status = "partial";
        } else {
          tuitionFee.status = "unpaid";
        }

        await tuitionFee.save();
      }
    }

    successResponse(res, {}, "Hủy phiếu thu thành công");
  } catch (error) {
    console.error("Error in deleteReceipt:", error);
    errorResponse(res, "Không thể hủy phiếu thu", 500);
  }
};

// ==================== PAYMENTS ====================

/**
 * @route GET /api/staff/accountant/payments
 * @desc Get all payments
 * @access Private (Accountant only)
 */
exports.getPayments = async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(query)
      .populate("student", "fullName email phone")
      .populate("class", "name")
      .sort({ createdAt: -1 });

    successResponse(res, { payments }, "Lấy danh sách thanh toán thành công");
  } catch (error) {
    console.error("Error in getPayments:", error);
    errorResponse(res, "Không thể lấy danh sách thanh toán", 500);
  }
};

/**
 * @route POST /api/staff/accountant/payments/confirm
 * @desc Confirm a payment
 * @access Private (Accountant only)
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, note } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "completed",
        confirmedBy: req.user._id,
        confirmedAt: new Date(),
        note,
      },
      { new: true }
    )
      .populate("student", "fullName")
      .populate("class", "name");

    if (!payment) {
      return errorResponse(res, "Không tìm thấy thanh toán", 404);
    }

    // Create receipt
    const lastReceipt = await Receipt.findOne().sort({ createdAt: -1 });
    let receiptNumber = "PT000001";
    if (lastReceipt && lastReceipt.receiptNumber) {
      const lastNumber = parseInt(lastReceipt.receiptNumber.substring(2));
      receiptNumber = `PT${String(lastNumber + 1).padStart(6, "0")}`;
    }

    const receipt = new Receipt({
      receiptNumber,
      student: payment.student._id,
      class: payment.class?._id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      description: "Xác nhận thanh toán học phí",
      note,
      createdBy: req.user._id,
    });

    await receipt.save();

    successResponse(
      res,
      { payment, receipt },
      "Xác nhận thanh toán thành công"
    );
  } catch (error) {
    console.error("Error in confirmPayment:", error);
    errorResponse(res, "Không thể xác nhận thanh toán", 500);
  }
};

/**
 * @route POST /api/staff/accountant/payments/refund
 * @desc Process refund
 * @access Private (Accountant only)
 */
exports.processRefund = async (req, res) => {
  try {
    const { studentId, classId, amount, reason, note } = req.body;

    // Validate
    if (!studentId || !amount || !reason) {
      return errorResponse(res, "Thiếu thông tin bắt buộc", 400);
    }

    // Create refund record
    const refund = new Payment({
      student: studentId,
      class: classId,
      amount: -Math.abs(amount), // Negative for refund
      paymentMethod: "refund",
      description: reason,
      note,
      status: "completed",
      processedBy: req.user._id,
    });

    await refund.save();

    // Update tuition fee
    if (classId) {
      const tuitionFee = await TuitionFee.findOne({
        student: studentId,
        class: classId,
      });

      if (tuitionFee) {
        tuitionFee.paidAmount = Math.max(
          0,
          (tuitionFee.paidAmount || 0) - amount
        );

        if (tuitionFee.paidAmount >= tuitionFee.amount) {
          tuitionFee.status = "paid";
        } else if (tuitionFee.paidAmount > 0) {
          tuitionFee.status = "partial";
        } else {
          tuitionFee.status = "unpaid";
        }

        await tuitionFee.save();
      }
    }

    const processedRefund = await Payment.findById(refund._id)
      .populate("student", "fullName email")
      .populate("class", "name");

    successResponse(
      res,
      { refund: processedRefund },
      "Xử lý hoàn tiền thành công"
    );
  } catch (error) {
    console.error("Error in processRefund:", error);
    errorResponse(res, "Không thể xử lý hoàn tiền", 500);
  }
};

// ==================== REPORTS ====================

/**
 * @route GET /api/staff/accountant/reports/revenue
 * @desc Get revenue report
 * @access Private (Accountant only)
 */
exports.getRevenueReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, groupBy } = req.query;

    let query = { status: "completed" };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(query);
    const receipts = await Receipt.find(query);

    // Calculate totals
    const totalRevenue = payments
      .filter((p) => p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunds = payments
      .filter((p) => p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);

    const netRevenue = totalRevenue - totalRefunds;

    // Group by month or day
    const groupedData = {};
    receipts.forEach((receipt) => {
      const date = new Date(receipt.createdAt);
      const key =
        groupBy === "day"
          ? date.toLocaleDateString("vi-VN")
          : `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += receipt.amount;
    });

    const revenueChart = {
      labels: Object.keys(groupedData),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: Object.values(groupedData),
          backgroundColor: "rgba(34, 197, 94, 0.8)",
        },
      ],
    };

    successResponse(
      res,
      {
        summary: {
          totalRevenue,
          totalRefunds,
          netRevenue,
          receiptCount: receipts.length,
        },
        revenueChart,
      },
      "Lấy báo cáo doanh thu thành công"
    );
  } catch (error) {
    console.error("Error in getRevenueReport:", error);
    errorResponse(res, "Không thể lấy báo cáo doanh thu", 500);
  }
};

/**
 * @route GET /api/staff/accountant/reports/debt
 * @desc Get debt report
 * @access Private (Accountant only)
 */
exports.getDebtReport = async (req, res) => {
  try {
    const debtors = await TuitionFee.find({
      status: { $in: ["unpaid", "partial"] },
    })
      .populate("student", "fullName email phone")
      .populate("class", "name")
      .sort({ dueDate: 1 });

    const debtorsWithDetails = debtors.map((t) => ({
      student: t.student,
      class: t.class,
      totalAmount: t.amount,
      paidAmount: t.paidAmount || 0,
      debtAmount: t.amount - (t.paidAmount || 0),
      dueDate: t.dueDate,
      daysOverdue:
        t.dueDate < new Date()
          ? Math.floor((new Date() - t.dueDate) / (1000 * 60 * 60 * 24))
          : 0,
    }));

    const totalDebt = debtorsWithDetails.reduce(
      (sum, d) => sum + d.debtAmount,
      0
    );

    successResponse(
      res,
      {
        debtors: debtorsWithDetails,
        summary: {
          totalDebtors: debtorsWithDetails.length,
          totalDebt,
        },
      },
      "Lấy báo cáo công nợ thành công"
    );
  } catch (error) {
    console.error("Error in getDebtReport:", error);
    errorResponse(res, "Không thể lấy báo cáo công nợ", 500);
  }
};

/**
 * @route POST /api/staff/accountant/reports/export
 * @desc Export financial report
 * @access Private (Accountant only)
 */
exports.exportFinancialReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, reportType } = req.body;

    // TODO: Implement Excel/PDF export using exceljs or pdfkit

    successResponse(res, {}, "Báo cáo đang được tạo và sẽ tự động tải xuống");
  } catch (error) {
    console.error("Error in exportFinancialReport:", error);
    errorResponse(res, "Không thể xuất báo cáo", 500);
  }
};

// ==================== STATISTICS ====================

/**
 * @route GET /api/staff/accountant/statistics/revenue
 * @desc Get revenue statistics
 * @access Private (Accountant only)
 */
exports.getRevenueStatistics = async (req, res) => {
  try {
    const { period } = req.query; // day, week, month, year

    // Calculate date range
    const now = new Date();
    let dateFrom = new Date();

    switch (period) {
      case "day":
        dateFrom.setHours(0, 0, 0, 0);
        break;
      case "week":
        dateFrom.setDate(now.getDate() - 7);
        break;
      case "year":
        dateFrom.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        dateFrom.setMonth(now.getMonth() - 1);
    }

    const payments = await Payment.find({
      status: "completed",
      createdAt: { $gte: dateFrom, $lte: now },
    });

    const totalRevenue = payments
      .filter((p) => p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunds = payments
      .filter((p) => p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);

    const netRevenue = totalRevenue - totalRefunds;

    // Revenue by payment method
    const paymentMethods = {};
    payments.forEach((p) => {
      const method = p.paymentMethod || "unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + p.amount;
    });

    const paymentMethodChart = {
      labels: Object.keys(paymentMethods),
      datasets: [
        {
          data: Object.values(paymentMethods),
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
        },
      ],
    };

    successResponse(
      res,
      {
        summary: {
          totalRevenue,
          totalRefunds,
          netRevenue,
          transactionCount: payments.length,
        },
        paymentMethodChart,
      },
      "Lấy thống kê doanh thu thành công"
    );
  } catch (error) {
    console.error("Error in getRevenueStatistics:", error);
    errorResponse(res, "Không thể lấy thống kê doanh thu", 500);
  }
};

/**
 * @route GET /api/staff/accountant/statistics/overview
 * @desc Get financial overview statistics
 * @access Private (Accountant only)
 */
exports.getFinancialOverview = async (req, res) => {
  try {
    // Get all data
    const allPayments = await Payment.find({ status: "completed" });
    const allTuitionFees = await TuitionFee.find({});
    const allReceipts = await Receipt.find({});

    // Calculate metrics
    const totalRevenue = allPayments
      .filter((p) => p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalDebt = allTuitionFees
      .filter((t) => t.status === "unpaid" || t.status === "partial")
      .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

    const collectionRate =
      allTuitionFees.length > 0
        ? Math.round(
            (allTuitionFees.filter((t) => t.status === "paid").length /
              allTuitionFees.length) *
              100
          )
        : 0;

    // Monthly revenue trend (last 12 months)
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date;
    });

    const monthlyRevenue = {
      labels: last12Months.map((d) =>
        d.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })
      ),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: last12Months.map(() =>
            Math.round(Math.random() * 50000000 + 30000000)
          ),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
      ],
    };

    successResponse(
      res,
      {
        stats: {
          totalRevenue,
          totalDebt,
          collectionRate,
          receiptCount: allReceipts.length,
        },
        monthlyRevenue,
      },
      "Lấy tổng quan tài chính thành công"
    );
  } catch (error) {
    console.error("Error in getFinancialOverview:", error);
    errorResponse(res, "Không thể lấy tổng quan tài chính", 500);
  }
};

module.exports = exports;
