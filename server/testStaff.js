require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const User = require("./src/shared/models/User.model");
const Staff = require("./src/shared/models/Staff.model");

const testStaff = async () => {
  try {
    await connectDB();
    
    // Tìm user với role academic
    const academicUser = await User.findOne({ role: "academic" });
    console.log("Academic User:", academicUser ? academicUser.fullName : "Not found");
    
    if (academicUser) {
      // Kiểm tra xem đã có staff record chưa
      const existingStaff = await Staff.findOne({ user: academicUser._id });
      console.log("Existing Staff:", existingStaff ? "Found" : "Not found");
      
      if (!existingStaff) {
        // Tạo staff record
        const staff = await Staff.create({
          user: academicUser._id,
          staffCode: "NVHV001",
          staffType: "academic",
          dateOfBirth: new Date("1990-05-20"),
          gender: "female",
          address: "456 Academic Street, HCMC",
          employmentStatus: "active",
          dateJoined: new Date("2021-03-01"),
        });
        console.log("✅ Created staff:", staff);
      }
    }
    
    // Đếm tổng số staff
    const count = await Staff.countDocuments();
    console.log("\nTotal staff records:", count);
    
    // Hiển thị tất cả staff
    const allStaff = await Staff.find().populate("user", "fullName role");
    console.log("\nAll staff:");
    allStaff.forEach(s => {
      console.log(`- ${s.staffCode}: ${s.user?.fullName} (${s.staffType})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testStaff();
