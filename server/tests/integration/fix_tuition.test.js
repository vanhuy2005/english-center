const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

const Staff = require("../src/shared/models/Staff.model");
const Course = require("../src/shared/models/Course.model");

describe("Fix Tuition Migration Endpoint", () => {
  let directorToken;

  beforeAll(async () => {
    const dbUri =
      process.env.MONGO_URI_TEST ||
      "mongodb://localhost:27017/english-center-test";
    await mongoose.connect(dbUri);

    // Ensure director user
    let director = await Staff.findOne({ staffType: "director" });
    if (!director) {
      director = await Staff.create({
        email: "test.director@example.com",
        password: "Director123!",
        fullName: "Test Director",
        phone: "0900000009",
        staffCode: "DIRTEST001",
        staffType: "director",
      });
    }

    const loginRes = await request(app).post("/api/auth/login").send({
      email: director.email,
      password: "Director123!",
    });
    expect(loginRes.status).toBe(200);
    directorToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("POST /api/courses/fix-tuition updates courses with null/0 tuition", async () => {
    // Create test course with tuition null
    const testCourse = await Course.create({
      name: "TUITION_TEST_COURSE",
      tuition: null,
      level: "beginner",
    });

    const res = await request(app)
      .post("/api/courses/fix-tuition")
      .set("Authorization", `Bearer ${directorToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("modifiedCount");
    expect(res.body.data.modifiedCount).toBeGreaterThanOrEqual(1);

    const updated = await Course.findById(testCourse._id);
    expect(updated.tuition).toBe(3500000);
  });
});
