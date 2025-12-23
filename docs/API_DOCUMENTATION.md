# 📚 API Documentation - English Center Management System

## Base URL

```
http://localhost:3000
```

## Authentication Header

```javascript
{
  "Authorization": "Bearer <your_jwt_token>"
}
```

---

## 🔐 Authentication Endpoints

### 1. Login

**POST** `/api/auth/login`

**Description**: Đăng nhập với số điện thoại và mật khẩu

**Request Body**:

```json
{
  "phone": "0901234567",
  "password": "student123"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student1@gmail.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "role": "student",
      "status": "active",
      "isFirstLogin": false
    },
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "studentCode": "HV00001",
      "dateOfBirth": "2000-01-15T00:00:00.000Z",
      "gender": "male",
      "enrolledCourses": [...]
    },
    "isFirstLogin": false
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "message": "Số điện thoại hoặc mật khẩu không đúng"
}
```

---

### 2. Register

**POST** `/api/auth/register`

**Description**: Đăng ký tài khoản mới

**Request Body**:

```json
{
  "email": "newstudent@gmail.com",
  "password": "password123",
  "fullName": "Trần Văn B",
  "phone": "0901234568",
  "role": "student",
  "dateOfBirth": "2001-05-20",
  "gender": "male",
  "address": "123 Lê Lợi, Q1, TP.HCM"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": {...},
    "profile": {...}
  }
}
```

---

### 3. Get Current User

**GET** `/api/auth/me`

**Description**: Lấy thông tin user hiện tại

**Headers**: Requires authentication

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "Nguyễn Văn A",
      "email": "student1@gmail.com",
      "phone": "0901234567",
      "role": "student",
      "status": "active"
    },
    "profile": {
      "studentCode": "HV00001",
      "enrolledCourses": [...]
    }
  }
}
```

---

### 4. Change Password

**PUT** `/api/auth/change-password`

**Description**: Đổi mật khẩu (dùng cho lần đầu đăng nhập hoặc bất cứ lúc nào)

**Headers**: Requires authentication

**Request Body** (First login):

```json
{
  "newPassword": "newpassword123",
  "isFirstLogin": true
}
```

**Request Body** (Regular password change):

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "isFirstLogin": false
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

---

### 5. Refresh Token

**POST** `/api/auth/refresh-token`

**Description**: Lấy access token mới khi token cũ hết hạn

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_access_token...",
    "refreshToken": "new_refresh_token..."
  }
}
```

---

### 6. Logout

**POST** `/api/auth/logout`

**Description**: Đăng xuất (xóa refresh token)

**Headers**: Requires authentication

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

## 👨‍🎓 Student Endpoints

### 1. Get My Courses

**GET** `/api/students/me/courses`

**Description**: Lấy danh sách khóa học của học viên hiện tại

**Headers**: Requires authentication (student only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy danh sách khóa học thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "courseName": "TOEIC 600+",
      "courseCode": "TOEIC600",
      "className": "TOEIC600-01",
      "teacherName": "Phạm Thị B",
      "schedule": "Thứ 2, 4, 6 - 18:00-20:00",
      "status": "active",
      "progress": 45,
      "attendanceRate": 90,
      "averageGrade": "8.5",
      "classId": "507f1f77bcf86cd799439014"
    }
  ]
}
```

---

### 2. Get My Grades

**GET** `/api/students/me/grades`

**Description**: Lấy kết quả học tập của học viên hiện tại

**Headers**: Requires authentication (student only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy kết quả học tập thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "courseName": "TOEIC 600+",
      "courseCode": "TOEIC600",
      "className": "TOEIC600-01",
      "participation": 9,
      "assignment": 8.5,
      "midterm": 8,
      "finalExam": 8.5,
      "finalGrade": 8.5,
      "notes": "Học tập tích cực",
      "updatedAt": "2025-11-01T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get My Attendance

**GET** `/api/students/me/attendance`

**Description**: Lấy dữ liệu chuyên cần của học viên hiện tại

**Headers**: Requires authentication (student only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy dữ liệu chuyên cần thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "date": "2025-11-07T00:00:00.000Z",
      "courseName": "TOEIC 600+",
      "className": "TOEIC600-01",
      "session": 15,
      "status": "present",
      "notes": ""
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "date": "2025-11-05T00:00:00.000Z",
      "courseName": "TOEIC 600+",
      "className": "TOEIC600-01",
      "session": 14,
      "status": "excused",
      "notes": "Xin phép nghỉ vì ốm"
    }
  ]
}
```

**Attendance Status Values**:

