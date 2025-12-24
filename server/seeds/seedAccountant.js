#!/usr/bin/env node
require("dotenv").config();

const connectDB = require("../src/config/database");
const Staff = require("../src/shared/models/Staff.model");

const DEFAULT = {
  email: process.env.SEED_ACCOUNTANT_EMAIL || "accountant@example.com",
  password: process.env.SEED_ACCOUNTANT_PASSWORD || "Accountant123!",
  fullName: process.env.SEED_ACCOUNTANT_NAME || "Nguyễn Thị Kế Toán",
  phone: process.env.SEED_ACCOUNTANT_PHONE || "0912345679",
  staffCode: process.env.SEED_ACCOUNTANT_CODE || "ACC001",
  staffType: "accountant",
  department: process.env.SEED_ACCOUNTANT_DEPARTMENT || "Phòng Tài chính",
  position: process.env.SEED_ACCOUNTANT_POSITION || "Kế toán trưởng",
  responsibilities: [
    "Quản lý thu chi",
    "Theo dõi công nợ học viên",
    "Lập báo cáo tài chính",
    "Quản lý biên lai",
  ],
  status: "active",
};

(async () => {
  try {
    await connectDB();

    // Prefer matching by staffCode, then email
    let staff = null;
    if (DEFAULT.staffCode) {
      staff = await Staff.findOne({ staffCode: DEFAULT.staffCode }).exec();
    }
    if (!staff && DEFAULT.email) {
      staff = await Staff.findOne({ email: DEFAULT.email }).exec();
    }

    if (staff) {
      console.log(
        "ℹ️  Accountant account already exists — updating fields (password will be updated if provided)."
      );
      staff.fullName = DEFAULT.fullName;
      staff.phone = DEFAULT.phone;
      staff.email = DEFAULT.email;
      staff.position = DEFAULT.position;
      staff.department = DEFAULT.department;
      staff.responsibilities = DEFAULT.responsibilities;
      staff.staffType = DEFAULT.staffType;
      // Set plain password so pre-save hook hashes it (do not hash here)
      if (DEFAULT.password) staff.password = DEFAULT.password;
      await staff.save();
      console.log("✅ Accountant account updated:", staff.staffCode || staff._id);
    } else {
      console.log("ℹ️  Creating new accountant account...");
      const created = new Staff(DEFAULT);
      await created.save();
      console.log(
        "✅ Accountant account created:",
        created.staffCode || created._id
      );
      console.log(`📧 Email: ${created.email}`);
      console.log(`🔑 Password: ${DEFAULT.password}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ SEED ACCOUNTANT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`👤 Staff Code: ${DEFAULT.staffCode}`);
    console.log(`📧 Email: ${DEFAULT.email}`);
    console.log(`🔑 Password: ${DEFAULT.password}`);
    console.log(`👔 Position: ${DEFAULT.position}`);
    console.log(`🏢 Department: ${DEFAULT.department}`);
    console.log("=".repeat(60));

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed accountant account:", err.message || err);
    console.error(err);
    process.exit(1);
  }
})();
