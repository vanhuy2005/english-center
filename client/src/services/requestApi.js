import api from "./api";

// Mock data
const getMockRequests = () => [
  {
    _id: "request_1",
    type: "leave",
    title: "Xin nghỉ học",
    description: "Tôi bị ốm và cần nghỉ học",
    status: "pending",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "request_2",
    type: "transfer",
    title: "Xin chuyển lớp",
    description: "Tôi muốn chuyển sang lớp chiều",
    status: "approved",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

// Lấy danh sách yêu cầu của học viên
export const getMyRequests = async () => {
  try {
    // Thử endpoint 1
    try {
      const response = await api.get("/students/me/requests");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Requests from API:", response.data.data);
        return response.data.data;
      }
    } catch (err1) {
      console.log(
        "Endpoint /students/me/requests failed:",
        err1.response?.status
      );
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/requests");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Requests from /requests:", response.data.data);
        return response.data.data;
      }
    } catch (err2) {
      console.log("Endpoint /requests failed:", err2.response?.status);
    }

    // Thử endpoint 3
    try {
      const response = await api.get("/student/requests");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Requests from /student/requests:", response.data.data);
        return response.data.data;
      }
    } catch (err3) {
      console.log("Endpoint /student/requests failed:", err3.response?.status);
    }

    // Trả về mock data
    console.log("↪️  Using mock requests");
    return getMockRequests();
  } catch (error) {
    console.error("Error getting requests:", error);
    return getMockRequests();
  }
};

// Tạo yêu cầu
export const createRequest = async (data) => {
  try {
    const response = await api.post("/requests", data);
    return response.data;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

// Cập nhật yêu cầu
export const updateRequest = async (requestId, data) => {
  try {
    const response = await api.put(`/requests/${requestId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating request:", error);
    return { success: false };
  }
};

// Xóa yêu cầu
export const deleteRequest = async (requestId) => {
  try {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting request:", error);
    return { success: false };
  }
};
