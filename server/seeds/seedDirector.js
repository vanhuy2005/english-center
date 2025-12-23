#!/usr/bin/env node
require("dotenv").config();

const connectDB = require("./src/config/database");
const Staff = require("./src/shared/models/Staff.model");

const DEFAULT = {
  email: process.env.SEED_DIRECTOR_EMAIL || "director@example.com",
  password: process.env.SEED_DIRECTOR_PASSWORD || "Director123!",
  fullName: process.env.SEED_DIRECTOR_NAME || "Giám đốc Hệ thống",
  phone: process.env.SEED_DIRECTOR_PHONE || "0912345678",
  staffCode: process.env.SEED_DIRECTOR_CODE || "DIR001",
  staffType: "director",
  department: process.env.SEED_DIRECTOR_DEPARTMENT || "Ban Giám đốc",
  position: process.env.SEED_DIRECTOR_POSITION || "Giám đốc",
  responsibilities: ["Lãnh đạo chiến lược", "Quản lý hoạt động"],
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
        "ℹ️  Director account already exists — updating fields (password will be updated if provided)."
      );
      staff.fullName = DEFAULT.fullName;
      staff.phone = DEFAULT.phone;
      staff.email = DEFAULT.email;
      staff.position = DEFAULT.position;
      staff.department = DEFAULT.department;
      staff.responsibilities = DEFAULT.responsibilities;
      // Set plain password so pre-save hook hashes it (do not hash here)
      if (DEFAULT.password) staff.password = DEFAULT.password;
      await staff.save();
      console.log("✅ Director account updated:", staff.staffCode || staff._id);
    } else {
      console.log("ℹ️  Creating new director account...");
      const created = new Staff(DEFAULT);
      await created.save();
      console.log(
        "✅ Director account created:",
        created.staffCode || created._id
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed director account:", err.message || err);
    console.error(err);
    process.exit(1);
  }
})();
