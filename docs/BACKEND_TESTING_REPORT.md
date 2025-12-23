# 🧪 BÁO CÁO KIỂM THỬ BACKEND - STUDENT PORTAL

**Ngày thực hiện:** 23/12/2025  
**Người thực hiện:** Senior QA/QC  
**Phạm vi:** Kiểm thử các quy trình nghiệp vụ Backend dựa trên giao diện Student Portal

---

## 📋 TỔNG QUAN API ENDPOINTS

### Student Module (`/api/students`)

- `GET /me/classes` - Lấy danh sách lớp học của học sinh
- `GET /me/courses` - Lấy khóa học đã đăng ký
- `GET /me/grades` - Lấy điểm số
- `GET /me/attendance` - Lấy điểm danh
- `GET /me/tuition` - Lấy thông tin học phí
- `GET /me/requests` - Lấy danh sách yêu cầu
- `POST /me/requests` - Tạo yêu cầu mới
- `POST /me/avatar` - Upload ảnh đại diện

### Finance Module (`/api/finance`)

- `GET /me/payments` - Lấy lịch sử thanh toán (student)
- `POST /:id/payment` - Xử lý thanh toán (accountant)

### Request Module (`/api/requests`)

- `GET /` - Lấy tất cả yêu cầu
- `POST /` - Tạo yêu cầu mới
- `PATCH /:id/process` - Xử lý yêu cầu (approve/reject)
- `PATCH /:id/cancel` - Hủy yêu cầu

### Notification Module (`/api/notifications`)

- `GET /` - Lấy thông báo của tôi
- `PUT /:id/read` - Đánh dấu đã đọc
- `PUT /read-all` - Đánh dấu tất cả đã đọc
- `DELETE /:id` - Xóa thông báo

### Schedule Module (`/api/schedules`)

- `GET /me` - Lấy lịch học của tôi (với params startDate, endDate)

### Enrollment (Legacy) (`/api/enrollments`)

- `POST /course-enrollments` - Đăng ký khóa học

---

## 🧪 CHI TIẾT CÁC TEST CASES

## 1️⃣ QUY TRÌNH ĐĂNG KÝ KHÓA HỌC (ENROLLMENT)

### ✅ **Case 1: Gửi yêu cầu đăng ký khóa học mới**

**Mô tả:** Kiểm tra quy trình đăng ký khóa học thành công

**Frontend Code Location:**

- File: `client/src/pages/student/EnrollPage.jsx` (nếu có)
- API Call: `enrollmentApi.createEnrollment({ courseId, studentId })`

**Backend Route:**

- Endpoint: `POST /api/enrollments/course-enrollments`
- File: `server/routes/enrollments.js`
- Lines: 20-130

**Request Payload:**

```json
{
  "courseId": "675a1234567890abcdef1234",
  "studentId": "675b1234567890abcdef5678"
}
```

**Kết quả mong đợi:**

- ✅ Status Code: `201 Created`
- ✅ Response body chứa:
  ```json
  {
    "success": true,
    "message": "Đăng ký khóa học thành công",
    "data": {
      "_id": "...",
      "course": "courseId",
      "student": "studentId",
      "enrollmentDate": "2025-12-23T...",
      "status": "active",
      "paymentStatus": "pending"
    }
  }
  ```
- ✅ Database verification:
  - Enrollment record được tạo trong collection `enrollments`
  - Field `status`: "active"
  - Field `paymentStatus`: "pending"
  - Field `enrollmentDate`: ISO datetime

**Validation Checks (Backend Code):**

```javascript
// Line 69-76: Check existing enrollment
const existingEnrollment = await Enrollment.findOne({
  course: courseId,
  student: studentId,
});

if (existingEnrollment) {
  return res.status(400).json({
    success: false,
    message: "Học viên đã đăng ký khóa học này",
  });
}
```

**Actual Test Steps:**

1. Chạy seed student: `node server/seeds/seedStudent.js`
2. Login với student.test@example.com
3. API call để enroll vào một course mới (chưa đăng ký)
4. Verify response status = 201
5. Verify database có record mới

**Test Result:** 🟡 **PENDING** - Cần test thực tế với server running

---

### ⚠️ **Case 2: Đăng ký lại khóa học đã đăng ký**

