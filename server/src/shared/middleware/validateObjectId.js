const mongoose = require("mongoose");

// Validate MongoDB ObjectId
function validateObjectId(req, res, next) {
  const params = req.params || {};
  const keys = Object.keys(params);

  if (keys.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Missing ID parameter.",
    });
  }

  // Prefer common param names, otherwise take the first param value
  const idToValidate =
    params.id ||
    params.studentId ||
    params.classId ||
    params.scheduleId ||
    params[keys[0]];

  if (!mongoose.Types.ObjectId.isValid(idToValidate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }

  next();
}

module.exports = validateObjectId;
