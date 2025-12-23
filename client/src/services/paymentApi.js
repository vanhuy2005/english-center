import api from "./api";

// Mock data
const getMockPayments = () => [
  {
    _id: "payment_mock_1",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
    },
    amount: 3500000,
    status: "paid",
    paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    paymentMethod: "bank_transfer",
    transactionId: "TXN20241201001",
  },
  {
    _id: "payment_mock_2",
    course: {
      _id: "course2",
      name: "English A2",
      code: "EN-A2",
    },
    amount: 3500000,
    status: "pending",
    paymentDate: null,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    paymentMethod: null,
    transactionId: null,
  },
  {
    _id: "payment_mock_3",
    course: {
      _id: "course3",
      name: "English B1",
      code: "EN-B1",
    },
    amount: 4500000,
    status: "overdue",
    paymentDate: null,
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    paymentMethod: null,
    transactionId: null,
  },
];

// Lấy danh sách thanh toán của học viên
export const getMyPayments = async () => {
  try {
    // Thử endpoint 1
    try {
      const response = await api.get("/finance/me/payments");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Payments from API:", response.data.data);
        return response.data.data;
      }
    } catch (err1) {
      console.log(
        "Endpoint /finance/me/payments failed:",
        err1.response?.status
      );
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/finance/payments");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Payments from /finance/payments:", response.data.data);
        return response.data.data;
      }
    } catch (err2) {
      console.log("Endpoint /finance/payments failed:", err2.response?.status);
    }

    // Trả về mock data nếu cả hai đều fail
    console.log("↪️  Using mock payments");
    return getMockPayments();
  } catch (error) {
    console.error("Error getting payments:", error);
    return getMockPayments();
  }
};

// Lấy chi tiết 1 thanh toán
export const getPayment = async (paymentId) => {
  try {
    const response = await api.get(`/finance/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting payment:", error);
    return { success: false };
  }
};

// Tạo thanh toán
export const createPayment = async (data) => {
  try {
    const response = await api.post("/finance/payments", data);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false };
  }
};