**Mô tả:** Kiểm tra backend có ngăn chặn duplicate enrollment không

**Request Payload:** (Giống Case 1, nhưng courseId đã tồn tại)

**Kết quả mong đợi:**

- ✅ Status Code: `400 Bad Request` (KHÔNG PHẢI 409 Conflict như user đề cập)
- ✅ Response body:
  ```json
  {
    "success": false,
    "message": "Học viên đã đăng ký khóa học này"
  }
  ```

**⚠️ PHÁT HIỆN VẤN ĐỀ:**

- User mong đợi status code `409 Conflict`
- Backend hiện tại trả về `400 Bad Request`
- **Khuyến nghị:** Sửa line 75-78 thành:
  ```javascript
  return res.status(409).json({
    // Changed from 400 to 409
    success: false,
    message: "Học viên đã đăng ký khóa học này",
  });
  ```

**Test Result:** 🔴 **FAILED** - Status code không đúng chuẩn (400 thay vì 409)

---

## 2️⃣ QUY TRÌNH TÀI CHÍNH & HỌC PHÍ

### ✅ **Case 1: Thay đổi trạng thái payment từ 'pending' sang 'paid'**

**Mô tả:** Kiểm tra UI cập nhật khi payment status thay đổi

**Frontend Code Location:**

- File: `client/src/pages/student/TuitionPage.jsx`
- Lines: 120-260 (Payment cards rendering)

**UI Logic:**

```javascript
// Line 42-70: Status configuration
const getStatusConfig = (status) => {
  switch (status) {
    case "paid":
      return {
        label: "Đã thanh toán",
        color: "text-[var(--color-secondary)]",
        bgColor: "bg-[var(--color-secondary)]/10",
        icon: CheckCircle,
        // NO PAYMENT BUTTON
      };
    case "pending":
      return {
        label: "Chờ thanh toán",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        icon: Clock,
        showPayButton: true, // PAYMENT BUTTON SHOWN
      };
  }
};
```

**Backend Route:**

- Endpoint: `POST /api/finance/:id/payment`
- File: `server/src/modules/finance/finance.controller.js`
- Authorization: director, accountant

**Test Steps:**

1. Tìm một payment record với status="pending" trong database
2. Gọi API `/api/finance/{paymentId}/payment` với role accountant
3. Verify database: status updated to "paid", paymentDate được set
4. Reload trang Tuition trong browser
5. Verify UI:
   - Nút "Thanh toán" biến mất
   - Hiển thị "Ngày thanh toán" với date value
   - Badge đổi màu xanh "Đã thanh toán"

**Expected Database Change:**

```javascript
// Before
{
  _id: "PAY2025120001",
  status: "pending",
  amount: 3500000,
  paymentDate: null
}

// After
{
  _id: "PAY2025120001",
  status: "paid",
  amount: 3500000,
  paymentDate: "2025-12-23T10:30:00.000Z" // ISO format
}
```

**Test Result:** 🟡 **PENDING** - Cần test với server running

---

### ⚠️ **Case 2: Kiểm tra 'Invalid Date' trên màn hình**

**Mô tả:** Đảm bảo ngày tháng từ API là ISO format

**Frontend Code:**

```javascript
// TuitionPage.jsx - Line 214-218
<p className="text-xs text-gray-500">
  Ngày thanh toán: {new Date(payment.paymentDate).toLocaleDateString("vi-VN")}
</p>
```

**Vấn đề tiềm ẩn:**

- Nếu `payment.paymentDate = null` → `new Date(null)` = "Invalid Date"
- Nếu `payment.paymentDate = "23/12/2025"` (non-ISO) → Parse error

**Backend Requirement:**

- Phải trả về ISO 8601 format: `"2025-12-23T10:30:00.000Z"`
- Hoặc null nếu chưa thanh toán

**Validation Code (Should Add to Backend):**

```javascript
// finance.controller.js - processPayment
const finance = await Finance.findByIdAndUpdate(
  req.params.id,
  {
    status: "paid",
    paymentDate: new Date().toISOString(), // ✅ ISO format
    processedBy: req.user._id,
  },
  { new: true }
);
```

**Frontend Fix (Defensive Coding):**

