// client/src/services/financeService.js
import api from "./api";

export const financeService = {
  // Lấy danh sách học phí
  getAll: async (params) => {
    return await api.get("/staff/accountant/tuition", { params });
  },

  // Lấy chi tiết học phí của 1 học viên
  getByStudent: async (studentId) => {
    return await api.get(`/staff/accountant/tuition/student/${studentId}`);
  },

  // Cập nhật/Tính toán lại học phí (nếu có tính năng này)
  updateTuition: async (data) => {
    return await api.post("/staff/accountant/tuition/update", data);
  },
  
  // Gửi nhắc nhở học phí
  sendReminder: async (studentId) => {
    return await api.post(`/staff/accountant/tuition/remind/${studentId}`);
  }
};