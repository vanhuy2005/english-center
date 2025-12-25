const axios = require("axios");

const testAPI = async () => {
  try {
    // First login to get token
    console.log("🔐 Logging in...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      phone: "0900000001",
      password: "1234567",
    });

    const token = loginRes.data.data.token;
    console.log("✅ Login successful\n");

    // Test getMyCourses
    console.log("📚 Fetching enrolled courses...");
    const coursesRes = await axios.get(
      "http://localhost:5000/api/students/me/courses",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const courses = coursesRes.data.data;
    console.log(`\n📊 Total courses: ${courses.length}\n`);

    courses.forEach((course, idx) => {
      console.log(`${idx + 1}. ${course.courseName} (${course.courseCode})`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Grade: ${course.averageGrade} (${course.letterGrade})`);
      console.log(`   Progress: ${course.progress}%`);
      console.log("");
    });

    // Count by status
    const active = courses.filter(
      (c) => c.status === "active" || c.status === "in_progress"
    ).length;
    const completed = courses.filter((c) => c.status === "completed").length;

    console.log(`\n📈 Summary:`);
    console.log(`   Active/In Progress: ${active}`);
    console.log(`   Completed: ${completed}`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
};

testAPI();
