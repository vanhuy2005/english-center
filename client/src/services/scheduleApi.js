import api from "./api";

// Lấy danh sách lịch học của học viên từ server (KHÔNG dùng mock)
export const getMySchedules = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const response = await api.get(
        `/schedules/me${params.toString() ? "?" + params.toString() : ""}`
      );
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.debug(
        "/schedules/me failed:",
        err?.response?.status || err.message
      );
    }

    try {
      const response = await api.get("/schedules");
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.debug("/schedules failed:", err?.response?.status || err.message);
    }

    console.warn("Schedules endpoints unavailable — returning empty list");
    return [];
  } catch (error) {
    console.error("Error getting schedules:", error);
    return [];
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
