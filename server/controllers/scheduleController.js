const Schedule = require("../models/Schedule");

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({
      dayOfWeek: 1,
      startTime: 1,
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSchedulesByRoom = async (req, res) => {
  try {
    const schedules = await Schedule.find({ room: req.params.room }).sort({
      dayOfWeek: 1,
      startTime: 1,
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa lịch thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
