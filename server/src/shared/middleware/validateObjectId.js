const mongoose = require("mongoose");

// Validate MongoDB ObjectId
function validateObjectId(req, res, next) {
  const { id, studentId } = req.params;
  const idToValidate = id || studentId;

  if (!idToValidate) {
    return res.status(400).json({
      success: false,
      message: "Missing ID parameter.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(idToValidate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }
  next();
}

module.exports = validateObjectId;
