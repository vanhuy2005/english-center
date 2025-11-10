/**
 * Complete Seed Script for English Center Database
 * Seeds all models with sample data for testing authentication and authorization
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");

// Import all models
const User = require("./src/shared/models/User.model");
const Student = require("./src/shared/models/Student.model");
const Teacher = require("./src/shared/models/Teacher.model");
const AcademicStaff = require("./src/shared/models/AcademicStaff.model");
const EnrollmentStaff = require("./src/shared/models/EnrollmentStaff.model");
const Accountant = require("./src/shared/models/Accountant.model");
const Course = require("./src/shared/models/Course.model");
const Class = require("./src/shared/models/Class.model");
const Counter = require("./src/shared/models/Counter.model");

// Clear all collections
const clearDatabase = async () => {
  console.log("🗑️  Clearing database...");
  await User.deleteMany({});
  await Student.deleteMany({});
  await Teacher.deleteMany({});
  await AcademicStaff.deleteMany({});
  await EnrollmentStaff.deleteMany({});
  await Accountant.deleteMany({});
  await Course.deleteMany({});
  await Class.deleteMany({});
  await Counter.deleteMany({});
  console.log("✅ Database cleared");
};

// Seed Users with different roles
const seedUsers = async () => {
  console.log("\n👥 Seeding Users...");

  const users = [
    // Director
    {
      fullName: "Nguyễn Văn Giám Đốc",
      phone: "0901000001",
      email: "director@englishcenter.com",
      password: "123456",
      role: "director",
      status: "active",
      isFirstLogin: true,
    },
    // Teachers
    {
      fullName: "Trần Thị Hương",
      phone: "0902000001",
      email: "huong.teacher@englishcenter.com",
      password: "123456",
      role: "teacher",
      status: "active",
      isFirstLogin: true,
    },
    {
      fullName: "Lê Văn Nam",
      phone: "0902000002",
      email: "nam.teacher@englishcenter.com",
      password: "123456",
      role: "teacher",
      status: "active",
      isFirstLogin: true,
    },
    // Students
    {
      fullName: "Phạm Thị Mai",
      phone: "0903000001",
      email: "mai.student@gmail.com",
      password: "123456",
      role: "student",
      status: "active",
      isFirstLogin: true,
    },
    {
      fullName: "Nguyễn Văn Anh",
      phone: "0903000002",
      email: "anh.student@gmail.com",
      password: "123456",
      role: "student",
      status: "active",
      isFirstLogin: true,
    },
    // Academic Staff
    {
      fullName: "Vũ Thị Lan",
      phone: "0904000001",
      email: "lan.academic@englishcenter.com",
      password: "123456",
      role: "academic",
      status: "active",
      isFirstLogin: true,
    },
    // Enrollment Staff
    {
      fullName: "Hoàng Văn Hải",
      phone: "0905000001",
      email: "hai.enrollment@englishcenter.com",
      password: "123456",
      role: "enrollment",
      status: "active",
      isFirstLogin: true,
    },
    // Accountant
    {
      fullName: "Đỗ Thị Thu",
      phone: "0906000001",
      email: "thu.accountant@englishcenter.com",
      password: "123456",
      role: "accountant",
      status: "active",
      isFirstLogin: true,
    },
  ];

  const createdUsers = await User.create(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

// Seed role-specific profiles
const seedProfiles = async (users) => {
  console.log("\n📋 Seeding Profiles...");

  // Find users by role
  const directorUser = users.find((u) => u.role === "director");
  const teacherUsers = users.filter((u) => u.role === "teacher");
  const studentUsers = users.filter((u) => u.role === "student");
  const academicUser = users.find((u) => u.role === "academic");
  const enrollmentUser = users.find((u) => u.role === "enrollment");
  const accountantUser = users.find((u) => u.role === "accountant");

  // Seed Teachers
  const teachers = [];
  for (let i = 0; i < teacherUsers.length; i++) {
    const teacher = await Teacher.create({
      user: teacherUsers[i]._id,
      specialization: i === 0 ? ["IELTS", "TOEIC"] : ["Business English"],
      qualifications: [
        {
          degree: "Bachelor of English",
          institution: "HCMC University",
          year: 2018,
        },
      ],
      experience: {
        years: 5,
        description: "5 years teaching English for adults and children",
      },
      employmentStatus: "active",
      joinDate: new Date("2020-01-15"),
    });
    teachers.push(teacher);
    console.log(`✅ Created teacher profile: ${teacherUsers[i].fullName}`);
  }

  // Seed Students
  const students = [];
  for (let i = 0; i < studentUsers.length; i++) {
    const student = await Student.create({
      user: studentUsers[i]._id,
      fullName: studentUsers[i].fullName,
      email: studentUsers[i].email,
      dateOfBirth: new Date("2000-01-15"),
      gender: i === 0 ? "female" : "male",
      address: "123 Main Street, HCMC",
      contactInfo: {
        phone: studentUsers[i].phone,
        email: studentUsers[i].email,
      },
      contactPerson: {
        name: "Nguyễn Văn Phụ Huynh",
        relation: "Parent",
        phone: "0909123456",
        email: "parent@gmail.com",
      },
      academicStatus: "active",
    });
    students.push(student);
    console.log(`✅ Created student profile: ${studentUsers[i].fullName}`);
  }

  // Seed Academic Staff
  const academicStaff = await AcademicStaff.create({
    user: academicUser._id,
    staffCode: "NVHV001",
    dateOfBirth: new Date("1990-05-20"),
    gender: "female",
    address: "456 Academic Street, HCMC",
    employmentStatus: "active",
    dateJoined: new Date("2021-03-01"),
    department: "Phòng Học vụ",
    position: "Nhân viên Học vụ",
    responsibilities: [
      "Quản lý điểm danh",
      "Quản lý điểm số",
      "Xử lý yêu cầu học viên",
    ],
  });
  console.log(`✅ Created academic staff profile: ${academicUser.fullName}`);

  // Seed Enrollment Staff
  const enrollmentStaff = await EnrollmentStaff.create({
    user: enrollmentUser._id,
    staffCode: "NVTS001",
    dateOfBirth: new Date("1992-08-15"),
    gender: "male",
    address: "789 Enrollment Road, HCMC",
    employmentStatus: "active",
    dateJoined: new Date("2021-06-01"),
    department: "Phòng Tuyển sinh",
    position: "Nhân viên Tuyển sinh",
  });
  console.log(
    `✅ Created enrollment staff profile: ${enrollmentUser.fullName}`
  );

  // Seed Accountant
  const accountant = await Accountant.create({
    user: accountantUser._id,
    staffCode: "NVKT001",
    dateOfBirth: new Date("1988-11-30"),
    gender: "female",
    address: "321 Finance Avenue, HCMC",
    employmentStatus: "active",
    dateJoined: new Date("2020-09-01"),
    department: "Phòng Kế toán",
    position: "Nhân viên Kế toán",
    responsibilities: [
      "Quản lý học phí",
      "Xử lý thanh toán",
      "Báo cáo tài chính",
    ],
    accessLevel: "standard",
  });
  console.log(`✅ Created accountant profile: ${accountantUser.fullName}`);

  return { teachers, students, academicStaff, enrollmentStaff, accountant };
};

// Seed Courses
const seedCourses = async () => {
  console.log("\n📚 Seeding Courses...");

  const courses = [
    {
      name: "General English - Beginner",
      description: "English course for absolute beginners",
      level: "beginner",
      duration: {
        hours: 60,
        weeks: 12,
      },
      schedule: {
        daysPerWeek: 3,
        hoursPerDay: 2,
      },
      fee: {
        amount: 3000000,
        currency: "VND",
      },
      capacity: {
        min: 5,
        max: 15,
      },
      status: "active",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-04-15"),
    },
    {
      name: "IELTS Preparation",
      description: "Intensive IELTS preparation course",
      level: "intermediate",
      duration: {
        hours: 80,
        weeks: 16,
      },
      schedule: {
        daysPerWeek: 4,
        hoursPerDay: 2.5,
      },
      fee: {
        amount: 5000000,
        currency: "VND",
      },
      capacity: {
        min: 5,
        max: 12,
      },
      status: "active",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-05-31"),
    },
  ];

  const createdCourses = await Course.create(courses);
  console.log(`✅ Created ${createdCourses.length} courses`);
  return createdCourses;
};

// Seed Classes
const seedClasses = async (courses, teachers, students) => {
  console.log("\n🏫 Seeding Classes...");

  const classes = [
    {
      name: "Beginner Class A1",
      course: courses[0]._id,
      teacher: teachers[0]._id,
      students: [
        {
          student: students[0]._id,
          enrolledDate: new Date("2025-01-10"),
          status: "active",
        },
      ],
      capacity: 15,
      room: "Room A101",
      schedule: [
        {
          dayOfWeek: 1, // Monday
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
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-04-15"),
      status: "ongoing",
    },
    {
      name: "IELTS Class B1",
      course: courses[1]._id,
      teacher: teachers[1]._id,
      students: [
        {
          student: students[1]._id,
          enrolledDate: new Date("2025-01-25"),
          status: "active",
        },
      ],
      capacity: 12,
      room: "Room B202",
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
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-05-31"),
      status: "ongoing",
    },
  ];

  const createdClasses = await Class.create(classes);
  console.log(`✅ Created ${createdClasses.length} classes`);

  // Update course references
  await Course.findByIdAndUpdate(courses[0]._id, {
    $push: { classes: createdClasses[0]._id },
  });
  await Course.findByIdAndUpdate(courses[1]._id, {
    $push: { classes: createdClasses[1]._id },
  });

  // Update teacher references
  await Teacher.findByIdAndUpdate(teachers[0]._id, {
    $push: { classes: createdClasses[0]._id },
  });
  await Teacher.findByIdAndUpdate(teachers[1]._id, {
    $push: { classes: createdClasses[1]._id },
  });

  // Update student references
  await Student.findByIdAndUpdate(students[0]._id, {
    $push: { enrolledCourses: courses[0]._id },
  });
  await Student.findByIdAndUpdate(students[1]._id, {
    $push: { enrolledCourses: courses[1]._id },
  });

  return createdClasses;
};

// Print login credentials
const printCredentials = async () => {
  console.log("\n" + "=".repeat(70));
  console.log("🔐 LOGIN CREDENTIALS (Phone & Password)");
  console.log("=".repeat(70));

  const users = await User.find({}).select("fullName phone role");

  const roleGroups = {
    director: [],
    teacher: [],
    student: [],
    academic: [],
    enrollment: [],
    accountant: [],
  };

  users.forEach((user) => {
    roleGroups[user.role].push(user);
  });

  const roleNames = {
    director: "🎯 DIRECTOR (Giám đốc)",
    teacher: "👨‍🏫 TEACHERS (Giảng viên)",
    student: "👨‍🎓 STUDENTS (Học viên)",
    academic: "📚 ACADEMIC STAFF (Nhân viên Học vụ)",
    enrollment: "📝 ENROLLMENT STAFF (Nhân viên Tuyển sinh)",
    accountant: "💰 ACCOUNTANT (Nhân viên Kế toán)",
  };

  for (const [role, users] of Object.entries(roleGroups)) {
    if (users.length > 0) {
      console.log(`\n${roleNames[role]}`);
      console.log("-".repeat(70));
      users.forEach((user) => {
        console.log(`  Name: ${user.fullName}`);
        console.log(`  Phone: ${user.phone}`);
        console.log(`  Password: 123456`);
        console.log(`  Role: ${user.role}`);
        console.log("");
      });
    }
  }

  console.log("=".repeat(70));
  console.log("⚠️  Default password: 123456 (must change on first login)\n");
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Seed in order
    const users = await seedUsers();
    const profiles = await seedProfiles(users);
    const courses = await seedCourses();
    const classes = await seedClasses(
      courses,
      profiles.teachers,
      profiles.students
    );

    // Print credentials
    await printCredentials();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("🚀 You can now start the server and test authentication\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
