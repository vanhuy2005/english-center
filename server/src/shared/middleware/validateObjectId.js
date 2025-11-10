const mongoose = require("mongoose");

// Validate MongoDB ObjectId
function validateObjectId(req, res, next) {
  const { studentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid studentId format.",
    });
  }
  next();
}

module.exports = validateObjectId;
