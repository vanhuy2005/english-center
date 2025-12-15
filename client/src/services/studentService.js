import api from "@config/api";

export const studentService = {
  // Get all students
  getStudents: async (params) => {
    const response = await api.get("/api/students", { params });
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id) => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },
};
