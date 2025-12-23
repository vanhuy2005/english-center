/**
 * MOCK DATA - RETENTION REPORT (FULL)
 * File: src/pages/director/mockRetentionData.js
 */

export const retentionStats = {
  dropoutRate: 5.2,
  pauseRate: 3.8,
  totalDropouts: 24,
  totalPauses: 18,
  atRiskStudents: 12,
  // Bổ sung: Doanh thu ước tính bị mất do học viên nghỉ (VND)
  revenueLoss: 125000000, 
  // Bổ sung: Tỉ lệ giữ chân thành công (những ca rủi ro đã cứu được)
  retentionSuccessRate: 65, 
};

export const retentionTrendData = [
  { name: "T1", dropoutRate: 4.5, pauseRate: 2.0 },
  { name: "T2", dropoutRate: 5.0, pauseRate: 3.5 },
  { name: "T3", dropoutRate: 4.2, pauseRate: 2.5 },
  { name: "T4", dropoutRate: 3.8, pauseRate: 2.2 },
  { name: "T5", dropoutRate: 4.0, pauseRate: 3.0 },
  { name: "T6", dropoutRate: 5.5, pauseRate: 4.5 },
  { name: "T7", dropoutRate: 6.0, pauseRate: 4.0 },
  { name: "T8", dropoutRate: 5.8, pauseRate: 3.8 },
  { name: "T9", dropoutRate: 4.5, pauseRate: 2.5 },
  { name: "T10", dropoutRate: 3.5, pauseRate: 2.0 },
  { name: "T11", dropoutRate: 4.0, pauseRate: 2.2 },
  { name: "T12", dropoutRate: 5.2, pauseRate: 3.8 },
];

export const dropoutReasonData = [
  { name: "Tài chính/Học phí", value: 35, color: "#ef4444" },
  { name: "Không phù hợp", value: 25, color: "#f97316" },
  { name: "Chuyển nơi ở", value: 20, color: "#eab308" },
  { name: "Lý do cá nhân", value: 15, color: "#6b7280" },
  { name: "Khác", value: 5, color: "#3b82f6" },
];

export const courseAnalysisData = [
  { name: "IELTS", dropoutRate: 6.5, pauseRate: 4.0 },
  { name: "TOEIC", dropoutRate: 4.2, pauseRate: 3.5 },
  { name: "Giao tiếp", dropoutRate: 8.0, pauseRate: 5.5 },
  { name: "Kids", dropoutRate: 2.5, pauseRate: 1.5 },
];

// Bổ sung: Dữ liệu giáo viên giữ chân học viên (Top & Bottom)
export const teacherRetentionData = [
  { name: "Ms. Sarah", retentionRate: 98, studentCount: 120 },
  { name: "Mr. David", retentionRate: 95, studentCount: 110 },
  { name: "Ms. Linh", retentionRate: 92, studentCount: 85 },
  { name: "Mr. Tuan", retentionRate: 85, studentCount: 90 }, // Thấp hơn
  { name: "Ms. Hanh", retentionRate: 82, studentCount: 60 }, // Thấp nhất
];

// Bổ sung: 3 Danh sách riêng biệt với thông tin liên hệ đầy đủ
export const studentLists = {
  atRisk: [
    {
      id: 1,
      studentCode: "HV2025099",
      fullName: "Trần Văn Nam",
      phone: "0901234567",
      course: "IELTS Intensive",
      attendanceRate: 45,
      lastAttendance: "2024-12-10",
      riskLevel: "high",
      note: "Vắng không phép 3 buổi"
    },
    {
      id: 2,
      studentCode: "HV2025102",
      fullName: "Lê Thị Bích",
      phone: "0912345678",
      course: "Giao tiếp K12",
      attendanceRate: 60,
      lastAttendance: "2024-12-15",
      riskLevel: "medium",
      note: "Điểm test giữa kỳ thấp"
    },
    {
        id: 3,
        studentCode: "HV2025055",
        fullName: "Nguyễn Hoài Thương",
        phone: "0987654321",
        course: "TOEIC 600+",
        attendanceRate: 40,
        lastAttendance: "2024-12-01",
        riskLevel: "high",
        note: "Đã nhắc nhở 2 lần"
    },
  ],
  dropped: [
    {
      id: 4,
      studentCode: "HV2024001",
      fullName: "Phạm Văn A",
      phone: "0933112233",
      course: "IELTS Foundation",
      reason: "Tài chính",
      leaveDate: "2024-11-20",
      status: "dropped"
    },
    {
      id: 5,
      studentCode: "HV2024005",
      fullName: "Ngô Thị B",
      phone: "0944556677",
      course: "Kids Movers",
      reason: "Chuyển nhà",
      leaveDate: "2024-11-25",
      status: "dropped"
    }
  ],
  paused: [
    {
      id: 6,
      studentCode: "HV2024012",
      fullName: "Đặng Hùng C",
      phone: "0977889900",
      course: "Business English",
      reason: "Công tác nước ngoài",
      startDate: "2024-12-01",
      endDate: "2025-03-01", // Ngày dự kiến quay lại
      status: "paused"
    }
  ]
};

export const breakdownData = {
  reasonsDetailed: [
    { label: "Tài chính/Học phí cao", count: 15, color: "bg-red-500" },
    { label: "Chất lượng không đạt kỳ vọng", count: 8, color: "bg-orange-500" },
    { label: "Lịch học xung đột", count: 12, color: "bg-yellow-500" },
    { label: "Lý do sức khỏe/Cá nhân", count: 10, color: "bg-gray-500" },
  ],
  duration: [
    { label: "Nghỉ ngay tháng đầu", count: 5, color: "bg-red-500" },
    { label: "Sau 1-3 tháng", count: 12, color: "bg-orange-500" },
    { label: "Sau 3-6 tháng", count: 18, color: "bg-yellow-500" },
    { label: "Gần kết thúc khóa", count: 10, color: "bg-blue-500" },
  ],
  ageGroup: [
    { label: "Sinh viên (18-22)", count: "40%", color: "bg-indigo-500" },
    { label: "Người đi làm (23-30)", count: "35%", color: "bg-purple-500" },
    { label: "Học sinh cấp 3", count: "15%", color: "bg-pink-500" },
    { label: "Khác", count: "10%", color: "bg-gray-500" },
  ]
};