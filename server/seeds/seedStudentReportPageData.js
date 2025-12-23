/**
 * MOCK DATA - ENGLISH HUB MANAGEMENT SYSTEM
 * Dữ liệu giả lập cho trang StudentReportPage
 */

// 1. Thống kê tổng quan (Stats)
// Mapping với: reportService.getStudentStats()
export const overviewStats = {
  totalStudents: 450,       // Tổng số học viên trong DB
  activeStudents: 312,      // Đang trạng thái 'Active'
  newStudents: 48,          // Đăng ký trong tháng hiện tại
  graduatedStudents: 85,    // Đã hoàn thành khóa học
  growth: 12.5,             // Tỉ lệ tăng trưởng so với tháng trước (%)
  
  // Các trường bổ sung (cho tương lai/báo cáo sâu hơn)
  totalRevenue: 1540000000, // Doanh thu (VND)
  retentionRate: 88.5,      // Tỉ lệ giữ chân học viên (%)
  teacherCount: 24          // Số lượng giáo viên hiện có
};

// 2. Xu hướng ghi danh 12 tháng gần nhất (Line Chart)
// Mapping với: reportService.getEnrollmentTrend()
export const enrollmentTrendData = [
  { name: "T1", newStudents: 25, activeStudents: 180, graduates: 5 },
  { name: "T2", newStudents: 15, activeStudents: 175, graduates: 10 }, // Tết nghỉ nhiều
  { name: "T3", newStudents: 35, activeStudents: 195, graduates: 8 },
  { name: "T4", newStudents: 40, activeStudents: 220, graduates: 12 },
  { name: "T5", newStudents: 55, activeStudents: 250, graduates: 15 }, // Chuẩn bị hè
  { name: "T6", newStudents: 80, activeStudents: 300, graduates: 20 }, // Cao điểm hè
  { name: "T7", newStudents: 75, activeStudents: 320, graduates: 25 },
  { name: "T8", newStudents: 60, activeStudents: 310, graduates: 30 },
  { name: "T9", newStudents: 45, activeStudents: 290, graduates: 40 }, // Hết hè, một số nghỉ
  { name: "T10", newStudents: 30, activeStudents: 280, graduates: 15 },
  { name: "T11", newStudents: 38, activeStudents: 295, graduates: 10 },
  { name: "T12", newStudents: 48, activeStudents: 312, graduates: 8 },
];

// 3. Phân bổ học viên theo Khóa học (Pie Chart)
// Mapping với: reportService.getStudentDistribution()
export const courseDistributionData = [
  { name: "IELTS Intensive", value: 120, color: "#3b82f6" },
  { name: "TOEIC Master", value: 85, color: "#10b981" },
  { name: "Giao tiếp (Comm)", value: 60, color: "#f59e0b" },
  { name: "Tiếng Anh Trẻ em", value: 35, color: "#ef4444" },
  { name: "Business English", value: 12, color: "#8b5cf6" },
];

