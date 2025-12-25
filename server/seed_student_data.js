const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");
const Course = require("./src/shared/models/Course.model");
const Class = require("./src/shared/models/Class.model");
const Schedule = require("./src/shared/models/Schedule.model");
const Grade = require("./src/shared/models/Grade.model");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const phone = "0900000001";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.error("Student not found! Please run create_login_student.js first.");
      process.exit(1);
    }

    console.log(`Found student: ${student.fullName}`);

    // 1. Create Course
    let course = await Course.findOne({ courseCode: "ENG-BASIC-001" });
    if (!course) {
      course = await Course.create({
        courseCode: "ENG-BASIC-001",
        name: "English Communication Basic",
        level: "elementary",
        duration: { hours: 48, weeks: 12 },
        fee: { amount: 3000000 },
        description: "Basic communication skills"
      });
      console.log("Created Course");
    }

    // 2. Create Class
    let classObj = await Class.findOne({ classCode: "EC-001" });
    if (!classObj) {
      classObj = await Class.create({
        classCode: "EC-001",
        name: "English Basic 01",
        course: course._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: "ongoing",
        schedule: [
          { dayOfWeek: 1, startTime: "18:00", endTime: "19:30", room: "101" },
          { dayOfWeek: 3, startTime: "18:00", endTime: "19:30", room: "101" },
          { dayOfWeek: 5, startTime: "18:00", endTime: "19:30", room: "101" }
        ],
        room: "101",
        students: []
      });
      console.log("Created Class");
    }

    // 3. Add Student to Class
    const isEnrolled = classObj.students.some(s => s.student.toString() === student._id.toString());
    if (!isEnrolled) {
      classObj.students.push({
        student: student._id,
        status: "active",
        enrolledDate: new Date()
      });
      await classObj.save();
      console.log("Added student to Class");
    }

    // Update student enrolledCourses
    if (!student.enrolledCourses.includes(course._id)) {
      student.enrolledCourses.push(course._id);
      await student.save();
    }

    // 4. Create Schedules (Today and Tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = [
      {
        class: classObj._id,
        date: today,
        startTime: "18:00",
        endTime: "19:30",
        room: "101",
        type: "class",
        status: "scheduled"
      },
      {
        class: classObj._id,
        date: tomorrow,
        startTime: "18:00",
        endTime: "19:30",
        room: "101",
        type: "class",
        status: "scheduled"
      }
    ];

    for (const s of schedules) {
      const exists = await Schedule.findOne({ class: classObj._id, date: { $gte: new Date(s.date.setHours(0,0,0,0)), $lt: new Date(s.date.setHours(23,59,59,999)) } });
      if (!exists) {
        await Schedule.create(s);
        console.log(`Created Schedule for ${s.date.toDateString()}`);
      }
    }

    // 5. Create Grade
    const grade = await Grade.findOne({ student: student._id, class: classObj._id });
    if (!grade) {
      await Grade.create({
        student: student._id,
        class: classObj._id,
        course: course._id,
        scores: {
          midterm: 8.5,
          final: 9.0,
          attendance: 10,
          participation: 9,
          homework: 9
        },
        weights: {
          midterm: 30,
          final: 40,
          attendance: 10,
          participation: 10,
          homework: 10
        },
        isPublished: true
      });
      console.log("Created Grade");
    }

    console.log("Seed completed successfully!");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
};

seedData();
