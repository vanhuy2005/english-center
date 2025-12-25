const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

const Staff = require("../src/shared/models/Staff.model");
const Notification = require("../src/shared/models/Notification.model");
const Course = require("../src/shared/models/Course.model");

describe("Consultation Request Integration", () => {
  let authToken;
  let studentId;
  let courseId;

  beforeAll(async () => {
    const dbUri =
      process.env.MONGO_URI_TEST ||
      "mongodb://localhost:27017/english-center-test";
    await mongoose.connect(dbUri);

    // Login as existing seeded student
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "student1@test.com",
      password: "Student123!",
    });
    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.data.token;
    studentId = loginRes.body.data.user._id;

    const course = await Course.findOne();
    courseId = course._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("POST /api/requests - consultation creates request and notifies enrollment staff", async () => {
    // Ensure an enrollment staff exists
    let enrollStaff = await Staff.findOne({ staffType: "enrollment" });
    if (!enrollStaff) {
      enrollStaff = await Staff.create({
        email: "test.enroll@example.com",
        password: "Enroll123!",
        fullName: "Test Enroller",
        phone: "0900000002",
        staffCode: "ENRTEST001",
        staffType: "enrollment",
      });
    }

    const payload = {
      type: "consultation",
      course: courseId.toString(),
      phone: "0901111222",
      preferredDate: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
      note: "Tôi muốn tư vấn về lịch học buổi tối",
    };

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const reqData = res.body.data;
    expect(reqData.type).toBe("consultation");
    expect(reqData.contactPhone).toBe(payload.phone);
    expect(reqData.additionalNote).toBe(payload.note);

    // Notification check
    const notif = await Notification.findOne({
      relatedModel: "Request",
      relatedId: reqData._id,
    });
    expect(notif).toBeTruthy();
    expect(notif.type).toBeDefined();
  });

  test("POST /api/requests - consultation without course/class succeeds", async () => {
    const payload = {
      type: "consultation",
      phone: "0903333444",
      note: "Tư vấn chung về các khóa học",
    };

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const reqData = res.body.data;
    expect(reqData.type).toBe("consultation");
    expect(reqData.contactPhone).toBe(payload.phone);
    expect(reqData.additionalNote).toBe(payload.note);
  });
});
