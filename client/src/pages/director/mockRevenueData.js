/**
 * MOCK DATA - REVENUE REPORT
 * Dữ liệu giả lập cho trang Báo cáo Doanh thu
 */

// 1. Tổng quan (Stats Cards)
export const revenueStats = {
  totalRevenue: 400000000,
  totalProfit: 400000000 * 0.35, 
  totalExpenses: 600000000,
  growth: 3.6,            
  margin: 34.6              // Tỷ suất lợi nhuận (%)
};

// 2. Biểu đồ xu hướng (Line Chart - 12 tháng)
// Logic: Doanh thu cao vào các tháng hè (T6, T7) và đầu năm học
export const revenueTrendData = [
  { name: "T1", revenue: 180000000, expenses: 120000000, profit: 60000000 },
  { name: "T2", revenue: 150000000, expenses: 110000000, profit: 40000000 }, // Tết thấp
  { name: "T3", revenue: 200000000, expenses: 130000000, profit: 70000000 },
  { name: "T4", revenue: 220000000, expenses: 135000000, profit: 85000000 },
  { name: "T5", revenue: 250000000, expenses: 140000000, profit: 110000000 },
  { name: "T6", revenue: 350000000, expenses: 180000000, profit: 170000000 }, // Hè cao điểm
  { name: "T7", revenue: 320000000, expenses: 175000000, profit: 145000000 },
  { name: "T8", revenue: 280000000, expenses: 160000000, profit: 120000000 },
  { name: "T9", revenue: 210000000, expenses: 140000000, profit: 70000000 },
  { name: "T10", revenue: 190000000, expenses: 130000000, profit: 60000000 },
  { name: "T11", revenue: 200000000, expenses: 130000000, profit: 70000000 },
  { name: "T12", revenue: 240000000, expenses: 150000000, profit: 90000000 }, // Cuối năm
];

// 3. Cơ cấu nguồn thu (Pie Chart)
export const revenueSourceData = [
  { name: "Học phí khóa học", value: 2050000000, color: "#3b82f6" }, // Blue
  { name: "Giáo trình/Tài liệu", value: 250000000, color: "#10b981" }, // Emerald
  { name: "Thi xếp lớp/Chứng chỉ", value: 100000000, color: "#f59e0b" }, // Amber
  { name: "Khác", value: 50000000, color: "#6366f1" }, // Indigo
];

// 4. Cơ cấu chi phí (Bar Chart)
export const expenseBreakdownData = [
  { name: "Lương Giáo viên", value: 800000000, fill: "#ef4444" }, // Lương chiếm tỉ trọng lớn nhất
  { name: "Lương Nhân viên", value: 400000000, fill: "#f97316" },
  { name: "Mặt bằng/Điện nước", value: 250000000, fill: "#eab308" },
  { name: "Marketing/Ads", value: 100000000, fill: "#8b5cf6" },
  { name: "Vận hành khác", value: 50000000, fill: "#64748b" },
];

// 5. Giao dịch gần đây (Table - Bổ sung thêm cho trang đầy đủ)
export const recentTransactions = [
  { id: "TRX-001", content: "Thu học phí - Nguyễn Văn A", amount: 5500000, type: "income", date: "2024-12-20" },
  { id: "TRX-002", content: "Thu học phí - Trần Thị B", amount: 4200000, type: "income", date: "2024-12-20" },
  { id: "TRX-003", content: "Chi lương GV tháng 11", amount: -45000000, type: "expense", date: "2024-12-15" },
  { id: "TRX-004", content: "Mua giáo trình Cambridge", amount: -2500000, type: "expense", date: "2024-12-14" },
  { id: "TRX-005", content: "Thu phí thi thử IELTS", amount: 1500000, type: "income", date: "2024-12-12" },
];