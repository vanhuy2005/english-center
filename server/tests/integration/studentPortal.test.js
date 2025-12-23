const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Student = require("../src/shared/models/Student.model");
const Course = require("../src/shared/models/Course.model");
const Enrollment = require("../src/shared/models/Enrollment.model");

describe("Student Portal Integration Tests", () => {
  let authToken;
  let studentId;
  let courseId;

  beforeAll(async () => {
    // Kết nối database test
    const dbUri =
      process.env.MONGO_URI_TEST ||
      "mongodb://localhost:27017/english-center-test";
    await mongoose.connect(dbUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Authentication", () => {
    test("POST /api/auth/login - Should login successfully", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "student1@test.com",
        password: "Student123!",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");

      authToken = response.body.data.token;
      studentId = response.body.data.user._id;
    });

    test("POST /api/auth/login - Should fail with wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "student1@test.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Enrollment Workflow", () => {
    beforeAll(async () => {
      const course = await Course.findOne();
      courseId = course._id;
    });

    test("POST /api/enrollments/course-enrollments - Should enroll in new course", async () => {
      // Xóa enrollment cũ nếu có
      await Enrollment.deleteMany({ student: studentId, course: courseId });

      const response = await request(app)
        .post("/api/enrollments/course-enrollments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          courseId: courseId.toString(),
          studentId: studentId.toString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("enrollment");
    });

    test("POST /api/enrollments/course-enrollments - Should return 409 for duplicate enrollment", async () => {
      const response = await request(app)
        .post("/api/enrollments/course-enrollments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          courseId: courseId.toString(),
          studentId: studentId.toString(),
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("đã đăng ký");
    });
  });

  describe("Finance & Tuition Workflow", () => {
    test("GET /api/students/me/tuition - Should get tuition fees", async () => {
      const response = await request(app)
        .get("/api/students/me/tuition")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("GET /api/finance/me/payments - Should get payment history", async () => {
      const response = await request(app)
        .get("/api/finance/me/payments")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      if (response.body.data.length > 0) {
        const payment = response.body.data[0];
        expect(payment).toHaveProperty("paymentDate");
        expect(payment).toHaveProperty("amount");
        expect(payment).toHaveProperty("status");
      }
    });
  });

  describe("Timetable Workflow", () => {
    test("GET /api/schedules/me - Should get schedules with date range", async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const response = await request(app)
        .get("/api/schedules/me")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const schedule = response.body.data[0];
        expect(schedule).toHaveProperty("date");
        expect(schedule).toHaveProperty("startTime");
        expect(schedule).toHaveProperty("endTime");
      }
    });
  });

  describe("Request Form Workflow", () => {
    test("POST /api/requests - Should create valid request", async () => {
      const response = await request(app)
        .post("/api/requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "leave",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          reason: "Lý do xin nghỉ học hợp lệ với đủ 10 ký tự",
          priority: "medium",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("request");
    });

    test("POST /api/requests - Should reject request with short reason (<10 chars)", async () => {
      const response = await request(app)
        .post("/api/requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "leave",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          reason: "Ngắn", // Only 4 characters
          priority: "medium",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("10 ký tự");
    });
  });

  describe("Notifications Workflow", () => {
    test("GET /api/notifications - Should get notifications", async () => {
      const response = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("PUT /api/notifications/:id/read - Should mark notification as read", async () => {
      // Lấy notification chưa đọc
      const getResponse = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${authToken}`);

      if (getResponse.body.data.length > 0) {
        const unreadNotification = getResponse.body.data.find((n) => !n.isRead);

        if (unreadNotification) {
          const response = await request(app)
            .put(`/api/notifications/${unreadNotification._id}/read`)
            .set("Authorization", `Bearer ${authToken}`);

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.isRead).toBe(true);
        }
      }
    });
  });

  describe("Profile & Avatar Workflow", () => {
    test("GET /api/students/me - Should get student profile", async () => {
      const response = await request(app)
        .get("/api/students/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("fullName");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data.email).toBe("student1@test.com");
    });
  });
});
