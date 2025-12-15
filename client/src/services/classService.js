import api from "@config/api";

export const classService = {
  // Get all classes
  getClasses: async (params) => {
    const response = await api.get("/api/classes", { params }); // Correct: /api/classes
    return response.data;
  },

  // Get class by ID
  getClassById: async (id) => {
    const response = await api.get(`/api/classes/${id}`);
    return response.data;
  },

  // Create new class
  createClass: async (data) => {
    const response = await api.post("/api/classes", data);
    return response.data;
  },

  // Update class
  updateClass: async (id, data) => {
    const response = await api.put(`/api/classes/${id}`, data);
    return response.data;
  },

  // Delete class
  deleteClass: async (id) => {
    const response = await api.delete(`/api/classes/${id}`);
    return response.data;
  },
};
