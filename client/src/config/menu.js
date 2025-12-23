// Menu configurations for different roles

export const directorMenu = [
  {
    title: "TỔNG QUAN HỆ THỐNG",
    items: [
      {
        path: "/dashboard",
        label: "Bảng Điều Khiển",
        icon: "📊",
        description: "Tổng quan tình hình hoạt động",
      },
      {
        path: "/profile",
        label: "Thông Tin Cá Nhân",
        icon: "👤",
        description: "Quản lý thông tin cá nhân",
      },
    ],
  },
  {
    title: "BÁO CÁO VÀ THỐNG KÊ",
    items: [
      {
        path: "/reports/revenue",
        label: "Báo Cáo Doanh Thu",
        icon: "💰",
        description: "Theo dõi doanh thu và lợi nhuận",
      },
      {
        path: "/reports/students",
        label: "Thống Kê Học Viên",
        icon: "👥",
        description: "Học viên đang học và mới ghi danh",
      },
      {
        path: "/reports/classes",
        label: "Thống Kê Lớp Học",
        icon: "🏫",
        description: "Sĩ số và tình trạng lớp học",
      },

      {
        path: "/reports/retention",
        label: "Tỉ Lệ Nghỉ Và Bảo Lưu",
        icon: "📊",
        description: "Theo dõi tỉ lệ nghỉ học và bảo lưu",
      },
    ],
  },
  {
    title: "QUẢN LÝ TỔ CHỨC",
    items: [
      {
        path: "/users",
        label: "Quản Lý Người Dùng",
        icon: "👤",
        description: "Tạo và quản lý tài khoản",
      },
      {
        path: "/notifications",
        label: "Thông Báo Hệ Thống",
        icon: "🔔",
        description: "Nhận thông báo quan trọng",
      },
    ],
  },
];

export const studentMenu = [
  {
    title: "TRANG CÁ NHÂN",
    items: [
      {
        path: "/dashboard",
        label: "Tiến Độ Khóa Học",
        icon: "📊",
        description: "Xem tổng quan tiến độ học tập và thống kê",
      },
      {
        path: "/profile",
        label: "Thông Tin Cá Nhân",
        icon: "👤",
        description: "Quản lý thông tin cá nhân và liên hệ",
      },
      {
        path: "/notifications",
        label: "Thông Báo",
        icon: "🔔",
        description: "Xem thông báo và cập nhật mới nhất",
      },
    ],
  },
  {
    title: "TRA CỨU THÔNG TIN",
    items: [
      {
        path: "/timetable",
        label: "Thời Khóa Biểu",
        icon: "📋",
        description: "Xem chi tiết thời khóa biểu từng ngày",
      },
      {
        path: "/tuition",
        label: "Tài Chính Sinh Viên",
        icon: "💵",
        description: "Tra cứu học phí và lịch sử thanh toán",
      },
      {
        path: "/grades",
        label: "Kết Quả Học Tập",
        icon: "🏆",
        description: "Xem điểm số và kết quả học tập",
      },
    ],
  },
  {
    title: "CHỨC NĂNG TRỰC TUYẾN",
    items: [
      {
        path: "/enroll",
        label: "Đăng Kí Khóa Học",
        icon: "✏️",
        description: "Đăng ký tham gia các khóa học mới",
      },
      {
        path: "/requests/new",
        label: "Xin Nghỉ Và Học Bù",
        icon: "🔄",
        description: "Gửi đơn xin nghỉ học hoặc học bù",
      },
    ],
  },
];

export const enrollmentStaffMenu = [
  {
    title: "TRANG CÁ NHÂN",
    items: [
      {
        path: "/dashboard",
        label: "Tổng Quan",
        icon: "📊",
        description: "Thống kê ghi danh và báo cáo tổng quan",
      },
      {
        path: "/profile",
        label: "Thông Tin Cá Nhân",
        icon: "👤",
        description: "Quản lý thông tin cá nhân",
      },
    ],
  },
  {
    title: "TRA CỨU THÔNG TIN",
    items: [
      {
        path: "/enrollment/students",
        label: "Danh Sách Học Viên",
        icon: "👥",
        description: "Tra cứu và xem thông tin học viên",
      },
      {
        path: "/classes",
        label: "Thông Tin Lớp Học",
        icon: "🏫",
        description: "Xem sĩ số và tình trạng lớp học",
      },
    ],
  },
  {
    title: "CHỨ NĂNG TRỰC TUYẾN",
    items: [
      {
        path: "/enrollment/requests",
        label: "Xử Lý Yêu Cầu",
        icon: "🔄",
        description: "Phê duyệt hoặc từ chối yêu cầu",
      },
    ],
  },
];

