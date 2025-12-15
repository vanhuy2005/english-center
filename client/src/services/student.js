import api from "./api";

export const getMyCourses = async () => {
  try {
    console.log("📚 Fetching courses...");
    const response = await api.get("/students/me/courses");

    console.log("📥 Courses response:", response.data);

    // Extract data - API returns { success: true, data: [...] }
    if (response.data?.success && response.data?.data) {
      const courses = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      console.log("✅ Extracted courses array:", courses.length, "items");
      return courses;
    }

    console.warn("⚠️ Unexpected response:", response.data);
    return [];
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể tải danh sách khóa học";
    console.error("❌ Error fetching courses:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getMyNotifications = async () => {
  try {
    console.log("🔔 Fetching notifications...");
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getMyProfile = async () => {
  try {
    const response = await api.get("/students/me");
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const getMyGrades = async () => {
  try {
    const response = await api.get("/students/me/grades");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching grades:", error);
    throw error;
  }
};

export const getMyAttendance = async () => {
  try {
    const response = await api.get("/students/me/attendance");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

export const getMyTuition = async () => {
  try {
    const response = await api.get("/students/me/tuition");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching tuition:", error);
    throw error;
  }
};

export const getMyRequests = async () => {
  try {
    const response = await api.get("/students/me/requests");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};
