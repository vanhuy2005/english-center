
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import Models
const Student = require("../src/shared/models/Student.model");
const Class = require("../src/shared/models/Class.model");
const Course = require("../src/shared/models/Course.model");
const Attendance = require("../src/shared/models/Attendance.model");
const Grade = require("../src/shared/models/Grade.model");
const Notification = require("../src/shared/models/Notification.model");
const Request = require("../src/shared/models/Request.model");
// Check if Finance/Payment models exist and are used. Based on file list:
// Finance.model.js, Payment.model.js, Receipt.model.js, TuitionFee.model.js
// I'll check how finance is handled. Usually Receipt or Payment.
const Receipt = require("../src/shared/models/Receipt.model"); 

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function seedStudentHV00088() {
  try {
    console.log("🚀 Starting seed for student HV00088...");

    // 1. Create/Update Student
    const studentCode = "HV00088";
    const defaultPassword = await bcrypt.hash("123456", 10);
    
    let student = await Student.findOne({ studentCode });
    
    const studentData = {
      studentCode,
      fullName: "Tung tung tung sahur",
      email: "tungtungtung@example.com",
      phone: "0988888888",
      password: defaultPassword,
      dateOfBirth: new Date("2000-01-01"),
      gender: "male",
      address: "123 English Street, Hanoi",
      status: "active",
      academicStatus: "active",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HV00088"
    };

    if (!student) {
      student = await Student.create(studentData);
      console.log("✅ Created student HV00088");
    } else {
      Object.assign(student, studentData);
      await student.save();
      console.log("✅ Updated student HV00088");
    }

    // 2. Enroll in Courses/Classes
    // Ensure we have some courses
    let course = await Course.findOne({ courseCode: "IELTS-7.0" });
    if (!course) {
        course = await Course.create({
            name: "IELTS Master 7.0+",
            courseCode: "IELTS-7.0",
            description: "Advanced IELTS Preparation",
            level: "advanced",
            fee: { amount: 5000000, currency: "VND" },
            duration: { weeks: 12, hours: 48 }
        });
    }

    // Ensure we have a class
    let cls = await Class.findOne({ classCode: "CLS-IELTS-01" });
    if (!cls) {
        cls = await Class.create({
            name: "IELTS Advanced K1",
            classCode: "CLS-IELTS-01",
            course: course._id,
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-04-01"),
            status: "ongoing",
            schedule: [
                { dayOfWeek: 2, startTime: "18:00", endTime: "20:00", room: "R202" }, // Mon
                { dayOfWeek: 4, startTime: "18:00", endTime: "20:00", room: "R202" }, // Wed
                { dayOfWeek: 6, startTime: "18:00", endTime: "20:00", room: "R202" }  // Fri
            ],
            capacity: { max: 20, current: 0 }
        });
    }

    // Enroll student if not already enrolled
    const isEnrolled = cls.students.some(s => s.student.toString() === student._id.toString());
    if (!isEnrolled) {
        cls.students.push({ student: student._id, status: "active", enrolledAt: new Date() });
        cls.capacity.current += 1;
        await cls.save();
        
        // Update student enrolledCourses
        if (!student.enrolledCourses.includes(course._id)) {
            student.enrolledCourses.push(course._id);
            await student.save();
        }
        console.log("✅ Enrolled student in class CLS-IELTS-01");
    }

    // 3. Create Attendance Records
    // Create some past attendance
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i * 2); // Every 2 days back
        
        const exists = await Attendance.findOne({ student: student._id, class: cls._id, date: { $gte: new Date(date.setHours(0,0,0,0)), $lt: new Date(date.setHours(23,59,59,999)) } });
        if (!exists) {
            await Attendance.create({
                student: student._id,
                class: cls._id,
                date: date,
                status: i === 2 ? "absent" : "present", // One absent
                note: i === 2 ? "Sick leave" : ""
            });
        }
    }
    console.log("✅ Created attendance records");

    // 4. Create Grades
    // Grade model structure is different from what I assumed.
    // It has 'scores' object with components (attendance, participation, homework, midterm, final)
    // and 'weights'. It calculates totalScore automatically.
    // It seems to be one Grade document per student per class/course.
    
    let grade = await Grade.findOne({ student: student._id, class: cls._id });
    if (!grade) {
        grade = await Grade.create({
            student: student._id,
            class: cls._id,
            course: course._id,
            scores: {
                attendance: 95,
                participation: 90,
                homework: 85,
                midterm: 8.5, // Wait, weights are usually percentage, but scores might be 0-100 or 0-10.
                // Looking at the model: min: 0, max: 100. So 8.5 might be low if it's out of 100.
                // Let's assume 0-100 scale based on letter grade calculation (>=90 is A+).
                midterm: 85,
                final: 90,
                listening: 80,
                speaking: 90,
                reading: 85,
                writing: 88
            },
            weights: {
                attendance: 10,
                participation: 10,
                homework: 20,
                midterm: 20,
                final: 40
            },
            status: "in_progress",
            teacherComment: "Excellent student, very active in class."
        });
        console.log("✅ Created grade record");
    } else {
        // Update existing grade
        grade.scores = {
            attendance: 95,
            participation: 90,
            homework: 85,
            midterm: 85,
            final: 90,
            listening: 80,
            speaking: 90,
            reading: 85,
            writing: 88
        };
        await grade.save();
        console.log("✅ Updated grade record");
    }

    // 5. Create Notifications
    const notifs = [
        { title: "Welcome to English Hub", message: "Welcome Tung tung tung sahur to our center!", type: "system" },
        { title: "Class Schedule Update", message: "Your class IELTS Advanced K1 starts next week.", type: "class_schedule" },
        { title: "Tuition Payment Reminder", message: "Please complete your tuition payment for the new course.", type: "payment_reminder" }
    ];

    for (const n of notifs) {
        await Notification.create({
            recipient: student._id,
            recipientModel: "Student",
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: false,
            createdAt: new Date()
        });
    }
    console.log("✅ Created notifications");

    // 6. Create Requests (Mock)
    const reqExists = await Request.findOne({ student: student._id });
    if (!reqExists) {
        await Request.create({
            student: student._id,
            class: cls._id,
            type: "leave",
            reason: "Personal family matter",
            status: "pending",
            startDate: new Date(today.getTime() + 86400000), // Tomorrow
            createdAt: new Date()
        });
        console.log("✅ Created sample request");
    }

    // 7. Finance/Receipts
    try {
        // Need a staff to be 'createdBy'
        const Staff = require("../src/shared/models/Staff.model");
        let staff = await Staff.findOne({ staffType: "accountant" });
        if (!staff) {
            staff = await Staff.findOne(); // Fallback to any staff
        }
        
        if (staff) {
            const receiptExists = await Receipt.findOne({ student: student._id });
            if (!receiptExists) {
                await Receipt.create({
                    student: student._id,
                    class: cls._id,
                    amount: 5000000,
                    paymentMethod: "bank_transfer", // Correct enum
                    status: "active", // Correct enum
                    description: "Tuition for IELTS Advanced K1",
                    createdBy: staff._id,
                    createdAt: new Date()
                });
                console.log("✅ Created receipt record");
            }
        } else {
            console.log("⚠️ No staff found to create receipt");
        }
    } catch (e) {
        console.log("⚠️ Could not create receipt:", e.message);
    }

    console.log("🎉 Seed for HV00088 completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

connectDB().then(seedStudentHV00088);
