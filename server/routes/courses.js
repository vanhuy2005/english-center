const express = require("express");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
