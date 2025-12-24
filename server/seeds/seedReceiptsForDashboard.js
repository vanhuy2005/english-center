#!/usr/bin/env node
require("dotenv").config();

const connectDB = require("../src/config/database");
const Receipt = require("../src/shared/models/Receipt.model");
const Student = require("../src/shared/models/Student.model");
const Class = require("../src/shared/models/Class.model");
const Staff = require("../src/shared/models/Staff.model");

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // 1. Lấy dữ liệu cần thiết
    const students = await Student.find().limit(50);
    const classes = await Class.find().limit(20);
    const staff = await Staff.findOne({ staffType: "accountant" }) || await Staff.findOne({ staffType: "director" });

    if (students.length === 0) {
      console.error("❌ Không tìm thấy học viên. Vui lòng chạy seed student trước.");
      process.exit(1);
    }

    if (!staff) {
      console.error("❌ Không tìm thấy nhân viên. Vui lòng chạy seed staff trước.");
      process.exit(1);
    }

    console.log(`📊 Tìm thấy ${students.length} học viên, ${classes.length} lớp học`);

    // 2. Xóa receipts cũ (optional - comment out nếu muốn giữ data cũ)
    // await Receipt.deleteMany({});
    // console.log("🗑️  Đã xóa receipts cũ");

    // 3. Tạo receipts mới
    const receiptsToCreate = [];
    const paymentMethods = ["cash", "bank_transfer", "credit_card", "momo"];
    const TARGET_COUNT = 100;

    // Tạo receipts cho 6 tháng gần đây
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const today = new Date();

    for (let i = 0; i < TARGET_COUNT; i++) {
      const student = getRandomItem(students);
      const classData = classes.length > 0 ? getRandomItem(classes) : null;
      
      // Phân bố thời gian: 30% tháng này, 70% các tháng trước
      let createdAt;
      if (Math.random() < 0.3) {
        // Tháng này
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const randomDay = getRandomInt(1, Math.min(daysInMonth, today.getDate()));
        createdAt = new Date(today.getFullYear(), today.getMonth(), randomDay);
      } else {
        // Các tháng trước
        const randomTime = sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime());
        createdAt = new Date(randomTime);
      }

      // Amount: 1tr - 10tr
      const amount = getRandomInt(10, 100) * 100000;

      const receipt = {
        student: student._id,
        class: classData ? classData._id : null,
        amount,
        paymentMethod: getRandomItem(paymentMethods),
        description: `Học phí ${classData ? classData.name || "khóa học" : "khóa học"}`,
        note: `Thanh toán ${i % 3 === 0 ? "đầy đủ" : i % 3 === 1 ? "trả trước" : "trả góp"}`,
        status: "active", // Receipt model chỉ có active/voided
        createdBy: staff._id,
        createdAt,
        updatedAt: createdAt,
      };

      receiptsToCreate.push(receipt);
    }

    // 4. Insert vào database
    const inserted = await Receipt.insertMany(receiptsToCreate);
    console.log(`✅ Đã tạo thành công ${inserted.length} biên lai`);

    // 5. Tính toán thống kê
    const allReceipts = await Receipt.find({ status: "active" });
    const totalRevenue = allReceipts.reduce((sum, r) => sum + r.amount, 0);
    
    const thisMonth = new Date();
    const monthRevenue = allReceipts
      .filter(r => {
        const receiptDate = new Date(r.createdAt);
        return receiptDate.getMonth() === thisMonth.getMonth() && 
               receiptDate.getFullYear() === thisMonth.getFullYear();
      })
      .reduce((sum, r) => sum + r.amount, 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 THỐNG KÊ DỮ LIỆU");
    console.log("=".repeat(60));
    console.log(`💰 Tổng doanh thu: ${totalRevenue.toLocaleString("vi-VN")}đ`);
    console.log(`📅 Doanh thu tháng này: ${monthRevenue.toLocaleString("vi-VN")}đ`);
    console.log(`📝 Tổng số biên lai: ${allReceipts.length}`);
    console.log("=".repeat(60));
    console.log("✅ Refresh trang Accountant Dashboard để xem kết quả!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
})();
