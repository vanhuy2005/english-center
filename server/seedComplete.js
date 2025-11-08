/**
 * Comprehensive Seed Data Script
 * Tạo dữ liệu đầy đủ cho tất cả các chức năng của hệ thống
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("./src/shared/models/User.model");
const Student = require("./src/shared/models/Student.model");
const Teacher = require("./src/shared/models/Teacher.model");
const EnrollmentStaff = require("./src/shared/models/EnrollmentStaff.model");
const AcademicStaff = require("./src/shared/models/AcademicStaff.model");
const Accountant = require("./src/shared/models/Accountant.model");
const Course = require("./src/shared/models/Course.model");
const Class = require("./src/shared/models/Class.model");
const Finance = require("./src/shared/models/Finance.model");

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  console.log("🗑️  Clearing database...");
  await User.deleteMany({});
  await Student.deleteMany({});
  await Teacher.deleteMany({});
  await EnrollmentStaff.deleteMany({});
  await AcademicStaff.deleteMany({});
  await Accountant.deleteMany({});
  await Course.deleteMany({});
  await Class.deleteMany({});
  await Finance.deleteMany({});
  console.log("✅ Database cleared");
};

// Seed Users and Profiles
const seedUsersAndProfiles = async () => {
  console.log("👥 Seeding users and profiles...");

  const usersData = [
    // === DIRECTOR (1 người) ===
    {
      fullName: "Nguyễn Văn Giám Đốc",
      phone: "0900000001",
      email: "director@english.edu.vn",
      password: "123456",
      role: "director",
      status: "active",
      isFirstLogin: false, // Director đã đổi mật khẩu
    },

    // === TEACHERS (3 người) ===
    {
      fullName: "Trần Thị Mai",
      phone: "0901111111",
      email: "mai.teacher@english.edu.vn",
      password: "123456",
      role: "teacher",
      status: "active",
      isFirstLogin: true,
      profile: {
        teacherCode: "GV001",
        dateOfBirth: new Date("1990-05-15"),
        gender: "female",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        subjects: ["English Communication", "IELTS"],
        employmentStatus: "active",
        dateJoined: new Date("2020-01-15"),
      },
    },
    {
      fullName: "Lê Văn Hùng",
      phone: "0901111112",
      email: "hung.teacher@english.edu.vn",
      password: "123456",
      role: "teacher",
      status: "active",
      isFirstLogin: true,
      profile: {
        teacherCode: "GV002",
        dateOfBirth: new Date("1988-03-20"),
        gender: "male",
        address: "456 Lê Lợi, Quận 3, TP.HCM",
        subjects: ["TOEIC", "Business English"],
        employmentStatus: "active",
        dateJoined: new Date("2019-08-01"),
      },
    },
    {
      fullName: "Phạm Thị Lan",
      phone: "0901111113",
      password: "123456",
      role: "teacher",
      status: "active",
      isFirstLogin: true,
      profile: {
        teacherCode: "GV003",
        dateOfBirth: new Date("1992-11-10"),
        gender: "female",
        address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
        subjects: ["TOEFL", "Academic Writing"],
        employmentStatus: "active",
        dateJoined: new Date("2021-03-01"),
      },
    },

    // === STUDENTS (3 người) ===
    {
      fullName: "Nguyễn Văn An",
      phone: "0902222221",
      email: "an.student@gmail.com",
      password: "123456",
      role: "student",
      status: "active",
      isFirstLogin: true,
      profile: {
        studentCode: "SV001",
        dateOfBirth: new Date("2002-06-15"),
        gender: "male",
        address: "12 Nguyễn Trãi, Quận 5, TP.HCM",
        academicStatus: "active",
      },
    },
    {
      fullName: "Trần Thị Bình",
      phone: "0902222222",
      email: "binh.student@gmail.com",
      password: "123456",
      role: "student",
      status: "active",
      isFirstLogin: true,
      profile: {
        studentCode: "SV002",
        dateOfBirth: new Date("2003-08-20"),
        gender: "female",
        address: "34 Võ Văn Tần, Quận 3, TP.HCM",
        academicStatus: "active",
      },
    },
    {
      fullName: "Lê Minh Chiến",
      phone: "0902222223",
      password: "123456",
      role: "student",
      status: "active",
      isFirstLogin: true,
      profile: {
        studentCode: "SV003",
        dateOfBirth: new Date("2001-12-05"),
        gender: "male",
        address: "56 Hai Bà Trưng, Quận 1, TP.HCM",
        academicStatus: "active",
      },
    },

    // === ENROLLMENT STAFF (2 người) ===
    {
      fullName: "Võ Thị Dung",
      phone: "0903333331",
      email: "dung.enrollment@english.edu.vn",
      password: "123456",
      role: "enrollment",
      status: "active",
      isFirstLogin: true,
      profile: {
        staffCode: "NV-TD001",
        dateOfBirth: new Date("1995-04-10"),
        gender: "female",
        address: "78 Cách Mạng Tháng 8, Quận 10, TP.HCM",
        employmentStatus: "active",
        dateJoined: new Date("2021-06-01"),
        performanceMetrics: {
          totalEnrollments: 45,
          thisMonthEnrollments: 8,
          conversionRate: 75,
        },
      },
    },
    {
      fullName: "Hoàng Văn Em",
      phone: "0903333332",
      password: "123456",
      role: "enrollment",
      status: "active",
      isFirstLogin: true,
      profile: {
        staffCode: "NV-TD002",
        dateOfBirth: new Date("1994-07-22"),
        gender: "male",
        address: "90 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
        employmentStatus: "active",
        dateJoined: new Date("2020-09-15"),
        performanceMetrics: {
          totalEnrollments: 62,
          thisMonthEnrollments: 12,
          conversionRate: 82,
        },
      },
    },

    // === ACADEMIC STAFF (2 người) ===
    {
      fullName: "Đặng Thị Phương",
      phone: "0904444441",
      email: "phuong.academic@english.edu.vn",
      password: "123456",
      role: "academic",
      status: "active",
      isFirstLogin: true,
      profile: {
        staffCode: "NV-HV001",
        dateOfBirth: new Date("1993-09-18"),
        gender: "female",
        address: "111 Phan Đăng Lưu, Quận Phú Nhuận, TP.HCM",
        employmentStatus: "active",
        dateJoined: new Date("2020-02-10"),
        performanceMetrics: {
          totalRequestsProcessed: 128,
          thisMonthRequests: 15,
          averageResponseTime: 4.5,
        },
      },
    },
    {
      fullName: "Bùi Văn Quang",
      phone: "0904444442",
      password: "123456",
      role: "academic",
      status: "active",
      isFirstLogin: true,
      profile: {
        staffCode: "NV-HV002",
        dateOfBirth: new Date("1991-01-25"),
        gender: "male",
        address: "222 Lý Thường Kiệt, Quận 11, TP.HCM",
        employmentStatus: "active",
        dateJoined: new Date("2019-11-01"),
        performanceMetrics: {
          totalRequestsProcessed: 156,
          thisMonthRequests: 18,
          averageResponseTime: 3.8,
        },
      },
    },

    // === ACCOUNTANT (2 người) ===
    {
      fullName: "Ngô Thị Hoa",
      phone: "0905555551",
      email: "hoa.accountant@english.edu.vn",
      password: "123456",
      role: "accountant",
      status: "active",
      isFirstLogin: true,
      profile: {
        staffCode: "NV-KT001",
        dateOfBirth: new Date("1990-12-30"),
        gender: "female",
        address: "333 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
        employmentStatus: "active",
        dateJoined: new Date("2019-05-15"),
        accessLevel: "senior",
        performanceMetrics: {
          totalTransactions: 450,
          thisMonthTransactions: 38,
          totalAmountProcessed: 2500000000, // 2.5 tỷ
        },
      },
    },
    {
      fullName: "Trương Văn Tài",
      phone: "0905555552",
      password: "123456",
      role: "accountant",
      status: "active",
      isFirstLogin: true,
      profile: {
        staffCode: "NV-KT002",
        dateOfBirth: new Date("1992-03-14"),
        gender: "male",
        address: "444 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM",
        employmentStatus: "active",
        dateJoined: new Date("2020-08-20"),
        accessLevel: "standard",
        performanceMetrics: {
          totalTransactions: 320,
          thisMonthTransactions: 29,
          totalAmountProcessed: 1800000000, // 1.8 tỷ
        },
      },
    },
  ];

  const createdUsers = [];
  const createdProfiles = {
    teachers: [],
    students: [],
    enrollmentStaff: [],
    academicStaff: [],
    accountants: [],
  };

  for (const userData of usersData) {
    // Create user - let model handle password hashing via pre-save hook
    const user = await User.create({
      fullName: userData.fullName,
      phone: userData.phone,
      email: userData.email,
      password: userData.password, // Model will hash this automatically
      role: userData.role,
      status: userData.status,
      isFirstLogin: userData.isFirstLogin,
    });

    createdUsers.push(user);

    // Create role-specific profile
    if (userData.profile) {
      switch (userData.role) {
        case "teacher":
          const teacher = await Teacher.create({
            ...userData.profile,
            user: user._id,
          });
          createdProfiles.teachers.push(teacher);
          break;

        case "student":
          const student = await Student.create({
            ...userData.profile,
            user: user._id,
          });
          createdProfiles.students.push(student);
          break;

        case "enrollment":
          const enrollment = await EnrollmentStaff.create({
            ...userData.profile,
            user: user._id,
          });
          createdProfiles.enrollmentStaff.push(enrollment);
          break;

        case "academic":
          const academic = await AcademicStaff.create({
            ...userData.profile,
            user: user._id,
          });
          createdProfiles.academicStaff.push(academic);
          break;

        case "accountant":
          const accountant = await Accountant.create({
            ...userData.profile,
            user: user._id,
          });
          createdProfiles.accountants.push(accountant);
          break;
      }
    }
  }

  console.log(`✅ Created ${createdUsers.length} users`);
  console.log(`   - ${createdProfiles.teachers.length} teachers`);
  console.log(`   - ${createdProfiles.students.length} students`);
  console.log(
    `   - ${createdProfiles.enrollmentStaff.length} enrollment staff`
  );
  console.log(`   - ${createdProfiles.academicStaff.length} academic staff`);
  console.log(`   - ${createdProfiles.accountants.length} accountants`);

  return { createdUsers, createdProfiles };
};

// Seed Courses
const seedCourses = async () => {
  console.log("📚 Seeding courses...");

  const coursesData = [
    {
      name: "IELTS Foundation",
      courseCode: "IELTS-F001",
      description: "Khóa học nền tảng IELTS cho người mới bắt đầu",
      level: "beginner",
      duration: {
        hours: 90,
        weeks: 12,
      },
      schedule: {
        daysPerWeek: 3,
        hoursPerDay: 2,
      },
      fee: {
        amount: 5000000,
        currency: "VND",
      },
      capacity: {
        min: 5,
        max: 20,
      },
      status: "active",
    },
    {
      name: "TOEIC 550+",
      courseCode: "TOEIC-550",
      description: "Khóa học TOEIC mục tiêu 550 điểm",
      level: "intermediate",
      duration: {
        hours: 60,
        weeks: 8,
      },
      schedule: {
        daysPerWeek: 2,
        hoursPerDay: 2.5,
      },
      fee: {
        amount: 4000000,
        currency: "VND",
      },
      capacity: {
        min: 8,
        max: 25,
      },
      status: "active",
    },
    {
      name: "Business English",
      courseCode: "BE-001",
      description: "Tiếng Anh giao tiếp trong môi trường kinh doanh",
      level: "upper-intermediate",
      duration: {
        hours: 72,
        weeks: 12,
      },
      schedule: {
        daysPerWeek: 2,
        hoursPerDay: 2,
      },
      fee: {
        amount: 6000000,
        currency: "VND",
      },
      capacity: {
        min: 5,
        max: 15,
      },
      status: "active",
    },
  ];

  const courses = await Course.insertMany(coursesData);
  console.log(`✅ Created ${courses.length} courses`);
  return courses;
};

// Seed Classes
const seedClasses = async (courses, teachers) => {
  console.log("🏫 Seeding classes...");

  const classesData = [
    {
      name: "IELTS Foundation - Lớp A1",
      classCode: "IELTS-F001-A1",
      course: courses[0]._id, // IELTS Foundation
      teacher: teachers[0]._id, // Trần Thị Mai
      schedule: [
        {
          dayOfWeek: 1, // Monday (0=Sunday, 1=Monday)
          startTime: "18:00",
          endTime: "20:00",
        },
        {
          dayOfWeek: 3, // Wednesday
          startTime: "18:00",
          endTime: "20:00",
        },
        {
          dayOfWeek: 5, // Friday
          startTime: "18:00",
          endTime: "20:00",
        },
      ],
      room: "Room 101",
      capacity: 20,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-04-15"),
      status: "ongoing",
    },
    {
      name: "TOEIC 550+ - Lớp B1",
      classCode: "TOEIC-550-B1",
      course: courses[1]._id, // TOEIC 550+
      teacher: teachers[1]._id, // Lê Văn Hùng
      schedule: [
        {
          dayOfWeek: 2, // Tuesday
          startTime: "19:00",
          endTime: "21:30",
        },
        {
          dayOfWeek: 4, // Thursday
          startTime: "19:00",
          endTime: "21:30",
        },
      ],
      room: "Room 102",
      capacity: 25,
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-04-01"),
      status: "ongoing",
    },
    {
      name: "Business English - Lớp C1",
      classCode: "BE-001-C1",
      course: courses[2]._id, // Business English
      teacher: teachers[2]._id, // Phạm Thị Lan
      schedule: [
        {
          dayOfWeek: 1, // Monday
          startTime: "18:30",
          endTime: "20:30",
        },
        {
          dayOfWeek: 4, // Thursday
          startTime: "18:30",
          endTime: "20:30",
        },
      ],
      room: "Room 103",
      capacity: 15,
      startDate: new Date("2024-01-20"),
      endDate: new Date("2024-04-20"),
      status: "ongoing",
    },
  ];

  const classes = await Class.insertMany(classesData);
  console.log(`✅ Created ${classes.length} classes`);
  return classes;
};

// Seed Finance Records
const seedFinance = async (students, courses, accountants) => {
  console.log("💰 Seeding finance records...");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const financeData = [];

  // Generate finance records for the last 6 months
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = currentMonth - monthOffset;
    const year = month < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = month < 0 ? 12 + month : month;

    // Create 3-5 random records per month
    const recordsCount = Math.floor(Math.random() * 3) + 3; // 3-5 records

    for (let i = 0; i < recordsCount; i++) {
      const studentIndex = Math.floor(Math.random() * students.length);
      const courseIndex = Math.floor(Math.random() * courses.length);
      const accountantIndex = Math.floor(Math.random() * accountants.length);

      const amount = [3000000, 4000000, 5000000, 6000000][
        Math.floor(Math.random() * 4)
      ];
      const isPaid = Math.random() > 0.2; // 80% paid
      const paidAmount = isPaid
        ? amount
        : Math.random() > 0.5
        ? Math.floor(amount / 2)
        : 0;

      const dueDate = new Date(year, adjustedMonth, 15);
      const paidDate = isPaid
        ? new Date(year, adjustedMonth, Math.floor(Math.random() * 15) + 1)
        : null;

      financeData.push({
        student: students[studentIndex]._id,
        course: courses[courseIndex]._id,
        type: "tuition",
        amount,
        paidAmount,
        remainingAmount: amount - paidAmount,
        status:
          paidAmount === amount
            ? "paid"
            : paidAmount > 0
            ? "partial"
            : "pending",
        dueDate,
        paidDate,
        paymentMethod: isPaid
          ? ["bank_transfer", "cash", "credit_card"][
              Math.floor(Math.random() * 3)
            ]
          : "cash",
        createdBy: accountants[accountantIndex]._id,
        note: `Học phí tháng ${adjustedMonth + 1}/${year}`,
      });
    }
  }

  const financeRecords = await Finance.insertMany(financeData);
  console.log(`✅ Created ${financeRecords.length} finance records`);
  return financeRecords;
};

// Main seed function
const seedAll = async () => {
  try {
    await connectDB();
    await clearDatabase();

    const { createdUsers, createdProfiles } = await seedUsersAndProfiles();
    const courses = await seedCourses();
    const classes = await seedClasses(courses, createdProfiles.teachers);
    const financeRecords = await seedFinance(
      createdProfiles.students,
      courses,
      createdProfiles.accountants
    );

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("=".repeat(60));
    console.log("Director:");
    console.log("  Phone: 0900000001 | Password: 123456");
    console.log("\nTeachers:");
    console.log("  Phone: 0901111111 | Password: 123456 (Trần Thị Mai)");
    console.log("  Phone: 0901111112 | Password: 123456 (Lê Văn Hùng)");
    console.log("  Phone: 0901111113 | Password: 123456 (Phạm Thị Lan)");
    console.log("\nStudents:");
    console.log("  Phone: 0902222221 | Password: 123456 (Nguyễn Văn An)");
    console.log("  Phone: 0902222222 | Password: 123456 (Trần Thị Bình)");
    console.log("  Phone: 0902222223 | Password: 123456 (Lê Minh Chiến)");
    console.log("\nEnrollment Staff:");
    console.log("  Phone: 0903333331 | Password: 123456 (Võ Thị Dung)");
    console.log("  Phone: 0903333332 | Password: 123456 (Hoàng Văn Em)");
    console.log("\nAcademic Staff:");
    console.log("  Phone: 0904444441 | Password: 123456 (Đặng Thị Phương)");
    console.log("  Phone: 0904444442 | Password: 123456 (Bùi Văn Quang)");
    console.log("\nAccountant:");
    console.log("  Phone: 0905555551 | Password: 123456 (Ngô Thị Hoa)");
    console.log("  Phone: 0905555552 | Password: 123456 (Trương Văn Tài)");
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

// Run seed
seedAll();