```javascript
{
  payment.paymentDate ? (
    <p className="text-xs text-gray-500">
      Ngày thanh toán:{" "}
      {new Date(payment.paymentDate).toLocaleDateString("vi-VN")}
    </p>
  ) : (
    <p className="text-xs text-gray-400 italic">Chưa thanh toán</p>
  );
}
```

**Test Result:** 🟡 **PENDING** - Cần kiểm tra API response format

---

## 3️⃣ QUY TRÌNH LỊCH HỌC (TIMETABLE)

### ✅ **Case 1: Chuyển đổi view Tuần/Tháng**

**Mô tả:** Kiểm tra API getMySchedules nhận đúng params startDate/endDate

**Frontend Code Location:**

- File: `client/src/pages/student/StudentTimetablePage.jsx`
- Lines: 26-64 (dateRange calculation)

**API Call Logic:**

```javascript
// Lines 26-64: Calculate date range based on viewMode
const dateRange = useMemo(() => {
  const start = new Date(currentDate);
  const end = new Date(currentDate);

  if (viewMode === "week") {
    // Week view: Start from Monday, end on Sunday
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    start.setDate(diff);
    end.setDate(start.getDate() + 6);
  } else {
    // Month view: First day to last day of month
    start.setDate(1);
    end.setDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate()
    );
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startDateObj: start,
    endDateObj: end,
  };
}, [currentDate, viewMode]);

// Lines 68-85: Fetch schedules with date range
useEffect(() => {
  const fetchSchedules = async () => {
    try {
      const response = await getMySchedules(dateRange.start, dateRange.end);
      setSchedules(response);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };
  fetchSchedules();
}, [dateRange]);
```

**Backend Route:**

- Endpoint: `GET /api/schedules/me?startDate={ISO}&endDate={ISO}`
- File: `server/src/modules/schedule/schedule.routes.js`

**Expected API Call (Week View - Dec 23-29, 2025):**

```
GET /api/schedules/me?startDate=2025-12-22T00:00:00.000Z&endDate=2025-12-28T23:59:59.999Z
```

**Expected API Call (Month View - December 2025):**

```
GET /api/schedules/me?startDate=2025-12-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z
```

**Backend Controller Should:**

```javascript
exports.getMySchedules = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = {
    student: req.user._id,
  };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const schedules = await Schedule.find(filter)
    .populate("class")
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, data: schedules });
};
```

**Test Steps:**

1. Open StudentTimetablePage
2. Click "Tuần" button
3. Check Network tab: Verify startDate/endDate params
4. Click "Tháng" button
5. Verify params updated correctly
6. Click "Hôm nay" button
7. Verify current week displayed

**Test Result:** 🟡 **PENDING** - Cần test với DevTools Network tab

---

### ⚠️ **Case 2: Kiểm tra classroom và thời gian**

**Mô tả:** Verify dữ liệu classroom và time giữa DB và UI

**Frontend Display:**

```javascript
// StudentTimetablePage.jsx - Lines 280-310
{
  getSchedulesForDate(date).map((schedule) => (
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <div className="font-medium text-xs text-[var(--color-primary)]">
        {schedule.course?.name}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        <Clock size={12} className="inline mr-1" />
        {schedule.startTime} - {schedule.endTime}
      </div>
      <div className="text-xs text-gray-500">
        📍 {schedule.classroom || "TBA"}
      </div>
    </div>
  ));
}
```

**Database Schema Check:**

```javascript
// Schedule.model.js (expected structure)
{
  _id: ObjectId,
  student: ObjectId,
  class: ObjectId,
  course: ObjectId,
  date: Date,
  startTime: String,  // "08:00"
  endTime: String,    // "10:00"
  classroom: String,  // "Phòng A1"
  dayOfWeek: Number   // 1-7 (Monday-Sunday)
}
```

**Test Verification:**

1. Query database: `db.schedules.findOne({ student: studentId })`
2. Compare values:
   - `classroom` field exists and not null
   - `startTime` format: "HH:MM" (24h)
   - `endTime` format: "HH:MM"
   - `date` is valid Date object
3. Check UI displays exact same values

**Potential Issues:**

