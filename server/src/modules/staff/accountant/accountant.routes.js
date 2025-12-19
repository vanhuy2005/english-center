const express = require("express");
const router = express.Router();
const accountantController = require("./accountant.controller");
const { protect } = require("../../../shared/middleware/auth.middleware");

// All routes require authentication
router.use(protect);

// ==================== DASHBOARD ====================
router.get("/dashboard", accountantController.getDashboard);

// ==================== TRANSACTIONS ====================
router.get("/transactions", accountantController.getTransactions);
router.get("/transactions/:id", accountantController.getTransactionById);
router.post("/transactions", accountantController.createTransaction);
router.put("/transactions/:id", accountantController.updateTransaction);

// ==================== PAYMENT OPERATIONS ====================
router.post("/transactions/:id/payment", accountantController.recordPayment);
router.post("/transactions/:id/receipt", accountantController.issueReceipt);

// ==================== STUDENT PAYMENTS ====================
router.get(
  "/students/:studentId/payments",
  accountantController.getStudentPayments
);

// ==================== REPORTS ====================
router.get("/reports/financial", accountantController.getFinancialReport);
router.post("/reports/export", accountantController.exportReport);
router.get("/reports/debug/receipts", accountantController.checkReceiptData);

module.exports = router;
