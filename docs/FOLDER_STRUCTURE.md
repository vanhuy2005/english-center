# Cấu Trúc Thư Mục Mới

## Ngày cập nhật: 2025-11-08

### Thay đổi chính:

#### 1. **Client - Pages Staff**

- ✅ Tạo folder `academic/` cho các trang Academic Staff
- ✅ Tạo folder `accountant/` cho các trang Accountant
- ✅ Folder `enrollment/` đã có sẵn

**Cấu trúc:**

```
client/src/pages/staff/
├── academic/
│   ├── index.js
│   ├── AcademicStaffDashboardPage.jsx
│   ├── ClassManagementPage.jsx
│   ├── AttendanceTrackingPage.jsx
│   ├── GradeManagementPage.jsx
│   ├── StudentProgressPage.jsx
│   ├── RequestHandlingPage.jsx
│   ├── ClassReportsPage.jsx
│   └── AcademicStatisticsPage.jsx
├── accountant/
│   ├── index.js
│   ├── AccountantDashboardPage.jsx
│   ├── TuitionManagementPage.jsx
│   ├── PaymentReceiptsPage.jsx
│   ├── CreateReceiptPage.jsx
│   ├── DebtTrackingPage.jsx
│   ├── RefundProcessingPage.jsx
│   ├── RevenueReportsPage.jsx
│   ├── ExportReportsPage.jsx
│   ├── AccountantSchedulePage.jsx
│   ├── AccountantNotificationsPage.jsx
│   └── AccountantProfilePage.jsx
├── enrollment/
│   └── (existing files)
└── EnrollmentStaffDashboard.jsx
```

#### 2. **Client - Gộp Students vào Student**

- ✅ Di chuyển `StudentListPage.jsx` và `StudentDetailPage.jsx` từ `pages/students/` sang `pages/student/`
- ✅ Xóa folder `pages/students/`
- ✅ Tạo `student/index.js` để export tất cả student pages

**Cấu trúc:**

```
client/src/pages/student/
├── index.js
├── StudentDashboard.jsx
├── StudentListPage.jsx         (từ students/)
├── StudentDetailPage.jsx       (từ students/)
├── ProfilePage.jsx
├── NotificationsPage.jsx
├── SchedulePage.jsx
├── GradesPage.jsx
├── TuitionPage.jsx
├── MyCoursesPage.jsx
├── RequestListPage.jsx
├── RequestFormPage.jsx
├── EnrollPage.jsx
├── StudentGradesPage.jsx
└── StudentAttendancePage.jsx
```

#### 3. **Client - Gộp Locales vào i18n**

- ✅ Di chuyển `en.json` và `vi.json` từ `src/locales/` sang `src/i18n/`
- ✅ Xóa folder `src/locales/`

**Cấu trúc:**

```
client/src/i18n/
├── config.js
├── en.json    (từ locales/)
└── vi.json    (từ locales/)
```

#### 4. **Server - Staff Modules (Đã có từ trước)**

```
server/src/modules/staff/
├── academic/
│   ├── academic.controller.js
│   └── academic.routes.js
├── accountant/
│   ├── accountant.controller.js
│   └── accountant.routes.js
└── enrollment/
    ├── enrollment.controller.js
    └── enrollment.routes.js
```

### Cập nhật Routes & Imports:

#### ✅ `client/src/config/routes.jsx`

- Import academic pages từ `@pages/staff/academic/...`
- Import accountant pages từ `@pages/staff/accountant/...`
- Import student management từ `@pages/student/...` (không còn @pages/students)

#### ✅ `client/src/App.jsx`

- Import AcademicStaffDashboard từ `@pages/staff/academic/AcademicStaffDashboardPage`
- Import AccountantDashboard từ `@pages/staff/accountant/AccountantDashboardPage`

### Lợi ích:

1. **Tổ chức rõ ràng:** Mỗi role staff có folder riêng
2. **Dễ bảo trì:** Tìm file nhanh hơn theo module
3. **Nhất quán:** Không còn folder trùng tên (student/students)
4. **Giảm clutter:** Không còn 20+ file jsx nằm rải rác trong staff/
5. **Export thuận tiện:** Có index.js cho mỗi module

### Migration Complete ✅

Tất cả các thay đổi đã được thực hiện và kiểm tra không có lỗi compile.
