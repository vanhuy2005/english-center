const express = require("express");
const scheduleController = require("../controllers/scheduleController");

const router = express.Router();

router.get("/", scheduleController.getAllSchedules);
router.get("/room/:room", scheduleController.getSchedulesByRoom);
router.post("/", scheduleController.createSchedule);
router.put("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
