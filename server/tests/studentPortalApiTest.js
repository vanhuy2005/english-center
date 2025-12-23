/**
 * API Testing Script for Student Portal Backend
 * Run with: node server/tests/studentPortalApiTest.js
 *
 * Prerequisites:
 * 1. Server running on http://localhost:5000
 * 2. Database seeded with student data
 * 3. Login credentials: student.test@example.com / Student123!
 */

const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:5000/api";
const TEST_EMAIL = "student.test@example.com";
const TEST_PASSWORD = "Student123!";

let authToken = "";
let studentId = "";
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  pending: 0,
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = "") {
  testResults.total++;

  if (status === "PASSED") {
    testResults.passed++;
    log(`✅ ${name} - PASSED ${details}`, "green");
  } else if (status === "FAILED") {
    testResults.failed++;
    log(`❌ ${name} - FAILED ${details}`, "red");
  } else {
    testResults.pending++;
    log(`⏸️  ${name} - PENDING ${details}`, "yellow");
  }
}

// ===========================================
// AUTHENTICATION
// ===========================================
async function login() {
  log("\n🔐 Testing Authentication...", "cyan");

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      studentId = response.data.user?._id || response.data.user?.id;
      logTest("Login", "PASSED", `Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logTest("Login", "FAILED", "No token returned");
      return false;
    }
  } catch (error) {
    logTest("Login", "FAILED", error.response?.data?.message || error.message);
    return false;
  }
}

// ===========================================
// TEST 1: ENROLLMENT
// ===========================================
async function testEnrollment() {
  log("\n📚 Testing Enrollment Flow...", "cyan");

  // Get available courses first
  try {
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    const courses = coursesResponse.data.data || coursesResponse.data;

    if (!courses || courses.length === 0) {
      logTest("Enrollment Setup", "FAILED", "No courses available");
      return;
    }

    const newCourse = courses.find((c) => !c.students?.includes(studentId));
    const enrolledCourse = courses.find((c) => c.students?.includes(studentId));

    // Case 1: Enroll in new course
    if (newCourse) {
      try {
        const response = await axios.post(
          `${BASE_URL}/enrollments/course-enrollments`,
          {
            courseId: newCourse._id,
            studentId: studentId,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.status === 201 && response.data.success) {
          const data = response.data.data;
          const checks = [
            data.status === "active",
            data.paymentStatus === "pending",
            data.enrollmentDate !== undefined,
          ];

          if (checks.every((c) => c)) {
            logTest(
              "Enrollment Case 1 (New Course)",
              "PASSED",
              `Status: ${data.status}, Payment: ${data.paymentStatus}`
            );
          } else {
            logTest(
              "Enrollment Case 1 (New Course)",
              "FAILED",
              "Missing required fields in response"
            );
          }
        } else {
          logTest(
            "Enrollment Case 1 (New Course)",
            "FAILED",
            `Status: ${response.status}`
          );
        }
      } catch (error) {
        logTest(
          "Enrollment Case 1 (New Course)",
          "FAILED",
          error.response?.data?.message || error.message
        );
      }
    } else {
      logTest(
        "Enrollment Case 1 (New Course)",
        "PENDING",
        "No unenrolled course available"
      );
    }

    // Case 2: Duplicate enrollment
    if (enrolledCourse) {
      try {
        const response = await axios.post(
          `${BASE_URL}/enrollments/course-enrollments`,
          {
            courseId: enrolledCourse._id,
            studentId: studentId,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        // Should not reach here
        logTest(
          "Enrollment Case 2 (Duplicate)",
          "FAILED",
          "Should return error but got success"
        );
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 409) {
          logTest(
            "Enrollment Case 2 (Duplicate)",
            "PASSED",
            `Correctly returned 409 Conflict: ${message}`
          );
        } else if (status === 400) {
          logTest(
            "Enrollment Case 2 (Duplicate)",
            "FAILED",
            `Status 400 instead of 409 - ${message}`
          );
        } else {
          logTest(
            "Enrollment Case 2 (Duplicate)",
            "FAILED",
            `Unexpected status ${status}`
          );
        }
      }
    } else {
      logTest(
        "Enrollment Case 2 (Duplicate)",
        "PENDING",
        "No enrolled course to test duplicate"
      );
    }
  } catch (error) {
    logTest("Enrollment Setup", "FAILED", error.message);
  }
}

// ===========================================
// TEST 2: FINANCE & TUITION
// ===========================================
async function testFinance() {
  log("\n💰 Testing Finance Flow...", "cyan");

  try {
    const response = await axios.get(`${BASE_URL}/finance/me/payments`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const payments = response.data.data || response.data;

    if (!payments || payments.length === 0) {
      logTest(
        "Finance Case 1 (Get Payments)",
        "PENDING",
        "No payment records found"
      );
      logTest(
        "Finance Case 2 (Date Format)",
        "PENDING",
        "No payment records to check"
      );
      return;
    }

    logTest(
      "Finance Case 1 (Get Payments)",
      "PASSED",
      `Retrieved ${payments.length} payments`
    );

    // Case 2: Check date format
    let allDatesValid = true;
    let invalidDates = [];

    payments.forEach((payment, index) => {
      if (payment.paymentDate) {
        const date = new Date(payment.paymentDate);
        if (isNaN(date.getTime())) {
          allDatesValid = false;
          invalidDates.push(`Payment ${index}: ${payment.paymentDate}`);
        }
      }

      if (payment.dueDate) {
        const date = new Date(payment.dueDate);
        if (isNaN(date.getTime())) {
          allDatesValid = false;
          invalidDates.push(`DueDate ${index}: ${payment.dueDate}`);
        }
      }
    });

    if (allDatesValid) {
      logTest(
        "Finance Case 2 (Date Format)",
        "PASSED",
        "All dates are valid ISO format"
      );
    } else {
      logTest(
        "Finance Case 2 (Date Format)",
        "FAILED",
        `Invalid dates: ${invalidDates.join(", ")}`
      );
    }
  } catch (error) {
    logTest(
      "Finance Case 1 (Get Payments)",
      "FAILED",
      error.response?.data?.message || error.message
    );
    logTest(
      "Finance Case 2 (Date Format)",
      "PENDING",
      "Cannot check - API failed"
    );
  }
}

// ===========================================
// TEST 3: TIMETABLE
// ===========================================
async function testTimetable() {
  log("\n📅 Testing Timetable Flow...", "cyan");

  try {
    // Case 1: Week view
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekResponse = await axios.get(`${BASE_URL}/schedules/me`, {
      params: {
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const weekSchedules = weekResponse.data.data || weekResponse.data;
    logTest(
      "Timetable Case 1 (Week View)",
      "PASSED",
      `Retrieved ${weekSchedules?.length || 0} schedules for current week`
    );

    // Case 2: Verify classroom and time format
    if (weekSchedules && weekSchedules.length > 0) {
      let allFieldsValid = true;
      let issues = [];

      weekSchedules.forEach((schedule, index) => {
        // Check classroom
        if (!schedule.classroom) {
          issues.push(`Schedule ${index}: Missing classroom`);
          allFieldsValid = false;
        }

        // Check time format (should be HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (schedule.startTime && !timeRegex.test(schedule.startTime)) {
          issues.push(
            `Schedule ${index}: Invalid startTime format "${schedule.startTime}"`
          );
          allFieldsValid = false;
        }
        if (schedule.endTime && !timeRegex.test(schedule.endTime)) {
          issues.push(
            `Schedule ${index}: Invalid endTime format "${schedule.endTime}"`
          );
          allFieldsValid = false;
        }
      });

      if (allFieldsValid) {
        logTest(
          "Timetable Case 2 (Data Validation)",
          "PASSED",
          "All classrooms and times are valid"
        );
      } else {
        logTest(
          "Timetable Case 2 (Data Validation)",
          "FAILED",
          issues.join("; ")
        );
      }
    } else {
      logTest(
        "Timetable Case 2 (Data Validation)",
        "PENDING",
        "No schedules to validate"
      );
    }
  } catch (error) {
    logTest(
      "Timetable Case 1 (Week View)",
      "FAILED",
      error.response?.data?.message || error.message
    );
    logTest(
      "Timetable Case 2 (Data Validation)",
      "PENDING",
      "Cannot check - API failed"
    );
  }
}

// ===========================================
// TEST 4: REQUEST FORM
// ===========================================
async function testRequestForm() {
  log("\n📝 Testing Request Form...", "cyan");

  try {
    // Get student's classes first
    const classesResponse = await axios.get(`${BASE_URL}/students/me/classes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const classes = classesResponse.data.data || classesResponse.data;

    if (!classes || classes.length === 0) {
      logTest(
        "Request Case 1 (Valid Request)",
        "PENDING",
        "No classes available for student"
      );
      logTest("Request Case 2 (Validation)", "PENDING", "No classes available");
      return;
    }

    // Case 1: Valid request
    const validRequest = {
      student: studentId,
      type: "leave",
      class: classes[0]._id,
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      reason: "Tôi cần nghỉ vì lý do gia đình quan trọng và cấp bách",
      priority: "normal",
    };

    try {
      const response = await axios.post(`${BASE_URL}/requests`, validRequest, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data.success) {
        const data = response.data.data;
        const checks = [
          data.type === "leave",
          data.class !== undefined,
          data.startDate !== undefined,
          data.reason !== undefined,
          data.status === "pending",
        ];

        if (checks.every((c) => c)) {
          logTest(
            "Request Case 1 (Valid Request)",
            "PASSED",
            `Request created with ID: ${data._id}`
          );
        } else {
          logTest(
            "Request Case 1 (Valid Request)",
            "FAILED",
            "Missing required fields in response"
          );
        }
      } else {
        logTest(
          "Request Case 1 (Valid Request)",
          "FAILED",
          "Response indicates failure"
        );
      }
    } catch (error) {
      logTest(
        "Request Case 1 (Valid Request)",
        "FAILED",
        error.response?.data?.message || error.message
      );
    }

    // Case 2: Invalid request (reason < 10 chars)
    const invalidRequest = {
      student: studentId,
      type: "leave",
      class: classes[0]._id,
      startDate: new Date(Date.now() + 86400000).toISOString(),
      reason: "test", // Only 4 characters
      priority: "normal",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/requests`,
        invalidRequest,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Should not reach here
      logTest(
        "Request Case 2 (Validation)",
        "FAILED",
        "Backend accepted request with short reason - NO VALIDATION!"
      );
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400 && message.includes("10")) {
        logTest(
          "Request Case 2 (Validation)",
          "PASSED",
          `Correctly rejected: ${message}`
        );
      } else {
        logTest(
          "Request Case 2 (Validation)",
          "FAILED",
          `Wrong error: Status ${status}, ${message}`
        );
      }
    }
  } catch (error) {
    logTest("Request Setup", "FAILED", error.message);
  }
}

// ===========================================
// TEST 5: NOTIFICATIONS
// ===========================================
async function testNotifications() {
  log("\n🔔 Testing Notifications...", "cyan");

  try {
    // Get notifications
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const notifications = response.data.data || response.data;

    if (!notifications || notifications.length === 0) {
      logTest(
        "Notification Case 1 (Mark as Read)",
        "PENDING",
        "No notifications found"
      );
      return;
    }

    const unreadNotif = notifications.find((n) => !n.isRead);

    if (!unreadNotif) {
      logTest(
        "Notification Case 1 (Mark as Read)",
        "PENDING",
        "No unread notifications to test"
      );
      return;
    }

    // Case 1: Mark as read
    try {
      const markReadResponse = await axios.put(
        `${BASE_URL}/notifications/${unreadNotif._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (markReadResponse.data.success) {
        const updated = markReadResponse.data.data;

        if (updated.isRead === true) {
          logTest(
            "Notification Case 1 (Mark as Read)",
            "PASSED",
            `Notification ${unreadNotif._id.substring(0, 10)}... marked as read`
          );
        } else {
          logTest(
            "Notification Case 1 (Mark as Read)",
            "FAILED",
            "isRead still false after update"
          );
        }
      } else {
        logTest(
          "Notification Case 1 (Mark as Read)",
          "FAILED",
          "Response indicates failure"
        );
      }
    } catch (error) {
      logTest(
        "Notification Case 1 (Mark as Read)",
        "FAILED",
        error.response?.data?.message || error.message
      );
    }
  } catch (error) {
    logTest(
      "Notification Setup",
      "FAILED",
      error.response?.data?.message || error.message
    );
  }
}

// ===========================================
// MAIN TEST RUNNER
// ===========================================
async function runAllTests() {
  log("╔══════════════════════════════════════════════════════════╗", "blue");
  log("║   BACKEND API TESTING - STUDENT PORTAL                   ║", "blue");
  log("╚══════════════════════════════════════════════════════════╝", "blue");

  log(`\n📡 Base URL: ${BASE_URL}`, "cyan");
  log(`👤 Test User: ${TEST_EMAIL}\n`, "cyan");

  // Step 1: Authentication
  const isLoggedIn = await login();

  if (!isLoggedIn) {
    log("\n❌ Cannot proceed without authentication", "red");
    return;
  }

  // Step 2: Run all tests
  await testEnrollment();
  await testFinance();
  await testTimetable();
  await testRequestForm();
  await testNotifications();

  // Step 3: Summary
  log("\n╔══════════════════════════════════════════════════════════╗", "blue");
  log("║                     TEST SUMMARY                         ║", "blue");
  log("╚══════════════════════════════════════════════════════════╝", "blue");

  log(`\n📊 Total Tests: ${testResults.total}`, "cyan");
  log(`✅ Passed: ${testResults.passed}`, "green");
  log(`❌ Failed: ${testResults.failed}`, "red");
  log(`⏸️  Pending: ${testResults.pending}`, "yellow");

  const passRate =
    testResults.total > 0
      ? ((testResults.passed / testResults.total) * 100).toFixed(1)
      : 0;

  log(`\n📈 Pass Rate: ${passRate}%`, passRate >= 80 ? "green" : "yellow");

  if (testResults.failed > 0) {
    log(
      "\n⚠️  Some tests failed. Please check the report for details.",
      "yellow"
    );
    log("📄 Full report: docs/BACKEND_TESTING_REPORT.md\n", "cyan");
  } else if (testResults.pending > 0) {
    log("\n⏸️  Some tests are pending. May need more data or setup.", "yellow");
  } else {
    log("\n🎉 All tests passed!\n", "green");
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`\n💥 Fatal error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
