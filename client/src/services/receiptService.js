import api from "@config/api";

export const receiptService = {
  // Get all receipts from Receipt collection
  getReceipts: async (params) => {
    const response = await api.get("/api/receipts", {
      params,
    });
    // Backend returns { receipts: [...], total, currentPage, totalPages }
    return response.data;
  },

  // Get 5 recent receipts for dashboard
  getRecentReceipts: async () => {
    const response = await api.get("/api/receipts/recent/list");
    return response.data;
  },

  // Get receipt by ID
  getReceiptById: async (id) => {
    const response = await api.get(`/api/receipts/${id}`);
    return response.data.data || response.data;
  },

  // Create new receipt
  createReceipt: async (data) => {
    const response = await api.post("/api/receipts", data);
    return response.data;
  },

  // Get statistics
  getStatistics: async (params) => {
    const response = await api.get("/api/receipts/stats/summary", {
      params,
    });
    return response.data;
  },
};
