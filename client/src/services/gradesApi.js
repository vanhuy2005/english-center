import api from "./api";

// Mock data
const getMockGrades = () => [
  {
    _id: "grade_mock_1",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    enrollment: "enrollment1",
    midtermScore: 8.5,
    finalScore: 8.0,
    attendance: 85,
    status: "completed",
    letterGrade: "A",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "grade_mock_2",
    course: {
      _id: "course2",
      name: "English A2",
      code: "EN-A2",
    },
    enrollment: "enrollment2",
    midtermScore: 7.5,
    finalScore: null,
    attendance: 90,
    status: "in-progress",
    letterGrade: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "grade_mock_3",
    course: {
      _id: "course3",
      name: "English B1",
      code: "EN-B1",
    },
    enrollment: "enrollment3",
    midtermScore: 9.0,
    finalScore: 8.5,
    attendance: 95,
    status: "completed",
    letterGrade: "A",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
];

// Lấy danh sách điểm của học viên
export const getMyGrades = async () => {
  try {
    // Thử endpoint 1
    try {
      const response = await api.get("/grades/me");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Grades from API:", response.data.data);
        return response.data.data;
      }
    } catch (err1) {
      console.log("Endpoint /grades/me failed:", err1.response?.status);
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/grades");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Grades from /grades:", response.data.data);
        return response.data.data;
      }
    } catch (err2) {
      console.log("Endpoint /grades failed:", err2.response?.status);
    }

    // Trả về mock data nếu cả hai đều fail
    console.log("↪️  Using mock grades");
    return getMockGrades();
  } catch (error) {
    console.error("Error getting grades:", error);
    return getMockGrades();
  }
};

// Lấy chi tiết 1 điểm
export const getGrade = async (gradeId) => {
  try {
    const response = await api.get(`/grades/${gradeId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting grade:", error);
    return { success: false };
  }
};
