import api from "./api";

export const directorService = {
  // Lấy tổng quan (Cards trên cùng)
  getOverviewStats: async () => {
    try {
      // Gọi song song các API đếm số lượng
      const [students, teachers, courses, revenue] = await Promise.all([
        api.get('/students?limit=1'), 
        api.get('/staffs?role=teacher&limit=1'), // Hoặc endpoint giáo viên của bạn
        api.get('/courses?limit=1'),
        api.get('/receipts?limit=1000') // Lấy danh sách để tính tổng tiền
      ]);

      // --- FIX LOGIC TÍNH TỔNG TIỀN ---
      // Kiểm tra kỹ cấu trúc response để lấy đúng mảng receipts
      const revenueBody = revenue.data; // Body của response
      const receiptList = revenueBody.receipts || revenueBody.data || []; 
      
      // Tính tổng doanh thu bằng hàm reduce
      const totalRevenue = Array.isArray(receiptList) 
        ? receiptList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
        : 0;
      
      // Lấy số lượng (support nhiều cấu trúc trả về phổ biến)
      const getCount = (res) => res.data?.total || res.data?.pagination?.total || res.data?.count || 0;

      return {
        totalStudents: getCount(students),
        totalTeachers: getCount(teachers),
        totalCourses: getCount(courses),
        totalRevenue: totalRevenue
      };
    } catch (error) {
      console.error("Failed to fetch overview stats:", error);
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalRevenue: 0
      };
    }
  },

  // Lấy dữ liệu biểu đồ doanh thu
  getRevenueChartData: async () => {
    try {
      const response = await api.get('/receipts?limit=2000&sort=createdAt');
      
      // --- FIX LOGIC LẤY DANH SÁCH ---
      const responseData = response.data;
      const receipts = responseData.receipts || responseData.data || [];
      
      if (!Array.isArray(receipts)) return [];

      // Group by Month (Tạo dữ liệu cho biểu đồ)
      const monthlyData = {};

      receipts.forEach(r => {
          if (!r.createdAt) return;
          const date = new Date(r.createdAt);
          const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // Format: 12/2025
          
          if (!monthlyData[key]) {
              monthlyData[key] = 0;
          }
          monthlyData[key] += (Number(r.amount) || 0);
      });

      // Sort theo thời gian & Format cho Recharts
      const sortedKeys = Object.keys(monthlyData).sort((a,b) => {
          const [m1, y1] = a.split('/').map(Number);
          const [m2, y2] = b.split('/').map(Number);
          return new Date(y1, m1 - 1) - new Date(y2, m2 - 1);
      });

      // Lấy 6 tháng gần nhất & Thêm dữ liệu giả lập cho Profit/Expenses (nếu backend chưa có)
      return sortedKeys.slice(-6).map(key => {
          const revenue = monthlyData[key];
          return { 
            month: `T${key.split('/')[0]}`, // Nhãn trục X: T12, T1...
            revenue: revenue,
            profit: Math.round(revenue * 0.4), // Giả lập: Lợi nhuận 40%
            expenses: Math.round(revenue * 0.6) // Giả lập: Chi phí 60%
          };
      });
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
      return [];
    }
  }
};