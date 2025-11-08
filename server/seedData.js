const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/shared/models/User.model");
const Student = require("./src/shared/models/Student.model");
const Teacher = require("./src/shared/models/Teacher.model");
const Course = require("./src/shared/models/Course.model");
const Finance = require("./src/shared/models/Finance.model");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Clear existing data (careful in production!)
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({ role: { $ne: "director" } }); // Keep director
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Course.deleteMany({});
    await Finance.deleteMany({});

    // Create Teachers
    console.log("👨‍🏫 Creating teachers...");
    const teacherUsers = await User.create([
      {
        fullName: "Nguyễn Văn A",
        email: "teacher1@englishcenter.com",
        password: "teacher123",
        phone: "0901234567",
        role: "teacher",
        status: "active",
      },
      {
        fullName: "Trần Thị B",
        email: "teacher2@englishcenter.com",
        password: "teacher123",
        phone: "0901234568",
        role: "teacher",
        status: "active",
      },
      {
        fullName: "Lê Văn C",
        email: "teacher3@englishcenter.com",
        password: "teacher123",
        phone: "0901234569",
        role: "teacher",
        status: "active",
      },
    ]);

    const teachers = await Teacher.create([
      {
        user: teacherUsers[0]._id,
        dateOfBirth: new Date("1990-05-15"),
        gender: "male",
        address: "123 Lê Lợi, Q1, TP.HCM",
        subjects: ["TOEIC", "IELTS"],
        employmentStatus: "active",
        contactInfo: {
          email: "teacher1@englishcenter.com",
          phone: "0901234567",
        },
      },
      {
        user: teacherUsers[1]._id,
        dateOfBirth: new Date("1988-03-20"),
        gender: "female",
        address: "456 Nguyễn Huệ, Q1, TP.HCM",
        subjects: ["Business English", "Conversation"],
        employmentStatus: "active",
        contactInfo: {
          email: "teacher2@englishcenter.com",
          phone: "0901234568",
        },
      },
      {
        user: teacherUsers[2]._id,
        dateOfBirth: new Date("1992-08-10"),
        gender: "male",
        address: "789 Hai Bà Trưng, Q3, TP.HCM",
        subjects: ["IELTS", "TOEFL"],
        employmentStatus: "active",
        contactInfo: {
          email: "teacher3@englishcenter.com",
          phone: "0901234569",
        },
      },
    ]);

    // Create Courses
    console.log("📚 Creating courses...");
    const courses = await Course.create([
      {
        name: "TOEIC 600+",
        courseCode: "TOEIC600",
        level: "intermediate",
        description: "Khóa học chuẩn bị cho kỳ thi TOEIC 600+",
        duration: { weeks: 12, hours: 96 },
        fee: { amount: 3000000, currency: "VND" },
        capacity: { max: 30 },
        teacher: teachers[0]._id,
        status: "active",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-01"),
      },
      {
        name: "IELTS 6.5",
        courseCode: "IELTS65",
        level: "advanced",
        description: "Khóa học chuẩn bị cho kỳ thi IELTS band 6.5",
        duration: { weeks: 16, hours: 128 },
        fee: { amount: 4000000, currency: "VND" },
        capacity: { max: 25 },
        teacher: teachers[0]._id,
        status: "active",
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-05-15"),
      },
      {
        name: "Conversational English",
        courseCode: "CONV001",
        level: "beginner",
        description: "Khóa học tiếng Anh giao tiếp cơ bản",
        duration: { weeks: 8, hours: 64 },
        fee: { amount: 2000000, currency: "VND" },
        capacity: { max: 35 },
        teacher: teachers[1]._id,
        status: "active",
        startDate: new Date("2024-10-01"),
        endDate: new Date("2024-11-26"),
      },
      {
        name: "Business English",
        courseCode: "BIZ001",
        level: "intermediate",
        description: "Khóa học tiếng Anh kinh doanh",
        duration: { weeks: 12, hours: 96 },
        fee: { amount: 3500000, currency: "VND" },
        capacity: { max: 20 },
        teacher: teachers[1]._id,
        status: "upcoming",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-05-01"),
      },
      {
        name: "IELTS 7.5",
        courseCode: "IELTS75",
        level: "advanced",
        description: "Khóa học chuẩn bị cho kỳ thi IELTS band 7.5",
        duration: { weeks: 20, hours: 160 },
        fee: { amount: 5000000, currency: "VND" },
        capacity: { max: 15 },
        teacher: teachers[2]._id,
        status: "upcoming",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-07-01"),
      },
    ]);

    // Create Students
    console.log("👨‍🎓 Creating students...");
    const studentUsers = await User.create([
      {
        fullName: "Phạm Văn D",
        email: "student1@gmail.com",
        password: "student123",
        phone: "0912345671",
        role: "student",
        status: "active",
      },
      {
        fullName: "Hoàng Thị E",
        email: "student2@gmail.com",
        password: "student123",
        phone: "0912345672",
        role: "student",
        status: "active",
      },
      {
        fullName: "Vũ Văn F",
        email: "student3@gmail.com",
        password: "student123",
        phone: "0912345673",
        role: "student",
        status: "active",
      },
      {
        fullName: "Đặng Thị G",
        email: "student4@gmail.com",
        password: "student123",
        phone: "0912345674",
        role: "student",
        status: "active",
      },
      {
        fullName: "Bùi Văn H",
        email: "student5@gmail.com",
        password: "student123",
        phone: "0912345675",
        role: "student",
        status: "active",
      },
    ]);

    const students = await Student.create([
      {
        user: studentUsers[0]._id,
        dateOfBirth: new Date("2000-01-15"),
        gender: "male",
        address: "12 Lý Thường Kiệt, Q10, TP.HCM",
        contactPerson: "Phạm Văn X",
        contactInfo: { email: "parent1@gmail.com", phone: "0987654321" },
        enrolledCourses: [courses[0]._id, courses[2]._id],
        academicStatus: "active",
      },
      {
        user: studentUsers[1]._id,
        dateOfBirth: new Date("1999-06-20"),
        gender: "female",
        address: "34 Trần Hưng Đạo, Q5, TP.HCM",
        contactPerson: "Hoàng Văn Y",
        contactInfo: { email: "parent2@gmail.com", phone: "0987654322" },
        enrolledCourses: [courses[1]._id],
        academicStatus: "active",
      },
      {
        user: studentUsers[2]._id,
        dateOfBirth: new Date("2001-03-10"),
        gender: "male",
        address: "56 Võ Văn Tần, Q3, TP.HCM",
        contactPerson: "Vũ Thị Z",
        contactInfo: { email: "parent3@gmail.com", phone: "0987654323" },
        enrolledCourses: [courses[0]._id],
        academicStatus: "active",
      },
      {
        user: studentUsers[3]._id,
        dateOfBirth: new Date("2000-09-25"),
        gender: "female",
        address: "78 Pasteur, Q1, TP.HCM",
        contactPerson: "Đặng Văn K",
        contactInfo: { email: "parent4@gmail.com", phone: "0987654324" },
        enrolledCourses: [courses[2]._id, courses[3]._id],
        academicStatus: "active",
      },
      {
        user: studentUsers[4]._id,
        dateOfBirth: new Date("1998-12-05"),
        gender: "male",
        address: "90 Điện Biên Phủ, Q3, TP.HCM",
        contactPerson: "Bùi Thị L",
        contactInfo: { email: "parent5@gmail.com", phone: "0987654325" },
        enrolledCourses: [courses[1]._id, courses[4]._id],
        academicStatus: "active",
      },
    ]);

    // Create Finance records
    console.log("💰 Creating finance records...");
    const director = await User.findOne({ role: "director" });

    const financeData = [
      {
        student: students[0]._id,
        course: courses[0]._id,
        type: "tuition",
        amount: 3000000,
        paidAmount: 3000000,
        status: "paid",
        paymentMethod: "bank_transfer",
        description: "Học phí khóa TOEIC 600+",
        createdBy: director._id,
      },
      {
        student: students[0]._id,
        course: courses[2]._id,
        type: "tuition",
        amount: 2000000,
        paidAmount: 1000000,
        status: "partial",
        paymentMethod: "cash",
        description: "Học phí khóa Conversational English",
        createdBy: director._id,
      },
      {
        student: students[1]._id,
        course: courses[1]._id,
        type: "tuition",
        amount: 4000000,
        paidAmount: 0,
        status: "pending",
        paymentMethod: "bank_transfer",
        dueDate: new Date("2025-01-20"),
        description: "Học phí khóa IELTS 6.5",
        createdBy: director._id,
      },
      {
        student: students[2]._id,
        course: courses[0]._id,
        type: "tuition",
        amount: 3000000,
        paidAmount: 1500000,
        status: "partial",
        paymentMethod: "momo",
        description: "Học phí khóa TOEIC 600+",
        createdBy: director._id,
      },
      {
        student: students[3]._id,
        course: courses[2]._id,
        type: "tuition",
        amount: 2000000,
        paidAmount: 2000000,
        status: "paid",
        paymentMethod: "cash",
        description: "Học phí khóa Conversational English",
        createdBy: director._id,
      },
    ];

    // Create finance records one by one to trigger pre-save hooks
    const finances = [];
    for (const data of financeData) {
      const finance = new Finance(data);
      await finance.save();
      finances.push(finance);
    }

    console.log("\n✅ Seed data inserted successfully!");
    console.log("\n📊 Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`💰 Finance records: ${finances.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔑 Test Accounts:");
    console.log("Director: director@englishcenter.com / director123");
    console.log("Teacher: teacher1@englishcenter.com / teacher123");
    console.log("Student: student1@gmail.com / student123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
