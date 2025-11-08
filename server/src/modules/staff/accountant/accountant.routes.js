const express = require("express");
const router = express.Router();
const accountantController = require("./accountant.controller");
const {
  protect,
  authorize,
} = require("../../../shared/middleware/auth.middleware");

// All routes require authentication and accountant or director role
router.use(protect);
router.use(authorize(["accountant", "director"]));

// ==================== DASHBOARD ====================
router.get("/dashboard", accountantController.getDashboard);

// ==================== TUITION MANAGEMENT ====================
router.get("/tuition", accountantController.getTuitionFees);
router.get(
  "/tuition/student/:studentId",
  accountantController.getStudentTuition
);
router.put("/tuition/:id", accountantController.updateTuitionFee);

// ==================== RECEIPTS ====================
router.get("/receipts", accountantController.getReceipts);
router.get("/receipts/:id", accountantController.getReceiptDetails);
router.post("/receipts", accountantController.createReceipt);
router.delete("/receipts/:id", accountantController.deleteReceipt);

// ==================== PAYMENTS ====================
router.get("/payments", accountantController.getPayments);
router.post("/payments/confirm", accountantController.confirmPayment);
router.post("/payments/refund", accountantController.processRefund);

// ==================== REPORTS ====================
router.get("/reports/revenue", accountantController.getRevenueReport);
router.get("/reports/debt", accountantController.getDebtReport);
router.post("/reports/export", accountantController.exportFinancialReport);

// ==================== STATISTICS ====================
router.get("/statistics/revenue", accountantController.getRevenueStatistics);
router.get("/statistics/overview", accountantController.getFinancialOverview);

module.exports = router;
