import api from "./api";

// Lấy danh sách điểm của học viên từ server (KHÔNG dùng mock)
export const getMyGrades = async () => {
  try {
    // Prefer student-scoped endpoint
    try {
      const response = await api.get("/grades/me");
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.debug("/grades/me failed:", err?.response?.status || err.message);
    }

    // Fallback to generic grades list if available
    try {
      const response = await api.get("/grades");
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.debug("/grades failed:", err?.response?.status || err.message);
    }

    // No server data available — return empty array (no mock)
    console.warn("Grades endpoints unavailable — returning empty list");
    return [];
  } catch (error) {
    console.error("Error getting grades:", error);
    return [];
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
