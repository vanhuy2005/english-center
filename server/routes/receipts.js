const express = require("express");
const router = express.Router();
const Receipt = require("../src/shared/models/Receipt.model");
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

      res.json({
        success: true,
        message: "Lấy thống kê thành công",
        totalAmount,
        totalReceipts,
        byMethod,
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

// Get all receipts
router.get(
  "/",
  auth,
  checkRole(["accountant", "director"]),
  async (req, res) => {
    try {
      const {
        search,
        type,
        paymentMethod,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = req.query;

      const query = { status: "active" };

      // Search by receipt number or student info
      if (search) {
        query.$or = [{ receiptNumber: { $regex: search, $options: "i" } }];
      }

      if (paymentMethod) query.paymentMethod = paymentMethod;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const receipts = await Receipt.find(query)
        .populate("student", "studentCode fullName email phone")
        .populate("createdBy", "fullName")
        .populate("class", "name classCode")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Receipt.countDocuments(query);

      res.json({
        success: true,
        message: "Lấy danh sách phiếu thu thành công",
        receipts,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      });
    } catch (error) {
      console.error("Error fetching receipts:", error);
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
      const receipt = await Receipt.findById(req.params.id)
        .populate("student", "studentCode fullName email phone")
        .populate("createdBy", "fullName")
        .populate("class", "name classCode");

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
      console.error("Error fetching receipt:", error);
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
      const { studentId, amount, paymentMethod, description, note, classId } =
        req.body;

      // Validate required fields
      if (!studentId || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc: studentId, amount, paymentMethod",
        });
      }

      const receipt = new Receipt({
        student: studentId,
        amount,
        paymentMethod,
        description,
        note,
        class: classId,
        createdBy: req.user._id,
      });

      await receipt.save();
      await receipt.populate("student", "studentCode fullName");
      await receipt.populate("createdBy", "fullName");

      res.status(201).json({
        success: true,
        message: "Tạo phiếu thu thành công",
        data: receipt,
      });
    } catch (error) {
      console.error("Error creating receipt:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo phiếu thu",
        error: error.message,
      });
    }
  }
);

module.exports = router;
