const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

const Staff = require("../src/shared/models/Staff.model");
const Student = require("../src/shared/models/Student.model");
const ClassModel = require("../src/shared/models/Class.model");
const Finance = require("../src/shared/models/Finance.model");
const Receipt = require("../src/shared/models/Receipt.model");
const Notification = require("../src/shared/models/Notification.model");

describe("Receipts -> Finance integration", () => {
  let staffToken;
  let student;
  let cls;
  let createdFinance;

  beforeAll(async () => {
    const dbUri =
      process.env.MONGO_URI_TEST ||
      "mongodb://localhost:27017/english-center-test";
    await mongoose.connect(dbUri);

    // Ensure staff (accountant)
    let staff = await Staff.findOne({ email: "test.accountant@example.com" });
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

    // login
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test.accountant@example.com",
      password: "Accountant123!",
    });
    expect(loginRes.status).toBe(200);
    staffToken = loginRes.body.data.token;

    student = await Student.findOne();
    cls = await ClassModel.findOne();

    if (!student || !cls) {
      throw new Error("Test requires at least one student and one class in DB");
    }

    // Create Finance record tied to course of the class
    const courseId = cls.course;
    createdFinance = await Finance.create({
      student: student._id,
      course: courseId,
      amount: 200000,
      paidAmount: 0,
      remainingAmount: 200000,
      status: "pending",
    });
  });

  afterAll(async () => {
    // Cleanup receipts and finance
    await Receipt.deleteMany({ student: student._id });
    await Finance.findByIdAndDelete(createdFinance._id);
    await Notification.deleteMany({ recipient: student._id });
    await mongoose.connection.close();
  });

  test("POST /api/receipts updates Finance when classId is provided", async () => {
    const receiptBody = {
      studentId: student._id.toString(),
      classId: cls._id.toString(),
      amount: 100000,
      paymentMethod: "cash",
      type: "tuition",
    };

    const resp = await request(app)
      .post("/api/receipts")
      .set("Authorization", `Bearer ${staffToken}`)
      .send(receiptBody);

    expect(resp.status).toBe(201);
    expect(resp.body.success).toBe(true);

    // Reload finance
    const fin = await Finance.findById(createdFinance._id);
    expect(fin).toBeTruthy();
    expect(fin.paidAmount).toBe(100000);
    expect(fin.remainingAmount).toBe(100000);
    expect(["partial", "paid"]).toContain(fin.status);

    // Notification should exist for student
    const notif = await Notification.findOne({ recipient: student._id });
    expect(notif).toBeTruthy();
    expect(notif.message).toMatch(/Đã thanh toán/);
  });

  test("POST /api/receipts with refund reduces Finance paidAmount", async () => {
    const refundBody = {
      studentId: student._id.toString(),
      classId: cls._id.toString(),
      amount: 50000,
      paymentMethod: "cash",
      type: "refund",
    };

    const resp = await request(app)
      .post("/api/receipts")
      .set("Authorization", `Bearer ${staffToken}`)
      .send(refundBody);

    expect(resp.status).toBe(201);
    expect(resp.body.success).toBe(true);

    const fin = await Finance.findById(createdFinance._id);
    expect(fin).toBeTruthy();
    expect(fin.paidAmount).toBe(50000); // 100000 - 50000
    expect(fin.remainingAmount).toBe(150000);
    // status might be partial or refunded depending on logic
    expect(["partial", "refunded", "paid"]).toContain(fin.status);

    const refundReceipt = await Receipt.findOne({
      type: "refund",
      student: student._id,
    });
    expect(refundReceipt).toBeTruthy();
  });
});
