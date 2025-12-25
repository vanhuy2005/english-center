require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");
const Request = require("./src/shared/models/Request.model");
const Class = require("./src/shared/models/Class.model");
const Course = require("./src/shared/models/Course.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function checkStudent() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";

    // 1. Tìm student
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log(`❌ Không tìm thấy student với số điện thoại ${phone}`);
      process.exit(1);
    }

    console.log("📋 THÔNG TIN HỌC SINH:");
    console.log(`  - ID: ${student._id}`);
    console.log(`  - Họ tên: ${student.fullName}`);
    console.log(`  - Mã học viên: ${student.studentCode}`);
    console.log(`  - SĐT: ${student.phone}`);
    console.log(`  - Email: ${student.email || "N/A"}`);
    console.log(`  - Academic Status: ${student.academicStatus}`);
    console.log(`  - Số khóa học: ${student.enrolledCourses?.length || 0}`);

    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
      console.log("\n📚 DANH SÁCH KHÓA HỌC (IDs):");
      student.enrolledCourses.forEach((courseId, idx) => {
        console.log(`  ${idx + 1}. ${courseId}`);
      });

      // Populate courses manually
      const courses = await Course.find({
        _id: { $in: student.enrolledCourses },
      });
      console.log("\n📚 CHI TIẾT KHÓA HỌC:");
      courses.forEach((course, idx) => {
        console.log(`  ${idx + 1}. ${course.name} (${course.courseCode})`);
      });
    }

    // 2. Tìm các requests của student
    console.log("\n📝 DANH SÁCH YÊU CẦU:");
    const requests = await Request.find({ student: student._id })
      .populate("course", "name courseCode")
      .populate("assignedToClass", "name classCode")
      .sort({ createdAt: -1 });

    if (requests.length === 0) {
      console.log("  ⚠️  Không có yêu cầu nào");
    } else {
      requests.forEach((req, idx) => {
        console.log(`\n  ${idx + 1}. Request ID: ${req._id}`);
        console.log(`     - Loại: ${req.type}`);
        console.log(`     - Trạng thái: ${req.status}`);
        console.log(`     - Khóa học: ${req.course?.name || "N/A"}`);
        console.log(
          `     - Assigned to class: ${
            req.assignedToClass?.name || "Chưa xếp lớp"
          }`
        );
        console.log(`     - Ngày tạo: ${req.createdAt}`);
      });
    }

    // 3. Kiểm tra student có trong class nào không
    console.log("\n🏫 DANH SÁCH LỚP HỌC:");
    const classes = await Class.find({
      "students.student": student._id,
    }).populate("course", "name courseCode");

    if (classes.length === 0) {
      console.log("  ⚠️  Student chưa được xếp vào lớp nào");
    } else {
      classes.forEach((cls, idx) => {
        const studentInClass = cls.students.find(
          (s) => s.student.toString() === student._id.toString()
        );
        console.log(`\n  ${idx + 1}. Lớp: ${cls.name}`);
        console.log(`     - Mã lớp: ${cls.classCode}`);
        console.log(`     - Khóa học: ${cls.course?.name || "N/A"}`);
        console.log(
          `     - Trạng thái student: ${studentInClass?.status || "N/A"}`
        );
        console.log(
          `     - Ngày ghi danh: ${studentInClass?.enrolledDate || "N/A"}`
        );
      });
    }

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkStudent();
