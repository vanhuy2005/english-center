/* SEED DATA - CLASS TRACKING (STANDALONE VERSION)
   Mục tiêu: Tạo dữ liệu lớp học để test giao diện.
   Phương pháp: Định nghĩa Schema nội bộ để tránh lỗi "Module not found".
*/

const mongoose = require("mongoose");
require("dotenv").config();

// --- 1. ĐỊNH NGHĨA SCHEMA NỘI BỘ (Để script chạy độc lập) ---
// Course Schema
const CourseSchema = new mongoose.Schema({
  name: String,
  title: String,
  courseCode: String,
  level: String,
});
const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

// Staff/User Schema (Dùng chung cho Giáo viên)
const StaffSchema = new mongoose.Schema({
  fullName: String,
  name: String,
  role: String,
  email: String,
});
const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
// Fallback nếu bạn dùng model User thay vì Staff
const UserSchema = new mongoose.Schema({
  fullName: String,
  role: String,
  email: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Student Schema
const StudentSchema = new mongoose.Schema({
  fullName: String,
  studentCode: String,
  email: String,
});
const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

// Class Schema (Full fields)
const ClassSchema = new mongoose.Schema(
  {
    name: String,
    code: String,
    classCode: String, // Support cả 2 trường hợp tên field
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" }, // Mặc định ref Staff
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    currentEnrollment: { type: Number, default: 0 },
    capacity: { type: Number, default: 20 },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["active", "upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
    room: String,
    schedule: String,
  },
  { timestamps: true }
);

// Hack: Thử đăng ký model Class, nếu tồn tại rồi thì dùng, chưa thì tạo mới
const Class = mongoose.models.Class || mongoose.model("Class", ClassSchema);

// --- 2. LOGIC SEED DATA ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    process.exit(1);
  }
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedClasses = async () => {
  await connectDB();
  console.log("🚀 Starting Class Tracking Seeding...");

  try {
    // Lấy dữ liệu tham chiếu
    let courses = await Course.find();
    let students = await Student.find();

    // Tìm giáo viên từ Staff hoặc User
    let teachers = await Staff.find({
      role: { $in: ["teacher", "gv", "instructor", "staff"] },
    });
    if (teachers.length === 0) {
      console.log("⚠️ Không tìm thấy trong Staff, thử tìm trong User...");
      teachers = await User.find({
        role: { $in: ["teacher", "gv", "instructor"] },
      });
    }

    if (courses.length === 0) {
      console.log(
        "❌ Không tìm thấy Course nào. Hãy chạy seedCourses.js trước."
      );
      process.exit(1);
    }

    console.log(
      `📊 Dữ liệu nền: ${courses.length} khóa học, ${teachers.length} giáo viên, ${students.length} học viên.`
    );

    const classesToCreate = [];
    const today = new Date();

    // --- KỊCH BẢN TEST UI ---

    // 1. Lớp ĐANG HỌC - Sĩ số bình thường (hiển thị xanh lá/xanh dương)
    classesToCreate.push({
      name: "IELTS Advanced Morning",
      code: `IELTS-A-${Date.now()}`,
      course: getRandomItem(courses)._id,
      teacher: teachers.length > 0 ? getRandomItem(teachers)._id : null,
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 3, 1),
      capacity: 20,
      currentEnrollment: 15,
      students: students.slice(0, 15).map((s) => s._id),
      status: "active",
      schedule: "Mon-Wed-Fri 08:00-10:00",
    });

    // 2. Lớp ĐANG HỌC - ĐÃ ĐẦY (Test hiển thị màu đỏ "Đầy")
    classesToCreate.push({
      name: "TOEIC Intensive (FULL)",
      code: `TOEIC-F-${Date.now()}`,
      course: getRandomItem(courses)._id,
      teacher: teachers.length > 0 ? getRandomItem(teachers)._id : null,
      startDate: new Date(today.getFullYear(), today.getMonth(), 5),
      endDate: new Date(today.getFullYear(), today.getMonth() + 2, 5),
      capacity: 10,
      currentEnrollment: 10, // Full 100%
      students: students.slice(0, 10).map((s) => s._id),
      status: "active",
      schedule: "Tue-Thu 18:00-20:00",
    });

    // 3. Lớp SẮP KHAI GIẢNG - CHƯA CÓ AI (Test lỗi hiển thị NaN/0%)
    classesToCreate.push({
      name: "Communication Basic - K12",
      code: `COM-K12-${Date.now()}`,
      course: getRandomItem(courses)._id,
      teacher: teachers.length > 0 ? getRandomItem(teachers)._id : null,
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      endDate: new Date(today.getFullYear(), today.getMonth() + 4, 15),
      capacity: 25,
      currentEnrollment: 0, // 0 students
      students: [],
      status: "upcoming",
      schedule: "Sat-Sun 09:00-11:00",
    });

    // 4. Lớp ĐÃ KẾT THÚC (Màu xám)
    classesToCreate.push({
      name: "English for Kids - Summer 2024",
      code: `KID-S24-${Date.now()}`,
      course: getRandomItem(courses)._id,
      teacher: teachers.length > 0 ? getRandomItem(teachers)._id : null,
      startDate: new Date(today.getFullYear(), today.getMonth() - 4, 1),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      capacity: 15,
      currentEnrollment: 12,
      students: students.slice(0, 12).map((s) => s._id),
      status: "completed",
      schedule: "Mon-Wed 17:00-18:30",
    });

    await Class.insertMany(classesToCreate);
    console.log(
      `✅ Đã thêm ${classesToCreate.length} lớp học test vào Database.`
    );
    console.log("👉 Refresh trang Class Tracking để xem kết quả.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedClasses();
