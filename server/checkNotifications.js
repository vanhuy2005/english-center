require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");
const Notification = require("./src/shared/models/Notification.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function checkNotifications() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Kiểm tra tất cả notifications
    const allNotifications = await Notification.find();
    console.log(`📊 Total notifications in DB: ${allNotifications.length}`);

    if (allNotifications.length > 0) {
      console.log("\n📋 Sample notifications:");
      allNotifications.slice(0, 3).forEach((n) => {
        console.log(
          `  - ${n.title} (recipient: ${n.recipient?.fullName || n.recipient})`
        );
      });
    }

    // 2. Kiểm tra students
    const students = await Student.find({ status: "active" }).limit(5);
    console.log(`\n👥 Active students: ${students.length}`);

    if (students.length > 0) {
      console.log("\n📝 Sample students:");
      students.forEach((s) => {
        console.log(`  - ${s.fullName} (ID: ${s._id}, Code: ${s.studentCode})`);
      });

      // 3. Kiểm tra notifications cho student đầu tiên
      console.log(`\n🔍 Checking notifications for each student...\n`);

      for (const student of students) {
        const studentNotifications = await Notification.find({
          recipient: student._id,
        });
        console.log(
          `  ${student.fullName}: ${studentNotifications.length} notifications`
        );

        if (studentNotifications.length === 0) {
          const now = new Date();
          const notifications = [
            {
              recipient: student._id,
              type: "announcement",
              title: "Chào mừng bạn đến với trung tâm",
              message:
                "Chào mừng bạn đến với trung tâm Tiếng Anh. Chúc bạn học tập tốt!",
              priority: "normal",
              isRead: false,
              createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
            },
            {
              recipient: student._id,
              type: "class_schedule",
              title: "Lịch học tuần tới",
              message:
                "Lớp học của bạn sẽ bắt đầu vào thứ Hai, 8:00 AM. Vui lòng đến đúng giờ.",
              priority: "high",
              link: "/student/schedule",
              isRead: false,
              createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
            },
            {
              recipient: student._id,
              type: "grade_published",
              title: "Điểm kiểm tra đã được công bố",
              message:
                "Điểm bài kiểm tra giữa kỳ của bạn đã được cập nhật. Hãy kiểm tra kết quả.",
              priority: "normal",
              link: "/student/grades",
              isRead: false,
              createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
            },
            {
              recipient: student._id,
              type: "payment_reminder",
              title: "Nhắc nhở học phí",
              message:
                "Học phí tháng này sẽ đến hạn vào ngày 30. Vui lòng thanh toán đúng hạn.",
              priority: "high",
              link: "/student/finance",
              isRead: false,
              createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6),
            },
            {
              recipient: student._id,
              type: "attendance_alert",
              title: "Thông báo điểm danh",
              message:
                "Bạn đã vắng mặt 1 buổi học. Hãy chú ý tham gia đầy đủ để đạt kết quả tốt.",
              priority: "normal",
              link: "/student/attendance",
              isRead: true,
              readAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
              createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
            },
          ];

          await Notification.insertMany(notifications);
          console.log(`    ✅ Created ${notifications.length} notifications`);
        }
      }
    } else {
      console.log("\n❌ No active students found!");
    }

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkNotifications();
