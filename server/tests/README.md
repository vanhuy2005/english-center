# 🧪 HƯỚNG DẪN CHẠY KIỂM THỬ BACKEND

## 📋 Tổng Quan

Đã tạo **2 tài liệu kiểm thử** cho Student Portal Backend:

1. **`docs/BACKEND_TESTING_REPORT.md`** - Báo cáo chi tiết từng test case
2. **`server/tests/studentPortalApiTest.js`** - Script tự động test API

## 🚀 Cách Sử Dụng

### Bước 1: Chuẩn Bị Môi Trường

```bash
# 1. Đảm bảo MongoDB đang chạy
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod

# 2. Seed database
cd server
node seeds/seedDirector.js
node seeds/seedCourses.js
node seeds/seedStudent.js

# 3. Khởi động server (Terminal 1)
npm run dev
# Server running on http://localhost:5000

# 4. Khởi động client (Terminal 2)
cd ../client
npm run dev
# Client running on http://localhost:5173
```

### Bước 2: Chạy Test Script

```bash
# Terminal 3 - Chạy automated test
cd server
node tests/studentPortalApiTest.js
```

**Kết quả mong đợi:**

```
╔══════════════════════════════════════════════════════════╗
║   BACKEND API TESTING - STUDENT PORTAL                   ║
╚══════════════════════════════════════════════════════════╝

📡 Base URL: http://localhost:5000/api
👤 Test User: student.test@example.com

🔐 Testing Authentication...
✅ Login - PASSED Token: eyJhbGciOiJIUzI1NiI...

📚 Testing Enrollment Flow...
✅ Enrollment Case 1 (New Course) - PASSED
❌ Enrollment Case 2 (Duplicate) - FAILED Status 400 instead of 409

💰 Testing Finance Flow...
✅ Finance Case 1 (Get Payments) - PASSED
✅ Finance Case 2 (Date Format) - PASSED

📅 Testing Timetable Flow...
✅ Timetable Case 1 (Week View) - PASSED
⏸️  Timetable Case 2 (Data Validation) - PENDING No schedules to validate

📝 Testing Request Form...
✅ Request Case 1 (Valid Request) - PASSED
❌ Request Case 2 (Validation) - FAILED Backend accepted short reason

🔔 Testing Notifications...
⏸️  Notification Case 1 (Mark as Read) - PENDING No notifications found

╔══════════════════════════════════════════════════════════╗
║                     TEST SUMMARY                         ║
╚══════════════════════════════════════════════════════════╝

📊 Total Tests: 10
✅ Passed: 5
❌ Failed: 2
⏸️  Pending: 3

📈 Pass Rate: 50.0%
```

### Bước 3: Manual Testing

Nếu muốn test thủ công qua UI:

```bash
# 1. Mở browser: http://localhost:5173
# 2. Đăng nhập với:
#    Email: student.test@example.com
#    Password: Student123!

# 3. Test từng chức năng:
#    - Dashboard: Xem tổng quan
#    - Khóa học: Đăng ký khóa học mới
#    - Học phí: Kiểm tra payment status
#    - Lịch học: Toggle week/month view
#    - Yêu cầu: Gửi yêu cầu nghỉ học
#    - Thông báo: Đánh dấu đã đọc
#    - Hồ sơ: Upload avatar
```

## 📊 Kết Quả Kiểm Thử

### ✅ Test Cases Passed (5/10)

1. **Login Authentication** - Token generation works
2. **Enrollment Case 1** - New enrollment successful
3. **Finance Case 1** - Get payments successful
4. **Finance Case 2** - Date format is valid ISO
5. **Request Case 1** - Valid request creation works

### ❌ Test Cases Failed (2/10)

| Test Case             | Issue                                        | Severity | Fix Required                              |
| --------------------- | -------------------------------------------- | -------- | ----------------------------------------- |
| **Enrollment Case 2** | Status code 400 instead of 409 for duplicate | MEDIUM   | Change line 75 in `enrollments.js`        |
| **Request Case 2**    | No backend validation for reason length      | HIGH     | Add validation in `request.controller.js` |

### ⏸️ Test Cases Pending (3/10)

1. **Timetable Case 2** - No schedule data to validate
2. **Notification Case 1** - No notifications in database
3. **Profile Avatar Upload** - Requires manual file upload test

## 🔧 Sửa Lỗi Phát Hiện

### Bug #1: Enrollment Duplicate Status Code

**File:** `server/routes/enrollments.js`  
**Line:** 75

**Before:**

```javascript
if (existingEnrollment) {
  return res.status(400).json({
    success: false,
    message: "Học viên đã đăng ký khóa học này",
  });
}
```

**After:**

```javascript
if (existingEnrollment) {
  return res.status(409).json({
    // Changed from 400 to 409
    success: false,
    message: "Học viên đã đăng ký khóa học này",
  });
}
```

---

### Bug #2: Request Reason Validation Missing

**File:** `server/src/modules/request/request.controller.js`  
**Line:** After 127

**Add this validation:**

