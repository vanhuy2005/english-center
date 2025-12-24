require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../src/shared/models/Student.model");
const Course = require("../src/shared/models/Course.model");
const Class = require("../src/shared/models/Class.model");
const Request = require("../src/shared/models/Request.model");
const Staff = require("../src/shared/models/Staff.model");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/english_center_dev";
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedEnrollmentData = async () => {
  try {
    await connectDB();

    console.log("\n🌱 Starting enrollment data seeding...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing enrollment data...");
    await Promise.all([
      Course.deleteMany({}),
      Class.deleteMany({}),
      Student.deleteMany({}),
      Request.deleteMany({
        type: {
          $in: [
            "course_enrollment",
            "transfer",
            "pause",
            "resume",
            "withdrawal",
          ],
        },
      }),
    ]);
    console.log("✅ Cleared existing data\n");

    // 1. Create Courses
    console.log("📚 Creating courses...");
    const courses = await Course.create([
      {
        courseCode: "ENG-A1",
        name: "English A1 - Beginner",
        description: "Khóa học tiếng Anh sơ cấp dành cho người mới bắt đầu",
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
          amount: 3500000,
          currency: "VND",
        },
        capacity: {
          min: 8,
          max: 25,
        },
        status: "active",
      },
      {
        courseCode: "ENG-A2",
        name: "English A2 - Elementary",
        description: "Khóa học tiếng Anh sơ cấp nâng cao",
        level: "elementary",
        duration: {
          hours: 60,
          weeks: 12,
        },
        schedule: {
          daysPerWeek: 3,
          hoursPerDay: 2,
        },
        fee: {
          amount: 3800000,
          currency: "VND",
        },
        capacity: {
          min: 8,
          max: 25,
        },
        status: "active",
      },
      {
        courseCode: "ENG-B1",
        name: "English B1 - Pre-Intermediate",
        description: "Khóa học tiếng Anh trung cấp",
        level: "pre-intermediate",
        duration: {
          hours: 80,
          weeks: 16,
        },
        schedule: {
          daysPerWeek: 3,
          hoursPerDay: 2,
        },
        fee: {
          amount: 4500000,
          currency: "VND",
        },
        capacity: {
          min: 8,
          max: 22,
        },
        status: "active",
      },
      {
        courseCode: "ENG-B2",
        name: "English B2 - Intermediate",
        description: "Khóa học tiếng Anh trung cấp nâng cao",
        level: "intermediate",
        duration: {
          hours: 80,
          weeks: 16,
        },
        schedule: {
          daysPerWeek: 3,
          hoursPerDay: 2,
        },
        fee: {
          amount: 4800000,
          currency: "VND",
        },
        capacity: {
          min: 8,
          max: 22,
        },
        status: "active",
      },
      {
        courseCode: "ENG-C1",
        name: "English C1 - Upper-Intermediate",
        description: "Khóa học tiếng Anh trung cao cấp",
        level: "upper-intermediate",
        duration: {
          hours: 100,
          weeks: 20,
        },
        schedule: {
          daysPerWeek: 3,
          hoursPerDay: 2,
        },
        fee: {
          amount: 5500000,
          currency: "VND",
        },
        capacity: {
          min: 6,
          max: 20,
        },
        status: "active",
      },
      {
        courseCode: "ENG-C2",
        name: "English C2 - Advanced",
        description: "Khóa học tiếng Anh nâng cao",
        level: "advanced",
        duration: {
          hours: 100,
          weeks: 20,
        },
        schedule: {
          daysPerWeek: 3,
          hoursPerDay: 2,
        },
        fee: {
          amount: 6000000,
          currency: "VND",
        },
        capacity: {
          min: 6,
          max: 18,
        },
        status: "active",
      },
    ]);
    console.log(`✅ Created ${courses.length} courses`);

    // 2. Get enrollment staff for reference
    let enrollmentStaff = await Staff.findOne({ staffType: "enrollment" });
    if (!enrollmentStaff) {
      console.log("⚠️ No enrollment staff found, creating one...");
      enrollmentStaff = await Staff.create({
        staffCode: "STAFF-ENROLL-001",
        fullName: "Phạm Thị Enrollment",
        email: "enrollment@example.com",
        password: await bcrypt.hash("123456", 10),
        phone: "0987654301",
        staffType: "enrollment",
        department: "Ghi Danh",
        status: "active",
      });
    }

    // 3. Get teachers for classes
    const teachers = await Staff.find({ staffType: "teacher" }).limit(6);
    if (teachers.length === 0) {
      console.log("⚠️ No teachers found, will create classes without teachers");
    }

    // 4. Create Classes for each course
    console.log("🏫 Creating classes...");
    const classes = [];
    const now = new Date();

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const teacher = teachers[i % teachers.length] || null;

      // Create 2 classes per course (1 ongoing, 1 upcoming)
      const ongoingClass = await Class.create({
        classCode: `${course.courseCode}-01`,
        name: `${course.name} - Lớp 01`,
        course: course._id,
        teacher: teacher?._id,
        capacity: {
          max: course.capacity.max,
          current: 0,
        },
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
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(
          now.getTime() + (course.duration.weeks * 7 - 30) * 24 * 60 * 60 * 1000
        ),
        room: `Room ${100 + i}`,
        status: "ongoing",
      });

      const upcomingClass = await Class.create({
        classCode: `${course.courseCode}-02`,
        name: `${course.name} - Lớp 02`,
        course: course._id,
        teacher: teacher?._id,
        capacity: {
          max: course.capacity.max,
          current: 0,
        },
        schedule: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: "09:00",
            endTime: "11:00",
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: "09:00",
            endTime: "11:00",
          },
          {
            dayOfWeek: 6, // Saturday
            startTime: "09:00",
            endTime: "11:00",
          },
        ],
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(
          now.getTime() + (course.duration.weeks * 7 + 14) * 24 * 60 * 60 * 1000
        ),
        room: `Room ${200 + i}`,
        status: "upcoming",
      });

      classes.push(ongoingClass, upcomingClass);
    }
    console.log(`✅ Created ${classes.length} classes`);

    // 5. Create Students
    console.log("👥 Creating students...");
    const studentNames = [
      "Nguyễn Văn An",
      "Trần Thị Bình",
      "Lê Văn Cường",
      "Phạm Thị Dung",
      "Hoàng Văn Em",
      "Vũ Thị Phương",
      "Đặng Văn Giang",
      "Bùi Thị Hà",
      "Ngô Văn Hùng",
      "Đinh Thị Lan",
      "Trương Văn Khoa",
      "Phan Thị Linh",
      "Mai Văn Minh",
      "Cao Thị Nga",
      "Lý Văn Ơn",
      "Võ Thị Phúc",
      "Đỗ Văn Quân",
      "Tô Thị Rạng",
      "Hồ Văn Sơn",
      "La Thị Tâm",
      "Chu Văn Ước",
      "Tạ Thị Vân",
      "Dương Văn Xuyến",
      "Lưu Thị Yến",
      "Hà Văn Zung",
    ];

    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const student = await Student.create({
        fullName: studentNames[i],
        email: `student${i + 1}@example.com`,
        phone: `098765${String(4321 + i).padStart(4, "0")}`,
        password: await bcrypt.hash("123456", 10),
        dateOfBirth: new Date(
          2000 + Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        gender: i % 2 === 0 ? "male" : "female",
        address: `${i + 1} Đường ABC, Quận ${(i % 12) + 1}, TP.HCM`,
        academicStatus: i < 15 ? "active" : "inactive",
        status: "active",
        isFirstLogin: false,
      });
      students.push(student);
    }
    console.log(`✅ Created ${students.length} students`);

    // 6. Enroll students to classes
    console.log("📝 Enrolling students to classes...");
    let enrollmentCount = 0;

    for (let i = 0; i < Math.min(15, students.length); i++) {
      const student = students[i];
      const classToEnroll = classes[i % classes.length];

      // Add student to class
      classToEnroll.students.push({
        student: student._id,
        enrolledDate: new Date(
          now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000
        ),
        status: "active",
      });
      classToEnroll.capacity.current += 1;
      await classToEnroll.save();

      // Update student's enrolled courses if not already enrolled
      if (!student.enrolledCourses.includes(classToEnroll.course)) {
        student.enrolledCourses.push(classToEnroll.course);
        await student.save();
      }

      enrollmentCount++;
    }
    console.log(`✅ Enrolled ${enrollmentCount} students to classes`);

    // 7. Create Requests
    console.log("📋 Creating requests...");
    const requestTypes = [
      "course_enrollment",
      "transfer",
      "pause",
      "resume",
      "withdrawal",
    ];
    const requestStatuses = ["pending", "approved", "rejected"];

    const requests = [];
    for (let i = 0; i < 20; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const type =
        requestTypes[Math.floor(Math.random() * requestTypes.length)];
      const status =
        i < 8
          ? "pending"
          : requestStatuses[Math.floor(Math.random() * requestStatuses.length)];

      const requestData = {
        student: student._id,
        type,
        status,
        reason: `Lý do yêu cầu ${type} của học viên ${student.fullName}`,
        priority: i < 5 ? "high" : "normal",
      };

      // Add type-specific fields
      if (type === "course_enrollment") {
        requestData.course =
          courses[Math.floor(Math.random() * courses.length)]._id;
      } else if (type === "transfer") {
        const fromClass = classes[Math.floor(Math.random() * classes.length)];
        let toClass = classes[Math.floor(Math.random() * classes.length)];
        while (toClass._id.equals(fromClass._id)) {
          toClass = classes[Math.floor(Math.random() * classes.length)];
        }
        requestData.class = fromClass._id;
        requestData.targetClass = toClass._id;
      } else if (type === "pause" || type === "resume") {
        requestData.class =
          classes[Math.floor(Math.random() * classes.length)]._id;
        requestData.startDate = new Date(
          now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
        );
        if (type === "pause") {
          requestData.endDate = new Date(
            requestData.startDate.getTime() +
              (30 + Math.random() * 60) * 24 * 60 * 60 * 1000
          );
        }
      } else {
        requestData.class =
          classes[Math.floor(Math.random() * classes.length)]._id;
      }

      if (status !== "pending") {
        requestData.processedBy = enrollmentStaff._id;
        requestData.approvedDate = new Date();
        if (status === "rejected") {
          requestData.rejectionReason = "Không đủ điều kiện";
        }
      }

      const request = await Request.create(requestData);
      requests.push(request);
    }
    console.log(`✅ Created ${requests.length} requests`);

    // Summary
    console.log("\n✅ Seeding completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`🏫 Classes: ${classes.length}`);
    console.log(`👥 Students: ${students.length}`);
    console.log(`📝 Enrollments: ${enrollmentCount}`);
    console.log(`📋 Requests: ${requests.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
    process.exit(1);
  }
};

// Run the seeder
seedEnrollmentData();
