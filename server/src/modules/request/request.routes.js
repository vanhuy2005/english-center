const express = require("express");
const router = express.Router();
const {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  processRequest,
  cancelRequest,
  deleteRequest,
  getStudentRequests,
  getRequestStats,
} = require("./request.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");
const validateObjectId = require("../../shared/middleware/validateObjectId");

// All routes require authentication
router.use(protect);

// Get all requests & create new request
router.route("/").get(getAllRequests).post(createRequest);

// Get request statistics
router
  .route("/stats")
  .get(authorize("director", "academic", "accountant"), getRequestStats);

// Get student's requests
router.route("/student/:studentId").get(validateObjectId, getStudentRequests);

// Process request (approve/reject)
router
  .route("/:id/process")
  .patch(validateObjectId, authorize("director", "academic"), processRequest);

// Cancel request
router.route("/:id/cancel").patch(validateObjectId, cancelRequest);

// Get, update, delete specific request
router
  .route("/:id")
  .get(validateObjectId, getRequestById)
  .put(validateObjectId, updateRequest)
  .delete(validateObjectId, authorize("director"), deleteRequest);

module.exports = router;
