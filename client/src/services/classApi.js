import api from "./api";

// Mock data
const getMockClasses = () => [
  {
    _id: "class_mock_1",
    name: "English A1 - Lớp 1",
    code: "EN-A1-01",
    course: {
      _id: "course1",
      name: "English A1",
    },
    instructor: {
      _id: "instructor1",
      fullName: "Cô Thanh",
    },
    schedule: [
      {
        dayOfWeek: "monday",
        startTime: "08:00",
        endTime: "10:00",
        classroom: "Phòng A1",
      },
      {
        dayOfWeek: "wednesday",
        startTime: "14:00",
        endTime: "16:00",
        classroom: "Phòng A1",
      },
      {
        dayOfWeek: "friday",
        startTime: "10:00",
        endTime: "12:00",
        classroom: "Phòng A2",
      },
    ],
    status: "active",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    studentCount: 25,
  },
  {
    _id: "class_mock_2",
    name: "English A2 - Lớp 1",
    code: "EN-A2-01",
    course: {
      _id: "course2",
      name: "English A2",
    },
    instructor: {
      _id: "instructor2",
      fullName: "Thầy Minh",
    },
    schedule: [
      {
        dayOfWeek: "tuesday",
        startTime: "09:00",
        endTime: "11:00",
        classroom: "Phòng B1",
      },
      {
        dayOfWeek: "thursday",
        startTime: "15:00",
        endTime: "17:00",
        classroom: "Phòng B1",
      },
    ],
    status: "active",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    studentCount: 28,
  },
];

// Lấy danh sách lớp học của học viên
export const getMyClasses = async () => {
  try {
    // Thử endpoint 1
    try {
      const response = await api.get("/students/me/classes");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Classes from API:", response.data.data);
        return response.data.data;
      }
    } catch (err1) {
      console.log(
        "Endpoint /students/me/classes failed:",
        err1.response?.status
      );
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/students/classes");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Classes from /students/classes:", response.data.data);
        return response.data.data;
      }
    } catch (err2) {
      console.log("Endpoint /students/classes failed:", err2.response?.status);
    }

    // Trả về mock data nếu cả hai đều fail
    console.log("↪️  Using mock classes");
    return getMockClasses();
  } catch (error) {
    console.error("Error getting classes:", error);
    return getMockClasses();
  }
};

// Lấy chi tiết 1 lớp
export const getClass = async (classId) => {
  try {
    const response = await api.get(`/students/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting class:", error);
    return { success: false };
  }
};
