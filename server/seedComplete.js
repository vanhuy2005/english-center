/**
 * Complete Seed Script for English Center Database
 * Seeds all models with sample data for testing authentication and authorization
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");

// Safe require helper
const safeRequire = (path) => {
  try {
    return require(path);
  } catch (err) {
    console.warn(
      `⚠️  Optional module not found: ${path} - skipping related seed steps.`
    );
    return null;
  }
};

// Import models (use safeRequire for optional models)
const User = safeRequire("./src/shared/models/User.model");
const Student = safeRequire("./src/shared/models/Student.model");
// const Teacher = safeRequire("./src/shared/models/Teacher.model"); // Replaced by Staff model
const Staff = safeRequire("./src/shared/models/Staff.model");
const Course = safeRequire("./src/shared/models/Course.model");
const Class = safeRequire("./src/shared/models/Class.model");
const Counter = safeRequire("./src/shared/models/Counter.model");

// Clear all collections (only when model exists)
const clearDatabase = async () => {
  console.log("🗑️  Clearing database...");
  const models = {
    User,
    Student,
    Staff,
    Course,
    Class,
    Counter,
  };
  for (const [name, model] of Object.entries(models)) {
    if (model) {
      try {
        await model.deleteMany({});
      } catch (err) {
        console.warn(`Failed to clear ${name}:`, err.message);
      }
    }
  }
  console.log("✅ Database cleared (for available models)");
};

// Seed Users with different roles
const seedUsers = async () => {
  if (!User) {
    throw new Error("User model is required but not found. Cannot seed users.");
  }

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
    // New Accountant
    {
      fullName: "Nguyễn Văn Kế Toán",
      phone: "0906000002",
      email: "ketoan@englishcenter.com",
      password: "123456",
      role: "accountant",
      status: "active",
      isFirstLogin: true,
    },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

// Seed role-specific profiles (only if corresponding models exist)
const seedProfiles = async (users) => {
  console.log("\n📋 Seeding Profiles...");

  const directorUser = users.find((u) => u.role === "director");
  const teacherUsers = users.filter((u) => u.role === "teacher");
  const studentUsers = users.filter((u) => u.role === "student");
  const academicUser = users.find((u) => u.role === "academic");
  const enrollmentUser = users.find((u) => u.role === "enrollment");
  const accountantUser = users.find((u) => u.role === "accountant");

  const teachers = [];
  const students = [];

  if (Staff && teacherUsers.length > 0) {
    for (let i = 0; i < teacherUsers.length; i++) {
      try {
        const teacher = await Staff.create({
          user: teacherUsers[i]._id,
          staffType: "teacher",
          staffCode: `NVGV${(i + 1).toString().padStart(3, '0')}`,
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
          dateJoined: new Date("2020-01-15"),
        });
        teachers.push(teacher);
        console.log(`✅ Created teacher profile: ${teacherUsers[i].fullName}`);
      } catch (err) {
        console.warn("Failed to create teacher profile:", err.message);
      }
    }
  } else {
    console.warn(
      "Skipping teacher profiles (Staff model not available or no teacher users)."
    );
  }

  if (Student && studentUsers.length > 0) {
    for (let i = 0; i < studentUsers.length; i++) {
      try {
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
      } catch (err) {
        console.warn("Failed to create student profile:", err.message);
      }
    }
  } else {
    console.warn(
      "Skipping student profiles (Student model not available or no student users)."
    );
  }

  if (Staff && academicUser) {
    try {
      const academicStaff = await Staff.create({
        user: academicUser._id,
        staffCode: "NVHV001",
        staffType: "academic",
        dateOfBirth: new Date("1990-05-20"),
        gender: "female",
        address: "456 Academic Street, HCMC",
        employmentStatus: "active",
        dateJoined: new Date("2021-03-01"),
      });
      console.log(
        `✅ Created academic staff profile: ${academicUser.fullName}`
      );
    } catch (err) {
      console.warn("Failed to create academic staff profile:", err.message);
    }
  } else {
    console.warn(
      "Skipping academic staff profile (Staff model not available or user missing)."
    );
  }

  if (Staff && enrollmentUser) {
    try {
      const enrollmentStaff = await Staff.create({
        user: enrollmentUser._id,
        staffCode: "NVTS001",
        staffType: "enrollment",
        dateOfBirth: new Date("1992-08-15"),
        gender: "male",
        address: "789 Enrollment Road, HCMC",
        employmentStatus: "active",
        dateJoined: new Date("2021-06-01"),
      });
      console.log(
        `✅ Created enrollment staff profile: ${enrollmentUser.fullName}`
      );
    } catch (err) {
      console.warn("Failed to create enrollment staff profile:", err.message);
    }
  } else {
    console.warn(
      "Skipping enrollment staff profile (Staff model not available or user missing)."
    );
  }

  if (Staff && accountantUser) {
    try {
      const accountant = await Staff.create({
        user: accountantUser._id,
        staffCode: "NVKT001",
        staffType: "accountant",
        dateOfBirth: new Date("1988-11-30"),
        gender: "female",
        address: "321 Finance Avenue, HCMC",
        employmentStatus: "active",
        dateJoined: new Date("2020-09-01"),
      });
      console.log(`✅ Created accountant profile: ${accountantUser.fullName}`);
    } catch (err) {
      console.warn("Failed to create accountant profile:", err.message);
    }
  } else {
    console.warn(
      "Skipping accountant profile (Staff model not available or user missing)."
    );
  }

  return { teachers, students };
};

// Seed Courses (only if Course model exists)
const seedCourses = async () => {
  if (!Course) {
    console.warn("Skipping courses (Course model not available).");
    return [];
  }

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

  try {
    const createdCourses = await Course.create(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);
    return createdCourses;
  } catch (err) {
    console.warn("Failed to create courses:", err.message);
    return [];
  }
};

// Seed Classes (only if Class model exists)
const seedClasses = async (courses, teachers, students) => {
  if (!Class) {
    console.warn("Skipping classes (Class model not available).");
    return [];
  }
  console.log("\n🏫 Seeding Classes...");

  try {
    const classes = [
      {
        name: "Beginner Class A1",
        course: courses[0]?._id,
        teacher: teachers[0]?._id,
        students: students[0]
          ? [
              {
                student: students[0]._id,
                enrolledDate: new Date("2025-01-10"),
                status: "active",
              },
            ]
          : [],
        capacity: 15,
        room: "Room A101",
        schedule: [
          { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
          { dayOfWeek: 3, startTime: "18:00", endTime: "20:00" },
          { dayOfWeek: 5, startTime: "18:00", endTime: "20:00" },
        ],
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-04-15"),
        status: "ongoing",
      },
      {
        name: "IELTS Class B1",
        course: courses[1]?._id,
        teacher: teachers[1]?._id,
        students: students[1]
          ? [
              {
                student: students[1]._id,
                enrolledDate: new Date("2025-01-25"),
                status: "active",
              },
            ]
          : [],
        capacity: 12,
        room: "Room B202",
        schedule: [
          { dayOfWeek: 2, startTime: "19:00", endTime: "21:30" },
          { dayOfWeek: 4, startTime: "19:00", endTime: "21:30" },
        ],
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-05-31"),
        status: "ongoing",
      },
    ];

    const createdClasses = await Class.create(classes);
    console.log(`✅ Created ${createdClasses.length} classes`);

    // Update references only if the related models/ids exist
    if (courses[0] && createdClasses[0])
      await Course.findByIdAndUpdate(courses[0]._id, {
        $push: { classes: createdClasses[0]._id },
      }).catch(() => {});
    if (courses[1] && createdClasses[1])
      await Course.findByIdAndUpdate(courses[1]._id, {
        $push: { classes: createdClasses[1]._id },
      }).catch(() => {});

    if (teachers[0] && createdClasses[0])
      await Staff.findByIdAndUpdate(teachers[0]._id, {
        $push: { teachingClasses: createdClasses[0]._id },
      }).catch(() => {});
    if (teachers[1] && createdClasses[1])
      await Staff.findByIdAndUpdate(teachers[1]._id, {
        $push: { teachingClasses: createdClasses[1]._id },
      }).catch(() => {});

    if (students[0] && courses[0])
      await Student.findByIdAndUpdate(students[0]._id, {
        $push: { enrolledCourses: courses[0]._id },
      }).catch(() => {});
    if (students[1] && courses[1])
      await Student.findByIdAndUpdate(students[1]._id, {
        $push: { enrolledCourses: courses[1]._id },
      }).catch(() => {});

    return createdClasses;
  } catch (err) {
    console.warn("Failed to create classes:", err.message);
    return [];
  }
};

// Print login credentials (only uses User)
const printCredentials = async () => {
  if (!User)
    return console.warn("User model missing - cannot print credentials.");

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
