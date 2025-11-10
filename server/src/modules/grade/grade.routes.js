const express = require("express");
const router = express.Router();
const {
  getAllGrades,
  getGradeById,
  createOrUpdateGrade,
  updateGrade,
  togglePublishGrade,
  deleteGrade,
  getStudentTranscript,
  getClassGradeReport,
  getClassAverage,
  bulkImportGrades,
} = require("./grade.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");
const validateObjectId = require("../../shared/middleware/validateObjectId");

// All routes require authentication
router.use(protect);

// Get all grades & create/update grade
router
  .route("/")
  .get(getAllGrades)
  .post(authorize("director", "academic", "teacher"), createOrUpdateGrade);

// Bulk import grades
router
  .route("/bulk-import")
  .post(authorize("director", "academic", "teacher"), bulkImportGrades);

// Get student transcript
router
  .route("/student/:studentId/transcript")
  .get(validateObjectId, getStudentTranscript);

// Get class grade report
router
  .route("/class/:classId/report")
  .get(validateObjectId, getClassGradeReport);

// Get class average
router.route("/class/:classId/average").get(validateObjectId, getClassAverage);

// Publish/unpublish grade
router
  .route("/:id/publish")
  .patch(
    validateObjectId,
    authorize("director", "academic", "teacher"),
    togglePublishGrade
  );

// Get, update, delete specific grade
router
  .route("/:id")
  .get(validateObjectId, getGradeById)
  .put(
    validateObjectId,
    authorize("director", "academic", "teacher"),
    updateGrade
  )
  .delete(validateObjectId, authorize("director", "academic"), deleteGrade);

module.exports = router;
