const express = require("express");
const router = express.Router();
const requestController = require("./request.controller");
const {
  protect,
  authorize,
} = require("../../../shared/middleware/auth.middleware");

// All routes require authentication
router.use(protect);
// TODO: Add authorize("academic") after fixing the issue
// router.use(authorize("academic"));

// @route   GET /api/staff/academic/requests/stats
router.get("/stats", requestController.getRequestStats);

// @route   GET /api/staff/academic/requests
router.get("/", requestController.getAllRequests);

// @route   GET /api/staff/academic/requests/:id
router.get("/:id", requestController.getRequestById);

// @route   PUT /api/staff/academic/requests/:id/approve
router.put("/:id/approve", requestController.approveRequest);

// @route   PUT /api/staff/academic/requests/:id/reject
router.put("/:id/reject", requestController.rejectRequest);

module.exports = router;