- `present` - Có mặt
- `absent` - Vắng mặt
- `excused` - Có phép
- `late` - Đi muộn

---

### 4. Get My Tuition

**GET** `/api/students/me/tuition`

**Description**: Lấy thông tin học phí của học viên hiện tại

**Headers**: Requires authentication (student only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy thông tin học phí thành công",
  "data": {
    "summary": {
      "total": 5000000,
      "paid": 3000000,
      "remaining": 2000000,
      "overdue": 0
    },
    "payments": [
      {
        "_id": "507f1f77bcf86cd799439018",
        "courseName": "TOEIC 600+",
        "className": "TOEIC600-01",
        "period": "2025-Q1",
        "amount": 3000000,
        "status": "paid",
        "paidDate": "2025-01-15T00:00:00.000Z",
        "dueDate": "2025-01-31T00:00:00.000Z",
        "notes": "Đã thanh toán đầy đủ"
      }
    ]
  }
}
```

**Payment Status Values**:

- `pending` - Chờ thanh toán
- `partial` - Thanh toán một phần
- `paid` - Đã thanh toán
- `overdue` - Quá hạn

---

### 5. Get My Requests

**GET** `/api/students/me/requests`

**Description**: Lấy danh sách yêu cầu của học viên hiện tại

**Headers**: Requires authentication (student only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy danh sách yêu cầu thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "type": "leave",
      "title": "Xin nghỉ học ngày 10/11",
      "reason": "Bệnh nặng cần nghỉ ngơi",
      "requestDate": "2025-11-08T00:00:00.000Z",
      "status": "approved",
      "courseName": "TOEIC 600+",
      "className": "TOEIC600-01",
      "response": "Đồng ý cho nghỉ. Chúc bạn mau khỏe!",
      "processedAt": "2025-11-08T10:30:00.000Z",
      "processorName": "Nguyễn Văn C",
      "createdAt": "2025-11-08T08:00:00.000Z"
    }
  ]
}
```

**Request Types**:

- `leave` - Xin nghỉ học
- `makeup` - Xin học bù
- `withdrawal` - Xin rút khóa học
- `certificate` - Xin cấp giấy chứng nhận
- `other` - Khác

**Request Status**:

- `pending` - Chờ xử lý
- `approved` - Đã duyệt
- `rejected` - Từ chối

---

### 6. Create Request

**POST** `/api/students/me/requests`

**Description**: Tạo yêu cầu mới

**Headers**: Requires authentication (student only)

**Request Body**:

```json
{
  "type": "leave",
  "title": "Xin nghỉ học ngày 15/11",
  "reason": "Có việc gia đình quan trọng",
  "requestDate": "2025-11-15",
  "classId": "507f1f77bcf86cd799439014",
  "courseName": "TOEIC 600+"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Gửi yêu cầu thành công",
  "data": {
    "_id": "507f1f77bcf86cd79943901a",
    "type": "leave",
    "title": "Xin nghỉ học ngày 15/11",
    "reason": "Có việc gia đình quan trọng",
    "status": "pending",
    "createdAt": "2025-11-08T14:30:00.000Z"
  }
}
```

---

### 7. Get All Students (Admin)

**GET** `/api/students`

**Description**: Lấy danh sách tất cả học viên (có phân trang và tìm kiếm)

**Headers**: Requires authentication (director, academic, enrollment, accountant)

**Query Parameters**:

- `page` (optional): Trang hiện tại (default: 1)
- `pageSize` (optional): Số học viên mỗi trang (default: 10)
- `search` (optional): Tìm kiếm theo tên, mã học viên, email
- `status` (optional): Lọc theo trạng thái học tập
- `sortBy` (optional): Sắp xếp theo trường (default: createdAt)
- `sortOrder` (optional): asc hoặc desc (default: desc)

**Example**: `GET /api/students?page=1&pageSize=20&search=Nguyễn&status=active&sortBy=fullName&sortOrder=asc`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy danh sách học viên thành công",
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 8. Get Student by ID

**GET** `/api/students/:id`

**Description**: Lấy thông tin chi tiết một học viên