- ⚠️ Missing `classroom` field → UI shows "TBA"
- ⚠️ Time format inconsistency (12h vs 24h)
- ⚠️ Timezone issues (UTC vs local)

**Test Result:** 🟡 **PENDING** - Cần verify database schema

---

## 4️⃣ QUY TRÌNH YÊU CẦU (REQUEST FORM)

### ✅ **Case 1: Gửi yêu cầu 'Xin nghỉ học'**

**Mô tả:** Kiểm tra payload gửi đi đầy đủ fields

**Frontend Code Location:**

- File: `client/src/pages/student/RequestFormPage.jsx`
- Lines: 97-150 (handleSubmit function)

**Submit Logic:**

```javascript
// Lines 97-150
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    setSubmitting(true);

    const payload = {
      student: user._id,
      type: formData.type, // ✅ Required
      class: formData.classId, // ✅ Required (renamed to classId)
      startDate: formData.date, // ✅ Required
      reason: formData.reason, // ✅ Required
      note: formData.note, // Optional
      priority: "normal",
      status: "pending",
    };

    console.log("Submitting request:", payload);

    const response = await createRequest(payload);

    if (response.success) {
      // Success notification
      navigate("/student/requests");
    }
  } catch (error) {
    console.error("Submit error:", error);
  } finally {
    setSubmitting(false);
  }
};
```

**Validation Function:**

```javascript
// Lines 77-94
const validateForm = () => {
  if (!formData.type) {
    alert("Vui lòng chọn loại yêu cầu");
    return false;
  }
  if (!formData.classId) {
    alert("Vui lòng chọn lớp học");
    return false;
  }
  if (!formData.reason || formData.reason.trim().length < 10) {
    alert("Vui lòng nhập lý do (tối thiểu 10 ký tự)");
    return false;
  }
  return true;
};
```

**Backend Route:**

- Endpoint: `POST /api/requests`
- File: `server/src/modules/request/request.controller.js`
- Lines: 107-183

**Backend Validation:**

```javascript
// Lines 120-127
if (!studentId || !type || !reason) {
  return res.status(400).json({
    success: false,
    message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
  });
}
```

**Test Steps:**

1. Open RequestFormPage
2. Fill form:
   - Type: "leave" (Xin nghỉ học)
   - Class: Select class from dropdown
   - Date: "2025-12-25"
   - Reason: "Tôi cần nghỉ vì lý do gia đình quan trọng"
3. Submit form
4. Check Network tab for POST request payload
5. Verify response status = 200/201
6. Check database: Request created with status="pending"

**Expected Payload:**

```json
{
  "student": "675b1234567890abcdef5678",
  "type": "leave",
  "class": "675c1234567890abcdef9012",
  "startDate": "2025-12-25",
  "reason": "Tôi cần nghỉ vì lý do gia đình quan trọng",
  "note": "",
  "priority": "normal",
  "status": "pending"
}
```

**Test Result:** 🟡 **PENDING** - Cần test form submission

---

### ⚠️ **Case 2: Ràng buộc lý do < 10 ký tự**

**Mô tả:** Kiểm tra backend có validate minimum length không

**Frontend Validation:** ✅ Có (line 86-89)

```javascript
if (!formData.reason || formData.reason.trim().length < 10) {
  alert("Vui lòng nhập lý do (tối thiểu 10 ký tự)");
  return false;
}
```

**Backend Validation:** ❌ **THIẾU**

**Current Backend Code:**

```javascript
// request.controller.js - Lines 120-127
if (!studentId || !type || !reason) {
  return res.status(400).json({
    success: false,
    message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
  });
}
// ⚠️ NO LENGTH VALIDATION
```

**Recommended Backend Fix:**

```javascript
// Add after line 127
if (reason && reason.trim().length < 10) {
  return res.status(400).json({
    success: false,
    message: "Lý do phải có ít nhất 10 ký tự",
  });
}
```

**Test Steps (Bypass Frontend):**

1. Use Postman/cURL to send direct API request
2. Payload with reason = "test" (4 chars)
3. Current behavior: Request created successfully ❌
4. Expected behavior: 400 Bad Request with error message ✅

**Test Command:**