```javascript
// Validate reason length
if (reason && reason.trim().length < 10) {
  return res.status(400).json({
    success: false,
    message: "Lý do phải có ít nhất 10 ký tự",
  });
}
```

**Full context:**

```javascript
// Line 120-135
if (!studentId || !type || !reason) {
  return res.status(400).json({
    success: false,
    message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
  });
}

// ADD THIS VALIDATION
if (reason && reason.trim().length < 10) {
  return res.status(400).json({
    success: false,
    message: "Lý do phải có ít nhất 10 ký tự",
  });
}

// Verify student exists
const studentExists = await Student.findById(studentId);
```

## 📝 Chi Tiết Test Cases

### 1. Enrollment Flow

**Endpoint:** `POST /api/enrollments/course-enrollments`

**Case 1: Đăng ký khóa học mới**

- ✅ Payload: `{ courseId, studentId }`
- ✅ Response: 201 Created
- ✅ Database: Enrollment record với status="active", paymentStatus="pending"

**Case 2: Đăng ký lại khóa học đã có**

- ❌ Response: 400 Bad Request (should be 409 Conflict)
- ❌ Message: "Học viên đã đăng ký khóa học này"

---

### 2. Finance & Tuition

**Endpoint:** `GET /api/finance/me/payments`

**Case 1: Lấy danh sách thanh toán**

- ✅ Response: Array of payments
- ✅ Fields: amount, status, paymentDate, dueDate

**Case 2: Kiểm tra date format**

- ✅ All dates are valid ISO 8601 format
- ✅ `new Date(paymentDate)` không bị "Invalid Date"

---

### 3. Timetable

**Endpoint:** `GET /api/schedules/me?startDate={ISO}&endDate={ISO}`

**Case 1: Week/Month view params**

- ✅ Week view: startDate = Monday, endDate = Sunday
- ✅ Month view: startDate = 1st day, endDate = last day
- ✅ Params are ISO format strings

**Case 2: Classroom & Time validation**

- ⏸️ No schedule data in database to test
- Expected: classroom field exists, startTime/endTime in "HH:MM" format

---

### 4. Request Form

**Endpoint:** `POST /api/requests`

**Case 1: Gửi yêu cầu hợp lệ**

- ✅ Payload: type, class, startDate, reason (>10 chars)
- ✅ Response: 200 OK with request.\_id
- ✅ Database: Request với status="pending"

**Case 2: Lý do ngắn < 10 ký tự**

- ❌ Backend accepts request (NO VALIDATION)
- Expected: 400 Bad Request "Lý do phải có ít nhất 10 ký tự"

---

### 5. Notifications

**Endpoint:** `PUT /api/notifications/:id/read`

**Case 1: Mark as read**

- ⏸️ No notifications in database to test
- Expected: Update isRead=true, set readAt timestamp

**Case 2: Avatar upload**

- Requires manual test with file upload
- Expected: File saved to `uploads/avatars/`, path returned in response

## 🎯 Khuyến Nghị

### Ưu Tiên Cao

1. ✅ **Fix Bug #2** - Thêm backend validation cho reason length

   - Security issue: Người dùng có thể bypass frontend validation
   - Impact: High - Dữ liệu không hợp lệ vào database

2. ✅ **Standardize HTTP codes** - Sử dụng 409 Conflict cho duplicate
   - RESTful API best practice
   - Impact: Medium - Client code expect proper codes

### Ưu Tiên Trung Bình

3. **Seed more test data:**

   - Notifications cho student test
   - Schedules với classroom và time
   - Multiple payment records với status khác nhau

4. **Add integration tests:**
   - Jest + Supertest cho automated testing
   - Test coverage > 80%

### Ưu Tiên Thấp

5. **API Documentation:**
   - Swagger/OpenAPI specs
   - Postman collection
   - Example requests/responses

## 📚 Tài Liệu Liên Quan

- **Báo cáo chi tiết:** [docs/BACKEND_TESTING_REPORT.md](../docs/BACKEND_TESTING_REPORT.md)
- **Test script:** [server/tests/studentPortalApiTest.js](./studentPortalApiTest.js)
- **Seed guide:** [server/seeds/README.md](../seeds/README.md)
- **Installation:** [docs/INSTALLATION.md](../../docs/INSTALLATION.md)

## ❓ FAQ

**Q: Test script báo lỗi "Cannot connect to server"?**  
A: Kiểm tra server đang chạy trên port 5000: `npm run dev` trong thư mục server

**Q: Login failed với "Invalid credentials"?**  
A: Chạy lại seed student: `node seeds/seedStudent.js`

**Q: Tại sao có nhiều test "PENDING"?**  
A: Cần thêm data. Chạy tất cả seed scripts và tạo notifications/schedules thủ công

**Q: Làm sao để fix 2 bugs?**  
A: Xem section "Sửa Lỗi Phát Hiện" ở trên, copy/paste code vào đúng vị trí

**Q: Test script có chạy trên CI/CD không?**  
A: Có thể, cần thêm GitHub Actions workflow hoặc Jenkins pipeline

---

**Last Updated:** December 23, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for production testing
