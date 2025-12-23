import api from "./api";

// Mock data
const getMockSchedules = () => [
  {
    _id: "schedule_mock_1",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    dayOfWeek: "monday",
    startTime: "08:00",
    endTime: "10:00",
    classroom: "Phòng A1",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "schedule_mock_2",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    dayOfWeek: "wednesday",
    startTime: "14:00",
    endTime: "16:00",
    classroom: "Phòng A1",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "schedule_mock_3",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    dayOfWeek: "friday",
    startTime: "10:00",
    endTime: "12:00",
    classroom: "Phòng A2",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];

// Lấy danh sách lịch học của học viên
export const getMySchedules = async (startDate, endDate) => {
  try {
    // Thử endpoint 1
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(
        `/schedules/me${params.toString() ? "?" + params.toString() : ""}`
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Schedules from API:", response.data.data);
        return response.data.data;
      }
    } catch (err1) {
      console.log("Endpoint /schedules/me failed:", err1.response?.status);
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/schedules");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Schedules from /schedules:", response.data.data);
        return response.data.data;
      }
    } catch (err2) {
      console.log("Endpoint /schedules failed:", err2.response?.status);
    }

    // Trả về mock data nếu cả hai đều fail
    console.log("↪️  Using mock schedules");
    return getMockSchedules();
  } catch (error) {
    console.error("Error getting schedules:", error);
    return getMockSchedules();
  }
};

// Lấy chi tiết 1 lịch
export const getSchedule = async (scheduleId) => {
  try {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting schedule:", error);
    return { success: false };
  }
};

// Cập nhật lịch
export const updateSchedule = async (scheduleId, data) => {
  try {
    const response = await api.put(`/schedules/${scheduleId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating schedule:", error);
    return { success: false };
  }
};
