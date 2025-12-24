const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");

const Staff = require("../../src/shared/models/Staff.model");
const Student = require("../../src/shared/models/Student.model");
const ClassModel = require("../../src/shared/models/Class.model");
const Finance = require("../../src/shared/models/Finance.model");
const Receipt = require("../../src/shared/models/Receipt.model");
const Notification = require("../../src/shared/models/Notification.model");

describe("Receipts auto-create Finance when missing", () => {
  let staff;
  let staffToken;
  let student;
  let cls;

  beforeAll(async () => {
    const dbUri =
      process.env.MONGO_URI_TEST ||
      "mongodb://localhost:27017/english-center-test";
    await mongoose.connect(dbUri);

    // ensure staff
    staff = await Staff.findOne({ email: "test.accountant@example.com" });
    if (!staff) {
      staff = await Staff.create({
        email: "test.accountant@example.com",
        password: "Accountant123!",
        fullName: "Test Accountant",
        phone: "0900000001",
        staffCode: "ACCTEST001",
        staffType: "accountant",
      });
    }

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: staff.email, password: "Accountant123!" });
    expect(loginRes.status).toBe(200);
    staffToken = loginRes.body.data.token;

    student = await Student.findOne({
      email: "test.auto.create.student@example.com",
    });
    if (!student) {
      student = await Student.create({
        fullName: "Auto Student",
        email: "test.auto.create.student@example.com",
        studentCode: `STU${Date.now()}`,
      });
    }

    cls = await ClassModel.findOne();
    if (!cls) {
      const Course = require("../../src/shared/models/Course.model");
      const course = await Course.create({
        name: "Auto Course",
        level: "beginner",
        duration: { weeks: 4, hours: 16 },
        fee: { amount: 100000 },
      });
      cls = await ClassModel.create({
        name: "Auto Class",
        course: course._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      });
    }

    // Ensure no Finance for this student
    await Finance.deleteMany({ student: student._id });
    await Receipt.deleteMany({ student: student._id });
    await Notification.deleteMany({ recipient: student._id });
  });

  afterAll(async () => {
    await Finance.deleteMany({ student: student._id });
    await Receipt.deleteMany({ student: student._id });
    await Notification.deleteMany({ recipient: student._id });
    await mongoose.connection.close();
  });

  test("POST /api/receipts should create a Finance record if missing and mark paid", async () => {
    const resp = await request(app)
      .post("/api/receipts")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        studentId: student._id.toString(),
        classId: cls._id.toString(),
        amount: 50000,
        paymentMethod: "cash",
        type: "tuition",
      });

    expect(resp.status).toBe(201);
    expect(resp.body.success).toBe(true);

    // Verify a Finance record exists
    const finance = await Finance.findOne({ student: student._id }).sort({
      createdAt: -1,
    });
    expect(finance).toBeTruthy();
    expect(finance.amount).toBe(50000);
    expect(finance.paidAmount).toBe(50000);
    expect(finance.remainingAmount).toBe(0);
    expect(["paid", "partial", "pending"]).toContain(finance.status);

    const receipt = await Receipt.findOne({ student: student._id });
    expect(receipt).toBeTruthy();

    const notif = await Notification.findOne({ recipient: student._id });
    expect(notif).toBeTruthy();
  });

  test("prefers pending/partial finance for update when multiple exist", async () => {
    // Create a paid finance (old)
    const paidFinance = await Finance.create({
      student: student._id,
      course: cls.course,
      type: "tuition",
      amount: 100000,
      paidAmount: 100000,
      remainingAmount: 0,
      status: "paid",
      paymentMethod: "cash",
      createdBy: staff._id,
    });

    // Create a pending finance (should be chosen)
    const pendingFinance = await Finance.create({
      student: student._id,
      course: cls.course,
      type: "tuition",
      amount: 200000,
      paidAmount: 0,
      remainingAmount: 200000,
      status: "pending",
      paymentMethod: "cash",
      createdBy: staff._id,
    });

    // Post a payment which should apply to the pending finance
    const resp = await request(app)
      .post("/api/receipts")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        studentId: student._id.toString(),
        classId: cls._id.toString(),
        amount: 50000,
        paymentMethod: "cash",
        type: "tuition",
      });

    expect(resp.status).toBe(201);

    // Reload finances
    const updatedPending = await Finance.findById(pendingFinance._id);
    const reloadedPaid = await Finance.findById(paidFinance._id);

    expect(updatedPending.paidAmount).toBe(50000);
    expect(updatedPending.remainingAmount).toBe(150000);
    expect(updatedPending.status).toBe("partial");

    // Paid finance should remain unchanged
    expect(reloadedPaid.paidAmount).toBe(100000);

    // cleanup
    await Finance.findByIdAndDelete(paidFinance._id);
    await Finance.findByIdAndDelete(pendingFinance._id);
  });
});
