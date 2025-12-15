import api from "@config/api";

export const receiptService = {
  // Get all receipts (transactions with receipts)
  getReceipts: async (params) => {
    const response = await api.get("/staff/accountant/transactions", {
      params,
    });
    return response.data.data || response.data;
  },

  // Get receipt by ID
  getReceiptById: async (id) => {
    const response = await api.get(`/staff/accountant/transactions/${id}`);
    return response.data.data;
  },

  // Create new receipt
  createReceipt: async (data) => {
    const response = await api.post("/staff/accountant/transactions", data);
    return response.data;
  },

  // Get statistics
  getStatistics: async (params) => {
    const response = await api.get("/staff/accountant/reports/financial", {
      params,
    });
    return response.data;
  },
};