// 4. Top 10 Học viên xuất sắc (Table)
// Mapping với: reportService.getTopStudents()
// Đã bổ sung thêm: avatar, email, phone, classId để data 'dày' hơn
export const topStudentsData = [
  {
    id: "ST001",
    studentCode: "HV2025001",
    fullName: "Nguyễn Thùy Linh",
    avatar: "https://i.pravatar.cc/150?u=1",
    email: "linh.nt@gmail.com",
    course: "IELTS Advanced 7.5",
    classId: "IEL-A01",
    gpa: 9.8,
    attendance: 100,
    status: "Active",
    joinDate: "2024-09-15"
  },
  {
    id: "ST002",
    studentCode: "HV2025045",
    fullName: "Trần Minh Quân",
    avatar: "https://i.pravatar.cc/150?u=2",
    email: "quan.tm@gmail.com",
    course: "TOEIC 850+",
    classId: "TOE-B02",
    gpa: 9.6,
    attendance: 98,
    status: "Active",
    joinDate: "2024-10-01"
  },
  {
    id: "ST003",
    studentCode: "HV2025012",
    fullName: "Lê Hoàng Nam",
    avatar: "https://i.pravatar.cc/150?u=3",
    email: "nam.lh@outlook.com",
    course: "Giao tiếp Phản xạ",
    classId: "COM-INT01",
    gpa: 9.5,
    attendance: 95,
    status: "Active",
    joinDate: "2024-08-20"
  },
  {
    id: "ST004",
    studentCode: "HV2025088",
    fullName: "Phạm Ngọc Hân",
    avatar: "https://i.pravatar.cc/150?u=4",
    email: "han.pn@gmail.com",
    course: "IELTS Foundation",
    classId: "IEL-F03",
    gpa: 9.2,
    attendance: 100,
    status: "Active",
    joinDate: "2024-11-05"
  },
  {
    id: "ST005",
    studentCode: "HV2025033",
    fullName: "Võ Văn Kiệt",
    avatar: "https://i.pravatar.cc/150?u=5",
    email: "kiet.vv@gmail.com",
    course: "Business English",
    classId: "BUS-01",
    gpa: 9.0,
    attendance: 88, // Attendance hơi thấp (Warning badge)
    status: "Active",
    joinDate: "2024-07-12"
  },
  {
    id: "ST006",
    studentCode: "HV2025099",
    fullName: "Đỗ Thị Mai",
    avatar: null, // Test case không có avatar
    email: "mai.dt@yahoo.com",
    course: "Tiếng Anh Trẻ Em (K3)",
    classId: "KID-03",
    gpa: 8.9,
    attendance: 92,
    status: "Active",
    joinDate: "2024-06-01"
  },
  {
    id: "ST007",
    studentCode: "HV2025102",
    fullName: "Hoàng Gia Bảo",
    avatar: "https://i.pravatar.cc/150?u=7",
    email: "bao.hg@gmail.com",
    course: "IELTS Intensive",
    classId: "IEL-INT02",
    gpa: 8.8,
    attendance: 96,
    status: "Active",
    joinDate: "2024-10-15"
  },
  {
    id: "ST008",
    studentCode: "HV2025150",
    fullName: "Ngô Thanh Vân",
    avatar: "https://i.pravatar.cc/150?u=8",
    email: "van.nt@gmail.com",
    course: "TOEIC Basic",
    classId: "TOE-A01",
    gpa: 8.7,
    attendance: 90,
    status: "Active",
    joinDate: "2024-11-20"
  },
  {
    id: "ST009",
    studentCode: "HV2025067",
    fullName: "Bùi Tiến Dũng",
    avatar: "https://i.pravatar.cc/150?u=9",
    email: "dung.bt@gmail.com",
    course: "Giao tiếp Nâng cao",
    classId: "COM-ADV01",
    gpa: 8.5,
    attendance: 85, // Warning
    status: "Active",
    joinDate: "2024-05-10"
  },
  {
    id: "ST010",
    studentCode: "HV2025201",
    fullName: "Đặng Thu Thảo",
    avatar: "https://i.pravatar.cc/150?u=10",
    email: "thao.dt@gmail.com",
    course: "IELTS Advanced",
    classId: "IEL-A02",
    gpa: 8.5,
    attendance: 94,
    status: "Active",
    joinDate: "2024-09-05"
  }
];

// 5. Dữ liệu Phân bổ chi tiết (Cho 3 Card cuối trang)
// *Lưu ý: Trong code React hiện tại phần này đang hardcode. 
// Bạn có thể dùng data này để map động (dynamic rendering) thay vì hardcode.
export const demographicStats = {
  statusBreakdown: [
    { label: "Đang học", count: 312, color: "bg-green-500", key: "active" },
    { label: "Tạm nghỉ", count: 25, color: "bg-yellow-500", key: "reserved" },
    { label: "Bảo lưu", count: 12, color: "bg-orange-500", key: "suspended" },
    { label: "Đã nghỉ", count: 16, color: "bg-red-500", key: "dropped" } // Tổng cộng khác 450 do có alumni
  ],
  levelBreakdown: [
    { label: "Beginner (A1)", count: 120, color: "bg-blue-500" },
    { label: "Elementary (A2)", count: 95, color: "bg-indigo-500" },
    { label: "Intermediate (B1)", count: 80, color: "bg-purple-500" },
    { label: "Upper-Int (B2)", count: 45, color: "bg-pink-500" },
    { label: "Advanced (C1)", count: 10, color: "bg-rose-500" } // Thêm level C1
  ],
  ageBreakdown: [
    { label: "6-12 tuổi (Kids)", count: 85, color: "bg-cyan-500" },
    { label: "13-17 tuổi (Teens)", count: 110, color: "bg-teal-500" },
    { label: "18-25 tuổi (Students)", count: 95, color: "bg-emerald-500" },
    { label: "26+ tuổi (Workers)", count: 60, color: "bg-slate-500" }
  ]
};