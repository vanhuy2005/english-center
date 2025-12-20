#!/usr/bin/env node
require("dotenv").config();

const connectDB = require("./src/config/database");
const Staff = require("./src/shared/models/Staff.model");

async function main() {
  try {
    await connectDB();

    const phone = process.env.SEED_DIRECTOR_PHONE || "1234567890";
    const email = process.env.SEED_DIRECTOR_EMAIL || "director123@example.local";
    const staffCode = process.env.SEED_DIRECTOR_CODE || "DIR002";
    const password = process.env.SEED_DIRECTOR_PASSWORD || "123456";

    // Check if director with same phone or staffCode exists
    const existing = await Staff.findOne({
      $or: [{ phone }, { staffCode }],
    }).exec();
    if (existing) {
      console.log("Director account already exists:");
      console.log(existing.getPublicProfile());
      process.exit(0);
    }

    const director = new Staff({
      fullName: "Director Test",
      phone,
      email,
      password,
      staffCode,
      staffType: "director",
      isFirstLogin: true,
    });

    await director.save();

    console.log("✅ Director account created");
    console.log("phone:", phone);
    console.log("password:", password);
    console.log("staffCode:", staffCode);
    process.exit(0);
  } catch (err) {
    console.error("Failed to create director account:", err);
    process.exit(1);
  }
}

main();