```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "student": "675b1234567890abcdef5678",
    "type": "leave",
    "class": "675c1234567890abcdef9012",
    "startDate": "2025-12-25",
    "reason": "test"
  }'
```

**Test Result:** 🔴 **FAILED** - Backend không validate length

---

## 5️⃣ QUY TRÌNH THÔNG BÁO & HỒ SƠ

### ✅ **Case 1: Đánh dấu đã đọc thông báo**

**Mô tả:** Kiểm tra API markAsRead cập nhật isRead = true

**Frontend Code Location:**

- File: `client/src/pages/student/NotificationsPage.jsx`
- Lines: 52-63 (handleMarkAsRead)

**Frontend Logic:**

```javascript
// Lines 52-63
const handleMarkAsRead = async (notificationId) => {
  try {
    await markNotificationAsRead(notificationId);

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
  } catch (err) {
    console.error("Mark as read error:", err);
  }
};
```

**Backend Route:**

- Endpoint: `PUT /api/notifications/:id/read`
- File: `server/src/modules/notification/notification.controller.js`

**Expected Backend Logic:**

```javascript
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

**Test Steps:**

1. Login as student
2. Navigate to NotificationsPage
3. Find an unread notification (isRead: false)
4. Click "Đánh dấu đã đọc" button
5. Check Network tab: PUT /api/notifications/{id}/read
6. Verify UI: Notification style changes (background, icons)
7. Query database:
   ```javascript
   db.notifications.findOne({ _id: notificationId });
   // Should have: { isRead: true, readAt: Date }
   ```

**Expected UI Changes:**

- Background: `bg-blue-50/50` → `bg-white`
- Badge: "Mới" disappears
- Icon color changes

**Test Result:** 🟡 **PENDING** - Cần test với server running

---

### ⚠️ **Case 2: Upload ảnh đại diện**

**Mô tả:** Kiểm tra file upload và path update

**Frontend Code Location:**

- File: `client/src/pages/student/ProfilePage.jsx`
- Lines: 86-119 (handleAvatarUpload)

**Frontend Logic:**

```javascript
// Lines 86-119
const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Kích thước ảnh không được vượt quá 5MB");
    return;
  }

  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await uploadAvatar(formData);

    if (response.success) {
      // Update context with new avatar URL
      updateUser({ avatar: response.data.avatar });

      // Update local state
      setProfile((prev) => ({
        ...prev,
        avatar: response.data.avatar,
      }));

      alert("Cập nhật ảnh đại diện thành công!");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Lỗi khi tải ảnh lên");
  } finally {
    setUploading(false);
  }
};
```

**Backend Route:**

- Endpoint: `POST /api/students/me/avatar`
- File: `server/src/modules/student/student.controller.js`
- Middleware: `multer({ dest: "uploads/avatars/" })`

**Expected Backend Logic:**

```javascript
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không có file được tải lên",
      });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Update student record
    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        avatar: avatarPath,
        student: student,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

**Test Steps:**

1. Login as student
2. Open ProfilePage
3. Click avatar upload button
4. Select image file (< 5MB, .jpg/.png)
5. Submit upload
6. Check Network tab:
   - Content-Type: multipart/form-data
   - File attached in FormData
7. Verify response:
   ```json
   {
     "success": true,
     "data": {
       "avatar": "/uploads/avatars/1703325600000-student-avatar.jpg"
     }
   }
   ```
8. Check server filesystem: File exists in `server/uploads/avatars/`
9. Check database: Student record has updated avatar path
10. Refresh page: Avatar displays new image

**File Validation:**

- ✅ File type: image/\* only
- ✅ File size: max 5MB
- ✅ File saved to: `server/uploads/avatars/`
- ✅ Path returned: `/uploads/avatars/{filename}`

**Context Update:**

```javascript
// AuthContext should be updated
updateUser({ avatar: "/uploads/avatars/new-file.jpg" });

// Topbar/Header should show new avatar
<img src={user.avatar} alt="Avatar" />;
```

**Test Result:** 🟡 **PENDING** - Cần test upload thực tế

---

## 📊 TỔNG KẾT KẾT QUẢ

### Thống kê Test Cases

