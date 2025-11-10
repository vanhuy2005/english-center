import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: "Dashboard",
        myCourses: "My Courses",
        grades: "Grades",
        attendance: "Attendance",
        tuition: "Tuition",
        requests: "Requests",
        changePassword: "Change Password",
        logout: "Logout",
        profile: "Profile",
      },
      // Course Progress Page
      courseProgress: {
        title: "Course Progress",
        welcome: "Welcome back",
        overview: "Overview",
        activeCourses: "Active Courses",
        completedCourses: "Completed Courses",
        attendanceTrend: "Attendance Trend (6 weeks)",
        gradeDistribution: "Grade Distribution",
        quickActions: "Quick Actions",
        viewAllCourses: "View All Courses",
        checkAttendance: "Check Attendance",
        viewGrades: "View Grades",
        payTuition: "Pay Tuition",
        courseCode: "Course Code",
        teacher: "Teacher",
        progress: "Progress",
        attendance: "Attendance",
        avgGrade: "Avg Grade",
        viewDetails: "View Details",
      },
      // Stats
      stats: {
        active: "Active",
        completed: "Completed",
        totalHours: "Total Hours",
        avgAttendance: "Avg Attendance",
        avgGrade: "Avg Grade",
        courses: "courses",
        hours: "hours",
      },
      // Common
      common: {
        search: "Search",
        filter: "Filter",
        clear: "Clear",
        apply: "Apply",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        loading: "Loading...",
        noData: "No data available",
        error: "An error occurred",
        success: "Success",
        week: "Week",
      },
      // Status
      status: {
        active: "Active",
        completed: "Completed",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        paid: "Paid",
        unpaid: "Unpaid",
        overdue: "Overdue",
        present: "Present",
        absent: "Absent",
        late: "Late",
        excused: "Excused",
      },
      // Grade Classifications
      grades: {
        excellent: "Excellent",
        good: "Good",
        average: "Average",
        belowAverage: "Below Average",
      },
      // Attendance
      attendance: {
        rate: "Attendance Rate",
        total: "Total Sessions",
        present: "Present",
        absent: "Absent",
        late: "Late",
        excused: "Excused",
      },
      // Requests
      requests: {
        title: "My Requests",
        createNew: "Create New Request",
        type: "Request Type",
        description: "Description",
        status: "Status",
        date: "Date",
        response: "Response",
      },
      // Tuition
      tuition: {
        title: "Tuition & Payments",
        total: "Total Amount",
        paid: "Paid",
        pending: "Pending",
        overdue: "Overdue",
        dueDate: "Due Date",
        paymentDate: "Payment Date",
        paymentMethod: "Payment Method",
      },
    },
  },
  vi: {
    translation: {
      // Navigation
      nav: {
        dashboard: "Trang chủ",
        myCourses: "Khóa học",
        grades: "Điểm số",
        attendance: "Điểm danh",
        tuition: "Học phí",
        requests: "Yêu cầu",
        changePassword: "Đổi mật khẩu",
        logout: "Đăng xuất",
        profile: "Hồ sơ",
      },
      // Course Progress Page
      courseProgress: {
        title: "Tiến độ học tập",
        welcome: "Chào mừng trở lại",
        overview: "Tổng quan",
        activeCourses: "Đang học",
        completedCourses: "Đã hoàn thành",
        attendanceTrend: "Xu hướng điểm danh (6 tuần)",
        gradeDistribution: "Phân bố điểm",
        quickActions: "Thao tác nhanh",
        viewAllCourses: "Xem tất cả khóa học",
        checkAttendance: "Kiểm tra điểm danh",
        viewGrades: "Xem điểm",
        payTuition: "Đóng học phí",
        courseCode: "Mã khóa học",
        teacher: "Giáo viên",
        progress: "Tiến độ",
        attendance: "Điểm danh",
        avgGrade: "Điểm TB",
        viewDetails: "Xem chi tiết",
      },
      // Stats
      stats: {
        active: "Đang học",
        completed: "Hoàn thành",
        totalHours: "Tổng giờ học",
        avgAttendance: "Điểm danh TB",
        avgGrade: "Điểm TB",
        courses: "khóa học",
        hours: "giờ",
      },
      // Common
      common: {
        search: "Tìm kiếm",
        filter: "Lọc",
        clear: "Xóa",
        apply: "Áp dụng",
        cancel: "Hủy",
        save: "Lưu",
        delete: "Xóa",
        edit: "Sửa",
        view: "Xem",
        loading: "Đang tải...",
        noData: "Không có dữ liệu",
        error: "Đã có lỗi xảy ra",
        success: "Thành công",
        week: "Tuần",
      },
      // Status
      status: {
        active: "Đang học",
        completed: "Hoàn thành",
        pending: "Chờ xử lý",
        approved: "Đã duyệt",
        rejected: "Từ chối",
        paid: "Đã thanh toán",
        unpaid: "Chưa thanh toán",
        overdue: "Quá hạn",
        present: "Có mặt",
        absent: "Vắng",
        late: "Muộn",
        excused: "Có phép",
      },
      // Grade Classifications
      grades: {
        excellent: "Xuất sắc",
        good: "Giỏi",
        average: "Khá",
        belowAverage: "Trung bình",
      },
      // Attendance
      attendance: {
        rate: "Tỷ lệ điểm danh",
        total: "Tổng buổi",
        present: "Có mặt",
        absent: "Vắng",
        late: "Muộn",
        excused: "Có phép",
      },
      // Requests
      requests: {
        title: "Yêu cầu của tôi",
        createNew: "Tạo yêu cầu mới",
        type: "Loại yêu cầu",
        description: "Mô tả",
        status: "Trạng thái",
        date: "Ngày",
        response: "Phản hồi",
      },
      // Tuition
      tuition: {
        title: "Học phí & Thanh toán",
        total: "Tổng tiền",
        paid: "Đã thanh toán",
        pending: "Chờ thanh toán",
        overdue: "Quá hạn",
        dueDate: "Hạn thanh toán",
        paymentDate: "Ngày thanh toán",
        paymentMethod: "Phương thức",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "vi", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
