const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth");

// Accountant Dashboard
router.get(
  "/accountant/dashboard",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      const Receipt = require("../src/shared/models/Receipt.model");
      const TuitionFee = require("../src/shared/models/TuitionFee.model");
      const Payment = require("../src/shared/models/Payment.model");

      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Total receipts this month
      const receiptsThisMonth = await Receipt.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: "active",
      });

      // Total revenue this month
      const revenueResult = await Receipt.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: "active",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);
      const revenueThisMonth = revenueResult[0]?.total || 0;

      // Pending tuition fees
      const pendingTuitions = await TuitionFee.countDocuments({
        status: { $in: ["unpaid", "partial"] },
      });

      // Overdue tuitions
      const overdueTuitions = await TuitionFee.countDocuments({
        status: { $in: ["unpaid", "partial"] },
        dueDate: { $lt: now },
      });

      // Recent receipts
      const recentReceipts = await Receipt.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("student", "studentCode fullName")
        .populate("class", "name classCode");

      // Revenue by payment method
      const revenueByMethod = await Receipt.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: "active",
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({
        success: true,
        message: "Lấy thông tin dashboard thành công",
        data: {
          statistics: {
            receiptsThisMonth,
            revenueThisMonth,
            pendingTuitions,
            overdueTuitions,
          },
          recentReceipts,
          revenueByMethod,
        },
      });
    } catch (error) {
      console.error("Error fetching accountant dashboard:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tải dashboard",
        error: error.message,
      });
    }
  }
);

module.exports = router;