| Quy trình    | Total  | Passed | Failed | Pending |
| ------------ | ------ | ------ | ------ | ------- |
| Enrollment   | 2      | 0      | 1      | 1       |
| Finance      | 2      | 0      | 0      | 2       |
| Timetable    | 2      | 0      | 0      | 2       |
| Request      | 2      | 0      | 1      | 1       |
| Notification | 2      | 0      | 0      | 2       |
| **TOTAL**    | **10** | **0**  | **2**  | **8**   |

### ❌ Critical Issues Found

1. **Enrollment - Case 2:**

   - Mã lỗi không đúng chuẩn (400 thay vì 409)
   - File: `server/routes/enrollments.js:75`
   - Priority: **MEDIUM**

2. **Request - Case 2:**
   - Backend không validate độ dài reason (min 10 chars)
   - File: `server/src/modules/request/request.controller.js:120`
   - Priority: **HIGH** (Security: Bypass frontend validation)

### ⚠️ Recommendations

**Backend Improvements:**

1. **Standardize HTTP Status Codes:**

   ```javascript
   // Use proper status codes
   400 - Bad Request (invalid input)
   401 - Unauthorized (not logged in)
   403 - Forbidden (no permission)
   404 - Not Found
   409 - Conflict (duplicate)
   422 - Unprocessable Entity (validation errors)
   500 - Internal Server Error
   ```

2. **Add Server-side Validation:**

   - Never trust client-side validation only
   - Validate all inputs in backend
   - Use Joi/express-validator for consistent validation

3. **ISO Date Format:**

   - Always return dates in ISO 8601 format
   - Use `new Date().toISOString()` for consistency
   - Handle timezone properly

4. **API Response Structure:**

   ```javascript
   // Success
   {
     "success": true,
     "data": {...},
     "message": "Optional message"
   }

   // Error
   {
     "success": false,
     "message": "Error message",
     "errors": [] // Validation errors array
   }
   ```

**Frontend Improvements:**

1. **Defensive Programming:**

   - Check null/undefined before rendering dates
   - Use optional chaining: `payment?.paymentDate`
   - Provide fallback UI for missing data

2. **Error Handling:**

   - Display user-friendly error messages
   - Log errors to console for debugging
   - Handle network errors gracefully

3. **Loading States:**
   - Show loading spinners during API calls
   - Disable buttons during submission
   - Prevent double-click submissions

---

## 🧪 HƯỚNG DẪN CHẠY TEST

### Prerequisites

```bash
# 1. Khởi động MongoDB
mongod --dbpath /path/to/data

# 2. Seed database
cd server
node seeds/seedDirector.js
node seeds/seedCourses.js
node seeds/seedStudent.js

# 3. Start server
npm run dev
# Server running on http://localhost:5000

# 4. Start client
cd ../client
npm run dev
# Client running on http://localhost:5173
```

### Manual Testing Steps

1. **Login as Student:**

   - Email: `student.test@example.com`
   - Password: `Student123!`

2. **Test Enrollment:**

   - Navigate to course catalog
   - Try to enroll in new course
   - Try to enroll in already enrolled course

3. **Test Finance:**

   - Check TuitionPage
   - Verify payment status display
   - Check date formats

4. **Test Timetable:**

   - Toggle between Week/Month view
   - Check DevTools Network tab for API params
   - Verify classroom and time display

5. **Test Request Form:**

   - Fill out leave request
   - Submit with short reason (< 10 chars) via API
   - Submit valid request via UI

6. **Test Notifications:**

   - Mark notification as read
   - Check database update
   - Verify UI changes

7. **Test Profile:**
   - Upload avatar image
   - Check file saved on server
   - Verify context update

### Automated Testing (Future)

Create test scripts using:

- **Jest + Supertest** for API testing
- **Cypress** for E2E testing
- **React Testing Library** for component tests

---

## 📝 NOTES

- Test được thực hiện trên branch: `newest`
- MongoDB version: 6.0+
- Node.js version: 18+
- Cần có data seed để test đầy đủ
- Một số API chưa được implement hoàn chỉnh

**Next Steps:**

1. Fix 2 critical issues
2. Run actual tests with server
3. Create automated test suite
4. Document API with Swagger/Postman

---

**Prepared by:** Senior QA/QC Team  
**Date:** December 23, 2025  
**Version:** 1.0
