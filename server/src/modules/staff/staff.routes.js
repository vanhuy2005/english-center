const express = require("express");
const router = express.Router();
const staffController = require("./staff.controller");

// Temporarily remove authentication for testing
// const { authenticate } = require("../../shared/middleware/auth.middleware");
// router.use(authenticate);

// Routes
router.get("/", staffController.getAllStaffs);
router.get("/:id", staffController.getStaffById);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);

module.exports = router;
