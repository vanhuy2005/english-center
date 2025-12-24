# Fix API 404 Errors - Duplicate /api Prefix Issue

## Ngày: 23/12/2025

## Vấn Đề

Các trang enrollment staff (ClassTrackingPage, StudentManagementPage, RequestManagementPage) không load được dữ liệu với lỗi 404:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
http://localhost:5000/api/api/staff/enrollment/classes
http://localhost:5000/api/api/courses
```

## Nguyên Nhân

**Duplicate `/api` prefix** trong URL:

- `services/api.js` có baseURL: `http://localhost:5000/api`
- Các service gọi endpoint: `/api/staff/enrollment/classes`
- Kết quả: `http://localhost:5000/api` + `/api/...` = `/api/api/...` ❌

## Giải Pháp

Loại bỏ `/api` prefix trong tất cả API calls vì baseURL đã có `/api`.

### Files Đã Fix:

#### 1. **classService.js**

```diff
- api.get("/api/staff/enrollment/classes", { params })
+ api.get("/staff/enrollment/classes", { params })

- api.get(`/api/classes/${id}`)
+ api.get(`/classes/${id}`)
```

#### 2. **ClassTrackingPage.jsx**

```diff
- api.get("/api/courses")
+ api.get("/courses")
```

#### 3. **receiptService.js**

```diff
- api.get("/api/receipts", { params })
+ api.get("/receipts", { params })

- api.post("/api/receipts", data)
+ api.post("/receipts", data)
```

#### 4. **Teacher Pages**

- TeacherNotificationsPage.jsx: `/api/teachers/notifications` → `/teachers/notifications`
- TeacherSchedulePage.jsx: `/api/teachers/schedule` → `/teachers/schedule`
- TeacherDashboardPage.jsx: `/api/teachers/dashboard` → `/teachers/dashboard`
- MyClassesPage.jsx: `/api/teachers/classes` → `/teachers/classes`

## Seed Data

Đã tạo seed data mới cho enrollment system:

**File:** `server/seeds/seedEnrollmentData.js`

**Dữ liệu được tạo:**

- ✅ 6 Courses (A1, A2, B1, B2, C1, C2)
- ✅ 12 Classes (2 classes mỗi course)
- ✅ 25 Students
- ✅ 15 Enrollments
- ✅ 20 Requests (course_enrollment, transfer, pause, resume, withdrawal)

**Chạy seed:**

```bash
cd server
node seeds/seedEnrollmentData.js
```

## Verification

Sau khi fix, các endpoint sau hoạt động đúng:

- ✅ GET `/api/staff/enrollment/classes` - Lấy danh sách lớp học
- ✅ GET `/api/courses` - Lấy danh sách khóa học
- ✅ GET `/api/staff/enrollment/students` - Lấy danh sách học viên
- ✅ GET `/api/staff/enrollment/requests` - Lấy danh sách yêu cầu

## Kết Quả

- ✅ Không còn lỗi 404
- ✅ Trang Thông Tin Lớp Học hiển thị 12 lớp học
- ✅ Trang Danh Sách Học Viên hiển thị 25 học viên
- ✅ Trang Xử Lý Yêu Cầu hiển thị 20 yêu cầu
- ✅ Dashboard hiển thị thống kê đúng

## Best Practice

**Quy tắc:** Khi dùng axios instance với baseURL có `/api`, các endpoint **KHÔNG** được bắt đầu bằng `/api`

```javascript
// ✅ ĐÚNG
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.get("/users"); // → http://localhost:5000/api/users

// ❌ SAI
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.get("/api/users"); // → http://localhost:5000/api/api/users (404)
```
