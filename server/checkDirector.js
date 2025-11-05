require("dotenv").config();
const mongoose = require("mongoose");
const Staff = require("./models/Staff");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Kiểm tra tài khoản director
    const director = await Staff.findOne({
      email: "director@englishcenter.com",
    });

    if (director) {
      console.log("\n📋 Tài khoản director hiện tại:");
      console.log("ID:", director._id);
      console.log("Email:", director.email);
      console.log("Họ tên:", director.fullName);
      console.log("Position:", director.position);
      console.log("Department:", director.department);
      console.log("Password (hashed):", director.password);
    } else {
      console.log("❌ Không tìm thấy account director");
    }

    // Kiểm tra xem matchPassword có hoạt động không
    if (director) {
      const isMatch = await director.matchPassword("director123");
      console.log("\n🔐 Test mật khẩu: director123");
      console.log("Kết quả:", isMatch ? "✅ Đúng" : "❌ Sai");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
};

connectDB();
