const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Student = require("../src/shared/models/Student.model");

describe("Student Courses With Stats", () => {
  let authToken;
  let studentId;

  beforeAll(async () => {
    const dbUri =
      process.env.MONGO_URI_TEST ||
      "mongodb://localhost:27017/english-center-test";
    await mongoose.connect(dbUri);

    // Login as seeded student
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ phone: "0900000000", password: "Student123!" })
      .catch(() => null);
    if (loginRes && loginRes.status === 200) {
      authToken = loginRes.body.data.token;
      studentId = loginRes.body.data.user._id;
    } else {
      // try student1
      const loginRes2 = await request(app)
        .post("/api/auth/login")
        .send({ email: "student1@test.com", password: "Student123!" });
      authToken = loginRes2.body.data.token;
      studentId = loginRes2.body.data.user._id;
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("GET /api/students/me/courses returns courses with stats", async () => {
    const res = await request(app)
      .get("/api/students/me/courses")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const item = res.body.data[0];
      expect(item).toHaveProperty("progress");
      expect(item).toHaveProperty("attendanceRate");
      expect(item).toHaveProperty("averageGrade");
    }
  });
});
