(async () => {
  try {
    const mongoose = require("mongoose");
    const Student = require("./src/shared/models/Student.model");
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/english-center-db";
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const s = await Student.findOne({ phone: "0999888777" }).select(
      "+password"
    );
    if (!s) {
      console.log("Student not found");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("Found student:", s.fullName);
    console.log(
      "Stored password hash (first 60 chars):",
      s.password ? s.password.substring(0, 60) + "..." : "N/A"
    );

    const check1 = await s.comparePassword("123456");
    const check2 = await s.comparePassword("123");
    console.log('comparePassword("123456") =>', check1);
    console.log('comparePassword("123") =>', check2);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error checking password:", err);
    process.exit(1);
  }
})();
