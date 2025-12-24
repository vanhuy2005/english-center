const mongoose = require("mongoose");
const Student = require("../src/shared/models/Student.model");
const ClassModel = require("../src/shared/models/Class.model");
const Finance = require("../src/shared/models/Finance.model");
const Receipt = require("../src/shared/models/Receipt.model");
const Notification = require("../src/shared/models/Notification.model");

(async function () {
  const dbUri =
    process.env.MONGO_URI_TEST ||
    "mongodb://localhost:27017/english-center-test";
  await mongoose.connect(dbUri);
  console.log("Connected to DB");

  let student = await Student.findOne();
  let cls = await ClassModel.findOne();

  // If missing, create test Course, Class, Student
  if (!student) {
    const Course = require("../src/shared/models/Course.model");
    const course = await Course.create({
      name: "Test Course",
      level: "beginner",
      duration: { weeks: 8, hours: 32 },
      fee: { amount: 200000 },
    });
    student = await Student.create({
      fullName: "Test Student",
      email: "test.student@example.com",
      phone: "0900000002",
      studentCode: "STU_TEST_001",
    });
    cls = await ClassModel.create({
      name: "Test Class",
      course: course._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });
    console.log("Created test course, class, student");
  } else if (!cls) {
    const Course = require("../src/shared/models/Course.model");
    const course = await Course.create({
      name: "Test Course",
      level: "beginner",
      duration: { weeks: 8, hours: 32 },
      fee: { amount: 200000 },
    });
    cls = await ClassModel.create({
      name: "Test Class",
      course: course._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });
    console.log("Created test class");
  }

  // Create finance
  const createdFinance = await Finance.create({
    student: student._id,
    course: cls.course,
    type: "tuition",
    amount: 200000,
    paidAmount: 0,
    remainingAmount: 200000,
    status: "pending",
    paymentMethod: "cash",
    createdBy: new mongoose.Types.ObjectId(),
  });
  console.log("Created finance", createdFinance._id);

  // Simulate receipt creation logic (without HTTP, no transactions)
  try {
    const studentId = student._id.toString();
    const classId = cls._id.toString();
    const amount = 100000;
    const type = "tuition";

    const newReceipt = await Receipt.create({
      student: studentId,
      class: classId,
      amount: amount,
      paymentMethod: "cash",
      description: "Test payment",
      type,
      status: "active",
      createdBy: new mongoose.Types.ObjectId(),
    });

    // Map class -> course
    let courseId = null;
    try {
      const classInfo = await ClassModel.findById(classId).select("course");
      if (classInfo) courseId = classInfo.course;
    } catch (e) {
      console.warn("Error fetching class for manual test", e.message);
    }

    const financeQuery = { student: studentId };
    if (courseId) financeQuery.course = courseId;

    console.log("Searching finance with query", financeQuery);

    let financeRecord = await Finance.findOne(financeQuery).sort({
      createdAt: -1,
    });
    if (!financeRecord && courseId) {
      financeRecord = await Finance.findOne({ student: studentId }).sort({
        createdAt: -1,
      });
    }

    if (financeRecord) {
      financeRecord.paidAmount = (financeRecord.paidAmount || 0) + amount;
      financeRecord.remainingAmount = Math.max(
        0,
        (financeRecord.amount || 0) - financeRecord.paidAmount
      );
      financeRecord.status =
        financeRecord.paidAmount >= financeRecord.amount ? "paid" : "partial";
      await financeRecord.save();
      console.log("Finance updated in manual test");
    } else {
      console.warn("Finance not found in manual test");
    }

    await Notification.create({
      recipient: student._id,
      type: "payment_reminder",
      title: "Test payment",
      message: `Đã thanh toán ${amount}đ`,
      relatedModel: "Receipt",
      relatedId: newReceipt._id,
      isRead: false,
    });

    const fin = await Finance.findById(createdFinance._id);
    console.log("Finance after manual insert:", JSON.stringify(fin, null, 2));

    // Cleanup
    await Receipt.deleteMany({ student: student._id });
    await Finance.findByIdAndDelete(createdFinance._id);
    await Notification.deleteMany({ recipient: student._id });

    await mongoose.connection.close();
    console.log("Done");
    process.exit(0);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Manual test transaction error", error);
    process.exit(1);
  }
})();
