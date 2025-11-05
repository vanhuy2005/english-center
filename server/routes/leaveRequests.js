const express = require("express");
const leaveRequestController = require("../controllers/leaveRequestController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Routes cho học viên
router.get("/my-requests", protect, leaveRequestController.getMyLeaveRequests);
router.post("/", protect, leaveRequestController.createLeaveRequest);
router.put("/:id", protect, leaveRequestController.updateLeaveRequest);
router.delete("/:id", protect, leaveRequestController.deleteLeaveRequest);

// Routes cho nhân viên/admin
router.get("/", leaveRequestController.getAllLeaveRequests);
router.get("/:id", leaveRequestController.getLeaveRequestById);
router.put("/:id/approve", leaveRequestController.approveLeaveRequest);
router.put("/:id/reject", leaveRequestController.rejectLeaveRequest);

module.exports = router;
