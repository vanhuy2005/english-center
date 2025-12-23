import api from "@config/api";

export const classService = {
  // Get all classes
  getClasses: async (params) => {
    const response = await api.get("/api/staff/enrollment/classes", { params });
    return response.data;
  },

  // Get class by ID
  getClassById: async (id) => {
    const response = await api.get(`/api/classes/${id}`);
    return response.data;
  },

  // Create new class
  createClass: async (data) => {
    const response = await api.post("/classes", data);
    return response.data;
  },

  // Update class
  updateClass: async (id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  // Delete class
  deleteClass: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};