export const academicStaffMenu = [
  {
    title: "TRANG CÁ NHÂN",
    items: [
      {
        path: "/dashboard",
        label: "Tổng Quan",
        icon: "📊",
        description: "Thống kê lớp học và tiến độ học tập",
      },
      {
        path: "/profile",
        label: "Thông Tin Cá Nhân",
        icon: "👤",
        description: "Quản lý thông tin cá nhân",
      },
      {
        path: "/notifications",
        label: "Thông Báo",
        icon: "�",
        description: "Xem thông báo hệ thống",
      },
    ],
  },
  {
    title: "TRA CỨU THÔNG TIN",
    items: [
      {
        path: "/academic/classes",
        label: "Lớp Học Phụ Trách",
        icon: "🏫",
        description: "Danh sách lớp đang quản lý",
      },
      {
        path: "/academic/assign-classes",
        label: "Sắp Xếp Lớp Học",
        icon: "🗂️",
        description: "Gán lớp cho học viên đã đăng ký",
      },
      {
        path: "/academic/schedule",
        label: "Quản Lý Lịch Học",
        icon: "📅",
        description: "Sắp xếp lịch học, phòng, giáo viên",
      },
      {
        path: "/academic/courses",
        label: "Quản Lý Khóa Học",
        icon: "📖",
        description: "Thêm / Sửa / Xóa các khóa học",
      },
      {
        path: "/academic/students",
        label: "Tiến Độ Học Viên",
        icon: "👥",
        description: "Theo dõi tiến độ học tập",
      },
      {
        path: "/academic/requests",
        label: "Yêu Cầu Học Viên",
        icon: "📋",
        description: "Đổi lớp, bảo lưu, xin nghỉ",
      },
    ],
  },
  {
    title: "CHỨC NĂNG TRỰC TUYẾN",
    items: [
      {
        path: "/academic/attendance",
        label: "Quản Lý Điểm Danh",
        icon: "✅",
        description: "Theo dõi chuyên cần lớp học",
      },
      {
        path: "/academic/grades",
        label: "Cập Nhật Điểm Số",
        icon: "📝",
        description: "Nhập điểm kiểm tra và kết quả",
      },
      {
        path: "/academic/reports",
        label: "Báo Cáo Lớp Học",
        icon: "📄",
        description: "Tạo báo cáo tổng hợp định kỳ",
      },
      {
        path: "/academic/statistics",
        label: "Thống Kê Kết Quả",
        icon: "�",
        description: "Xem thống kê theo lớp/khóa học",
      },
    ],
  },
];

export const accountantMenu = [
  {
    title: "TRANG CÁ NHÂN",
    items: [
      {
        path: "/dashboard",
        label: "Tổng Quan",
        icon: "📊",
        description: "Thống kê tài chính và doanh thu",
      },
      {
        path: "/profile",
        label: "Thông Tin Cá Nhân",
        icon: "👤",
        description: "Quản lý thông tin cá nhân",
      },
      {
        path: "/notifications",
        label: "Thông Báo",
        icon: "�",
        description: "Xem thông báo hệ thống",
      },
    ],
  },
  {
    title: "TRA CỨU THÔNG TIN",
    items: [
      {
        path: "/accountant/students",
        label: "Danh Sách Học Viên",
        icon: "👥",
        description: "Xem học viên và trạng thái học phí",
      },
      {
        path: "/accountant/tuition",
        label: "Tình Hình Học Phí",
        icon: "💰",
        description: "Theo dõi nộp học phí và công nợ",
      },
      {
        path: "/accountant/receipts",
        label: "Phiếu Thu",
        icon: "🧾",
        description: "Tra cứu phiếu thu học phí",
      },
      {
        path: "/accountant/receipts/statistics",
        label: "Thống Kê Phiếu Thu",
        icon: "📊",
        description: "Phân tích doanh thu từ phiếu thu",
      },
      {
        path: "/accountant/reports",
        label: "Báo Cáo Tài Chính",
        icon: "📈",
        description: "Xem doanh thu theo tháng/khóa học",
      },
    ],
  },
  {
    title: "CHỨC NĂNG TRỰC TUYẾN",
    items: [
      {
        path: "/accountant/refund",
        label: "Hoàn Học Phí",
        icon: "↩️",
        description: "Xử lý hoàn trả học phí",
      },
      {
        path: "/accountant/export",
        label: "Xuất Báo Cáo",
        icon: "�",
        description: "Xuất báo cáo tổng hợp thu-chi",
      },
    ],
  },
];

// Get menu by role
export const getMenuByRole = (role) => {
  switch (role) {
    case "director":
      return directorMenu;
    case "student":
      return studentMenu;
    case "enrollment":
      return enrollmentStaffMenu;
    case "academic":
      return academicStaffMenu;
    case "accountant":
      return accountantMenu;
    default:
      return [];
  }
};

export default {
  directorMenu,
  studentMenu,
  enrollmentStaffMenu,
  academicStaffMenu,
  accountantMenu,
  getMenuByRole,
};