**Headers**: Requires authentication (director, academic, enrollment, accountant, teacher, or self)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy thông tin học viên thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "studentCode": "HV00001",
    "user": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "avatar": "",
      "status": "active"
    },
    "dateOfBirth": "2000-01-15T00:00:00.000Z",
    "gender": "male",
    "address": "12 Lý Thường Kiệt, Q10, TP.HCM",
    "enrolledCourses": [...],
    "attendance": [...],
    "financialRecords": [...]
  }
}
```

---

### 9. Create Student

**POST** `/api/students`

**Description**: Tạo học viên mới

**Headers**: Requires authentication (director, enrollment)

**Request Body**:

```json
{
  "email": "newstudent@gmail.com",
  "password": "123456",
  "fullName": "Lê Thị D",
  "phone": "0901234569",
  "dateOfBirth": "2002-03-10",
  "gender": "female",
  "address": "456 Nguyễn Huệ, Q1, TP.HCM",
  "contactPerson": "Lê Văn E"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Tạo học viên thành công",
  "data": {
    "_id": "507f1f77bcf86cd79943901b",
    "studentCode": "HV00006",
    "user": {...}
  }
}
```

---

### 10. Update Student

**PUT** `/api/students/:id`

**Description**: Cập nhật thông tin học viên

**Headers**: Requires authentication (director, academic, enrollment, accountant)

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn A (Updated)",
  "phone": "0901234567",
  "address": "New address",
  "academicStatus": "active",
  "notes": "Học tập tốt"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Cập nhật học viên thành công",
  "data": {...}
}
```

---

### 11. Delete Student

**DELETE** `/api/students/:id`

**Description**: Xóa học viên

**Headers**: Requires authentication (director only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Xóa học viên thành công",
  "data": null
}
```

---

### 12. Enroll Course

**POST** `/api/students/:id/enroll`

**Description**: Ghi danh học viên vào khóa học

**Headers**: Requires authentication (director, enrollment)

**Request Body**:

```json
{
  "courseId": "507f1f77bcf86cd799439020"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Ghi danh thành công",
  "data": {
    "enrolledCourses": [...]
  }
}
```

---

## 👨‍🏫 Teacher Endpoints

### 1. Get My Classes

**GET** `/api/teachers/me/classes`

**Description**: Lấy danh sách lớp học của giáo viên hiện tại

**Headers**: Requires authentication (teacher only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy danh sách lớp học thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "className": "TOEIC600-01",
      "course": {
        "name": "TOEIC 600+",
        "courseCode": "TOEIC600"
      },
      "schedule": "Thứ 2, 4, 6 - 18:00-20:00",
      "studentCount": 15,
      "capacity": 20,
      "startDate": "2025-01-15",
      "endDate": "2025-04-15",
      "status": "active"
    }
  ]
}
```

---

## 📊 Dashboard Endpoints

### 1. Director Dashboard

**GET** `/api/director/dashboard`

**Description**: Lấy dữ liệu tổng quan cho giám đốc

**Headers**: Requires authentication (director only)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy dữ liệu dashboard thành công",
  "data": {
    "overview": {
      "totalStudents": 150,
      "totalTeachers": 20,
      "totalCourses": 25,
      "totalRevenue": 450000000
    },
    "revenueByMonth": [...],
    "enrollmentTrend": [...],
    "topCourses": [...]
  }
}
```

---

## 🔔 Notification Endpoints

### 1. Get My Notifications

**GET** `/api/notifications/me`

**Description**: Lấy thông báo của user hiện tại

**Headers**: Requires authentication

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy thông báo thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd79943901c",
      "title": "Thông báo học phí",
      "message": "Học phí tháng 11 sẽ đến hạn vào ngày 20/11",
      "type": "finance",
      "isRead": false,
      "createdAt": "2025-11-08T09:00:00.000Z"
    }
  ]
}
```

---

## 📅 Schedule Endpoints

### 1. Get My Schedule

**GET** `/api/schedules/me`

**Description**: Lấy lịch học của user hiện tại

**Headers**: Requires authentication

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lấy lịch học thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd79943901d",
      "class": {
        "className": "TOEIC600-01",
        "course": "TOEIC 600+"
      },
      "dayOfWeek": 2,
      "startTime": "18:00",
      "endTime": "20:00",
      "room": "A101"
    }
  ]
}
```

---

## ❌ Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Vui lòng điền đầy đủ thông tin bắt buộc"
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Không có quyền truy cập. Vui lòng đăng nhập."
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Role student không có quyền truy cập."
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Không tìm thấy học viên"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Lỗi server. Vui lòng thử lại sau!"
}
```

---

## 📝 Notes

### Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "pagination": { // Only for paginated endpoints
    "page": number,
    "pageSize": number,
    "total": number,
    "totalPages": number
  }
}
```

### Date Format

All dates are in ISO 8601 format: `2025-11-08T14:30:00.000Z`

### Currency

All monetary amounts are in VND (Vietnamese Dong)

### Pagination

Default pagination:

- `page`: 1
- `pageSize`: 10
- Maximum `pageSize`: 100

---

**Last Updated**: November 8, 2025  
**API Version**: 1.0.0
