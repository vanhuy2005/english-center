const express = require("express");
const router = express.Router();
const financeController = require("./finance.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");

// All routes require authentication
router.use(protect);

// Get my payments (student)
router.get(
  "/me/payments",
  authorize("student"),
  financeController.getMyPayments
);

// Get overview (director, accountant)
router.get(
  "/overview",
  authorize("director", "accountant"),
  financeController.getOverview
);

// Get all finance records (director, accountant)
router.get(
  "/",
  authorize("director", "accountant"),
  financeController.getAllFinance
);

const validateObjectId = require("../../shared/middleware/validateObjectId");
// Only allow finance_admin, staff, director, accountant, or the student themselves
router.get(
  "/student/:studentId",
  validateObjectId,
  authorize("finance_admin", "staff", "director", "accountant", "student"),
  financeController.getFinanceByStudent
);

// Create finance record (director, accountant, enrollment)
router.post(
  "/",
  authorize("director", "accountant", "enrollment"),
  financeController.createFinance
);

// Process payment (director, accountant)
router.post(
  "/:id/payment",
  authorize("director", "accountant"),
  financeController.processPayment
);

module.exports = router;
