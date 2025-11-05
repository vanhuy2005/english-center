const express = require("express");
const makeupClassController = require("../controllers/makeupClassController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Routes cho học viên
router.get("/my-requests", protect, makeupClassController.getMyMakeupRequests);
router.post("/", protect, makeupClassController.createMakeupRequest);
router.put("/:id", protect, makeupClassController.updateMakeupRequest);
router.delete("/:id", protect, makeupClassController.deleteMakeupRequest);

// Routes cho nhân viên/admin
router.get("/", makeupClassController.getAllMakeupRequests);
router.get("/:id", makeupClassController.getMakeupRequestById);
router.put("/:id/approve", makeupClassController.approveMakeupRequest);
router.put("/:id/reject", makeupClassController.rejectMakeupRequest);

module.exports = router;
