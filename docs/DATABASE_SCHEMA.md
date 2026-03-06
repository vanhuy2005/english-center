# 📊 DATABASE SCHEMA - English Center Management System

> **Tự động xuất từ MongoDB database**
>
> **Database:** `test`
>
> **Ngày xuất:** 07:03:24 6/3/2026
>
> **MongoDB URI:** `***.***.mongodb.net`

---

## 📋 Tổng Quan Collections

| # | Collection | Model | Số Documents | Dung Lượng | Indexes |
|---|-----------|-------|-------------|------------|----------|
| 1 | `students` | Student | 30 | 14.84 KB | 7 |
| 2 | `staffs` | Staff | 18 | 13.52 KB | 6 |
| 3 | `courses` | Course | 8 | 3.26 KB | 4 |
| 4 | `classes` | Class | 15 | 9.51 KB | 5 |
| 5 | `attendances` | Attendance | 1648 | 276.48 KB | 4 |
| 6 | `grades` | Grade | 234 | 141.79 KB | 5 |
| 7 | `finances` | Finance | 241 | 78.38 KB | 6 |
| 8 | `payments` | Payment | 3 | 1008 B | 2 |
| 9 | `receipts` | Receipt | 139 | 42.64 KB | 2 |
| 10 | `tuitionfees` | TuitionFee | 16 | 4.03 KB | 2 |
| 11 | `notifications` | Notification | 291 | 105.1 KB | 4 |
| 12 | `requests` | Request | 34 | 11.18 KB | 5 |
| 13 | `schedules` | Schedule | 62 | 17.21 KB | 6 |
| 14 | `counters` | Counter | 14 | 673 B | 1 |

### ⚠️ Collections không có Model (Legacy/Orphaned)

| Collection | Số Documents |
|-----------|-------------|
| `enrollmentrequests` | 8 |
| `consultationrequests` | 3 |
| `placementtests` | 1 |

---

## 📑 Chi Tiết Schema Từng Collection

### 👨‍🎓 Student (`students`)

- **Documents:** 30
- **Dung lượng:** 14.84 KB
- **Kích thước trung bình/doc:** 506 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `email` | String | - | ✅ | - | - | - |
| `password` *(hidden)* | String | ✅ | - | `"123456"` | - | - |
| `fullName` | String | ✅ | - | - | - | - |
| `phone` | String | ✅ | ✅ | - | - | - |
| `avatar` | String | - | - | `""` | - | - |
| `status` | String | - | - | `"active"` | `active`, `inactive`, `suspended` | - |
| `isFirstLogin` | Boolean | - | - | `true` | - | - |
| `refreshToken` *(hidden)* | String | - | - | - | - | - |
| `studentCode` | String | - | ✅ | - | - | - |
| `dateOfBirth` | Date | - | - | - | - | - |
| `gender` | String | - | - | - | `male`, `female`, `other` | - |
| `address` | String | - | - | - | - | - |
| `contactInfo.phone` | String | - | - | - | - | - |
| `contactInfo.email` | String | - | - | - | - | - |
| `contactPerson.name` | String | - | - | - | - | - |
| `contactPerson.relation` | String | - | - | - | - | - |
| `contactPerson.phone` | String | - | - | - | - | - |
| `contactPerson.email` | String | - | - | - | - | - |
| `enrolledCourses` | Array | - | - | - | - | - |
| `enrollmentDate` | Date | - | - | `Date.now` | - | - |
| `attendance` | Array | - | - | - | - | - |
| `financialRecords` | Array | - | - | - | - | - |
| `academicStatus` | String | - | - | `"inactive"` | `active`, `inactive`, `paused`, `on-leave`, `completed`, `dropped` | - |
| `notes` | String | - | - | `""` | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `academicStatus_1` | academicStatus: 1 | - | - |
| `enrollmentDate_1` | enrollmentDate: 1 | - | - |
| `email_1` | email: 1 | ✅ | ✅ |
| `fullName_1` | fullName: 1 | - | - |
| `phone_1` | phone: 1 | ✅ | - |
| `studentCode_1` | studentCode: 1 | ✅ | ✅ |

#### Giá Trị Thực Tế Trong DB

- **status:** `active`
- **gender:** `female`, `male`
- **academicStatus:** `active`, `inactive`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "694d3e3273f683fa0bb1a17b",
  "email": "student1@example.com",
  "fullName": "Nguyễn Văn An",
  "phone": "0987654321",
  "avatar": "",
  "status": "active",
  "isFirstLogin": false,
  "dateOfBirth": "2000-11-14T17:00:00.000Z",
  "gender": "male",
  "address": "1 Đường ABC, Quận 1, TP.HCM",
  "enrolledCourses": [
    "694d3e3173f683fa0bb1a124"
  ],
  "attendance": [],
  "financialRecords": [],
  "academicStatus": "active",
  "notes": "",
  "enrollmentDate": "2025-12-25T13:37:54.045Z",
  "createdAt": "2025-12-25T13:37:54.046Z",
  "updatedAt": "2025-12-25T13:37:59.721Z",
  "studentCode": "HV00307",
  "__v": 1
}
```

---

### 👨‍💼 Staff (`staffs`)

- **Documents:** 18
- **Dung lượng:** 13.52 KB
- **Kích thước trung bình/doc:** 769 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `email` | String | - | ✅ | - | - | - |
| `password` *(hidden)* | String | ✅ | - | `"123456"` | - | - |
| `fullName` | String | ✅ | - | - | - | - |
| `phone` | String | ✅ | ✅ | - | - | - |
| `avatar` | String | - | - | `""` | - | - |
| `status` | String | - | - | `"active"` | `active`, `inactive`, `suspended` | - |
| `isFirstLogin` | Boolean | - | - | `true` | - | - |
| `refreshToken` *(hidden)* | String | - | - | - | - | - |
| `staffCode` | String | ✅ | ✅ | - | - | - |
| `staffType` | String | ✅ | - | - | `academic`, `accountant`, `enrollment`, `director`, `teacher` | - |
| `dateOfBirth` | Date | - | - | - | - | - |
| `gender` | String | - | - | - | `male`, `female`, `other` | - |
| `address` | String | - | - | - | - | - |
| `employmentStatus` | String | - | - | `"active"` | `active`, `on_leave`, `resigned` | - |
| `dateJoined` | Date | - | - | `Date.now` | - | - |
| `dateLeft` | Date | - | - | - | - | - |
| `department` | String | - | - | - | - | - |
| `position` | String | - | - | - | - | - |
| `responsibilities` | Array | - | - | `[]` | - | - |
| `managedClasses` | Array | - | - | - | - | - |
| `teachingClasses` | Array | - | - | - | - | - |
| `specialization` | Array | - | - | `[]` | - | - |
| `qualifications` | Array | - | - | - | - | - |
| `experience.years` | Number | - | - | - | - | - |
| `experience.description` | String | - | - | - | - | - |
| `accessLevel` | String | - | - | - | `standard`, `senior`, `manager` | - |
| `performanceMetrics.totalRequestsProcessed` | Number | - | - | - | - | - |
| `performanceMetrics.thisMonthRequests` | Number | - | - | - | - | - |
| `performanceMetrics.averageResponseTime` | Number | - | - | - | - | - |
| `performanceMetrics.totalTransactions` | Number | - | - | - | - | - |
| `performanceMetrics.thisMonthTransactions` | Number | - | - | - | - | - |
| `performanceMetrics.totalAmountProcessed` | Number | - | - | - | - | - |
| `performanceMetrics.totalEnrollments` | Number | - | - | - | - | - |
| `performanceMetrics.thisMonthEnrollments` | Number | - | - | - | - | - |
| `performanceMetrics.conversionRate` | Number | - | - | - | - | - |
| `performanceMetrics.totalClassesTaught` | Number | - | - | - | - | - |
| `performanceMetrics.totalStudentsTaught` | Number | - | - | - | - | - |
| `performanceMetrics.averageRating` | Number | - | - | - | - | - |
| `performanceMetrics.attendanceRate` | Number | - | - | - | - | - |
| `notes` | String | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `staffCode_1` | staffCode: 1 | ✅ | - |
| `staffType_1` | staffType: 1 | - | - |
| `employmentStatus_1` | employmentStatus: 1 | - | - |
| `email_1` | email: 1 | ✅ | ✅ |
| `phone_1` | phone: 1 | ✅ | - |

#### Giá Trị Thực Tế Trong DB

- **status:** `active`
- **staffType:** `academic`, `accountant`, `director`, `enrollment`, `teacher`
- **gender:** `female`, `male`
- **employmentStatus:** `active`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "6927449a6de5cdebe530f7bc",
  "email": "director@englishhub.vn",
  "fullName": "Nguyễn Văn Director",
  "phone": "0901000001",
  "avatar": "/uploads/avatars/f76403bc98c246ee183b03c015a7c74b",
  "status": "active",
  "isFirstLogin": false,
  "staffCode": "GD001",
  "staffType": "director",
  "dateOfBirth": "1980-01-15T00:00:00.000Z",
  "gender": "male",
  "address": "123 Lê Lợi, Quận 1, TP.HCM",
  "employmentStatus": "active",
  "department": "Quản lý",
  "position": "Giám đốc",
  "responsibilities": [],
  "managedClasses": [],
  "teachingClasses": [],
  "specialization": [],
  "dateJoined": "2025-11-26T18:19:06.456Z",
  "qualifications": [],
  "createdAt": "2025-11-26T18:19:06.460Z",
  "updatedAt": "2026-03-05T15:58:25.022Z",
  "__v": 0
}
```

---

### 📚 Course (`courses`)

- **Documents:** 8
- **Dung lượng:** 3.26 KB
- **Kích thước trung bình/doc:** 417 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `courseCode` | String | - | ✅ | - | - | - |
| `name` | String | ✅ | - | - | - | - |
| `description` | String | - | - | - | - | - |
| `level` | String | ✅ | - | - | `beginner`, `elementary`, `pre-intermediate`, `intermediate`, `upper-intermediate`, `advanced` | - |
| `duration.hours` | Number | ✅ | - | - | - | - |
| `duration.weeks` | Number | ✅ | - | - | - | - |
| `schedule.daysPerWeek` | Number | - | - | - | - | - |
| `schedule.hoursPerDay` | Number | - | - | - | - | - |
| `fee.amount` | Number | ✅ | - | - | - | - |
| `fee.currency` | String | - | - | `"VND"` | - | - |
| `capacity.min` | Number | - | - | `5` | - | - |
| `capacity.max` | Number | - | - | `20` | - | - |
| `classes` | Array | - | - | - | - | - |
| `materials` | Array | - | - | - | - | - |
| `prerequisites` | Array | - | - | - | - | - |
| `status` | String | - | - | `"active"` | `active`, `inactive`, `upcoming`, `archived` | - |
| `startDate` | Date | - | - | - | - | - |
| `endDate` | Date | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `courseCode_1` | courseCode: 1 | ✅ | - |
| `level_1_status_1` | level: 1, status: 1 | - | - |
| `name_text_description_text` | _fts: text, _ftsx: 1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **level:** `advanced`, `beginner`, `elementary`, `intermediate`, `pre-intermediate`, `upper-intermediate`
- **status:** `active`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "694d3e3173f683fa0bb1a124",
  "courseCode": "ENG-A1",
  "name": "English A1 - Beginner",
  "description": "Khóa học tiếng Anh sơ cấp dành cho người mới bắt đầu",
  "level": "beginner",
  "duration": {
    "hours": 60,
    "weeks": 12
  },
  "schedule": {
    "daysPerWeek": 3,
    "hoursPerDay": 2
  },
  "fee": {
    "amount": 3500000,
    "currency": "VND"
  },
  "capacity": {
    "min": 8,
    "max": 25
  },
  "classes": [],
  "prerequisites": [],
  "status": "active",
  "materials": [],
  "createdAt": "2025-12-25T13:37:53.166Z",
  "updatedAt": "2025-12-25T13:37:53.166Z",
  "__v": 0
}
```

---

### 🏫 Class (`classes`)

- **Documents:** 15
- **Dung lượng:** 9.51 KB
- **Kích thước trung bình/doc:** 649 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `classCode` | String | - | ✅ | - | - | - |
| `name` | String | ✅ | - | - | - | - |
| `course` | ObjectId | ✅ | - | - | - | `Course` |
| `teacher` | ObjectId | - | - | - | - | `Staff` |
| `students` | Array | - | - | - | - | - |
| `capacity.max` | Number | ✅ | - | `20` | - | - |
| `capacity.current` | Number | - | - | `0` | - | - |
| `room` | String | - | - | - | - | - |
| `schedule` | Array | - | - | - | - | - |
| `startDate` | Date | ✅ | - | - | - | - |
| `endDate` | Date | ✅ | - | - | - | - |
| `status` | String | - | - | `"upcoming"` | `upcoming`, `ongoing`, `completed`, `cancelled` | - |
| `materials` | Array | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `teacher_1_status_1` | teacher: 1, status: 1 | - | - |
| `startDate_1_endDate_1` | startDate: 1, endDate: 1 | - | - |
| `classCode_1` | classCode: 1 | ✅ | ✅ |
| `course_1_status_1` | course: 1, status: 1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **status:** `ongoing`, `upcoming`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "694d3e3173f683fa0bb1a13c",
  "classCode": "ENG-A1-01",
  "name": "English A1 - Beginner - Lớp 01",
  "course": "694d3e3173f683fa0bb1a124",
  "teacher": "6927449a6de5cdebe530f7c4",
  "capacity": {
    "max": 25,
    "current": 2
  },
  "room": "Room 100",
  "schedule": [
    {
      "dayOfWeek": 1,
      "startTime": "18:00",
      "endTime": "20:00",
      "_id": "694d3e3173f683fa0bb1a13d"
    },
    {
      "dayOfWeek": 3,
      "startTime": "18:00",
      "endTime": "20:00",
      "_id": "694d3e3173f683fa0bb1a13e"
    },
    {
      "dayOfWeek": 5,
      "startTime": "18:00",
      "endTime": "20:00",
      "_id": "694d3e3173f683fa0bb1a13f"
    }
  ],
  "startDate": "2025-11-25T13:37:53.376Z",
  "endDate": "2026-02-17T13:37:53.376Z",
  "status": "ongoing",
  "students": [
    {
      "student": "694d3e3273f683fa0bb1a17b",
      "enrolledDate": "2025-11-05T04:16:46.118Z",
      "status": "active",
      "_id": "694d3e3773f683fa0bb1a1c6"
    },
    {
      "student": "694d3e3473f683fa0bb1a19f",
      "enrolledDate": "2025-11-30T00:11:56.652Z",
      "status": "active",
      "_id": "694d3e3873f683fa0bb1a1ea"
    }
  ],
  "materials": [],
  "createdAt": "2025-12-25T13:37:53.381Z",
  "updatedAt": "2025-12-25T13:38:00.847Z",
  "__v": 2
}
```

---

### 📋 Attendance (`attendances`)

- **Documents:** 1648
- **Dung lượng:** 276.48 KB
- **Kích thước trung bình/doc:** 171 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `class` | ObjectId | ✅ | - | - | - | `Class` |
| `date` | Date | ✅ | - | `Date.now` | - | - |
| `status` | String | ✅ | - | `"present"` | `present`, `absent`, `late`, `excused` | - |
| `checkInTime` | Date | - | - | - | - | - |
| `checkOutTime` | Date | - | - | - | - | - |
| `note` | String | - | - | - | - | - |
| `reason` | String | - | - | - | - | - |
| `recordedBy` | ObjectId | - | - | - | - | `User` |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `student_1_class_1_date_1` | student: 1, class: 1, date: 1 | ✅ | - |
| `class_1_date_-1` | class: 1, date: -1 | - | - |
| `student_1_date_-1` | student: 1, date: -1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **status:** `absent`, `excused`, `late`, `present`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "692744a36de5cdebe530f8f4",
  "student": "6927449e6de5cdebe530f84d",
  "class": "6927449b6de5cdebe530f7d2",
  "date": "2025-09-30T17:00:00.000Z",
  "status": "late",
  "checkInTime": "2025-09-30T18:34:07.380Z",
  "note": "",
  "recordedBy": "6927449a6de5cdebe530f7c4",
  "createdAt": "2025-11-26T18:19:15.829Z",
  "updatedAt": "2025-11-26T18:19:15.829Z",
  "__v": 0
}
```

---

### 📝 Grade (`grades`)

- **Documents:** 234
- **Dung lượng:** 141.79 KB
- **Kích thước trung bình/doc:** 620 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `class` | ObjectId | ✅ | - | - | - | `Class` |
| `course` | ObjectId | ✅ | - | - | - | `Course` |
| `scores.attendance` | Number | - | - | - | - | - |
| `scores.participation` | Number | - | - | - | - | - |
| `scores.homework` | Number | - | - | - | - | - |
| `scores.midterm` | Number | - | - | - | - | - |
| `scores.final` | Number | - | - | - | - | - |
| `scores.listening` | Number | - | - | - | - | - |
| `scores.speaking` | Number | - | - | - | - | - |
| `scores.reading` | Number | - | - | - | - | - |
| `scores.writing` | Number | - | - | - | - | - |
| `weights.attendance` | Number | - | - | `10` | - | - |
| `weights.participation` | Number | - | - | `10` | - | - |
| `weights.homework` | Number | - | - | `10` | - | - |
| `weights.midterm` | Number | - | - | `30` | - | - |
| `weights.final` | Number | - | - | `40` | - | - |
| `totalScore` | Number | - | - | - | - | - |
| `letterGrade` | String | - | - | - | `A+`, `A`, `B+`, `B`, `C+`, `C`, `D+`, `D`, `F` | - |
| `status` | String | - | - | `"in_progress"` | `in_progress`, `completed`, `failed` | - |
| `teacherComment` | String | - | - | - | - | - |
| `strengths` | Array | - | - | - | - | - |
| `weaknesses` | Array | - | - | - | - | - |
| `recommendations` | Array | - | - | - | - | - |
| `gradedBy` | ObjectId | - | - | - | - | `Staff` |
| `gradedDate` | Date | - | - | - | - | - |
| `isPublished` | Boolean | - | - | `false` | - | - |
| `publishedDate` | Date | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `course_1_status_1` | course: 1, status: 1 | - | - |
| `student_1_class_1_course_1` | student: 1, class: 1, course: 1 | ✅ | - |
| `student_1_isPublished_1` | student: 1, isPublished: 1 | - | - |
| `class_1_isPublished_1` | class: 1, isPublished: 1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **letterGrade:** `A`, `A+`, `B`, `B+`, `C`, `D`, `D+`, `F`
- **status:** `completed`, `in_progress`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "694cd6d7fe9d300e6b6c564b",
  "student": "694ca6474883f956f2947196",
  "class": "694a61b185c07ee3c54d6fe9",
  "course": "694bca3266850f5c1cf6d2c2",
  "scores": {
    "attendance": 4.5,
    "participation": 3.8,
    "homework": 4.2,
    "midterm": 4,
    "final": 4.5,
    "listening": 4,
    "speaking": 3.9,
    "reading": 4.3,
    "writing": 4.1
  },
  "weights": {
    "attendance": 10,
    "participation": 10,
    "homework": 10,
    "midterm": 30,
    "final": 40
  },
  "status": "in_progress",
  "teacherComment": "Cần cố gắng thêm.",
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "gradedDate": "2025-12-25T06:16:55.038Z",
  "isPublished": true,
  "publishedDate": "2025-12-25T06:16:55.038Z",
  "createdAt": "2025-12-25T06:16:55.103Z",
  "updatedAt": "2025-12-25T06:16:55.103Z",
  "totalScore": 4.3,
  "letterGrade": "F",
  "__v": 0
}
```

---

### 💰 Finance (`finances`)

- **Documents:** 241
- **Dung lượng:** 78.38 KB
- **Kích thước trung bình/doc:** 333 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `transactionCode` | String | - | ✅ | - | - | - |
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `course` | ObjectId | ✅ | - | - | - | `Course` |
| `type` | String | ✅ | - | - | `tuition`, `registration`, `material`, `exam`, `refund`, `other` | - |
| `amount` | Number | ✅ | - | - | - | - |
| `paymentMethod` | String | ✅ | - | - | `cash`, `bank_transfer`, `credit_card`, `momo`, `other` | - |
| `status` | String | - | - | `"pending"` | `pending`, `paid`, `partial`, `overdue`, `refunded`, `cancelled` | - |
| `paidAmount` | Number | - | - | `0` | - | - |
| `remainingAmount` | Number | - | - | `0` | - | - |
| `dueDate` | Date | - | - | - | - | - |
| `paidDate` | Date | - | - | - | - | - |
| `receipt.number` | String | - | - | - | - | - |
| `receipt.url` | String | - | - | - | - | - |
| `receipt.issuedBy` | ObjectId | - | - | - | - | `User` |
| `receipt.issuedAt` | Date | - | - | - | - | - |
| `description` | String | - | - | - | - | - |
| `notes` | String | - | - | - | - | - |
| `createdBy` | ObjectId | ✅ | - | - | - | `Staff` |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `student_1_status_1` | student: 1, status: 1 | - | - |
| `course_1` | course: 1 | - | - |
| `paidDate_1` | paidDate: 1 | - | - |
| `dueDate_1_status_1` | dueDate: 1, status: 1 | - | - |
| `transactionCode_1` | transactionCode: 1 | ✅ | ✅ |

#### Giá Trị Thực Tế Trong DB

- **type:** `exam`, `material`, `refund`, `registration`, `tuition`
- **paymentMethod:** `bank_transfer`, `cash`, `credit_card`, `momo`, `other`
- **status:** `overdue`, `paid`, `partial`, `pending`, `refunded`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "6927449e6de5cdebe530f842",
  "student": "6927449e6de5cdebe530f83c",
  "course": "6927449b6de5cdebe530f7cc",
  "type": "tuition",
  "amount": 5000000,
  "paymentMethod": "bank_transfer",
  "status": "paid",
  "paidAmount": 5000000,
  "remainingAmount": 0,
  "paidDate": "2025-09-30T18:19:07.380Z",
  "receipt": {
    "number": "RCP2025110001",
    "issuedBy": "6927449a6de5cdebe530f7c0",
    "issuedAt": "2025-09-30T18:19:07.380Z"
  },
  "description": "Học phí khóa IELTS Foundation - Nguyễn Văn Student 1",
  "createdBy": "6927449a6de5cdebe530f7c2",
  "createdAt": "2025-11-26T18:19:10.502Z",
  "updatedAt": "2025-11-26T18:19:10.502Z",
  "transactionCode": "TXN20251100001",
  "__v": 0
}
```

---

### 💳 Payment (`payments`)

- **Documents:** 3
- **Dung lượng:** 1008 B
- **Kích thước trung bình/doc:** 336 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `paymentCode` | String | - | ✅ | - | - | - |
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `class` | ObjectId | - | - | - | - | `Class` |
| `amount` | Number | ✅ | - | - | - | - |
| `paymentMethod` | String | ✅ | - | - | `cash`, `bank_transfer`, `credit_card`, `momo`, `other` | - |
| `status` | String | - | - | `"pending"` | `pending`, `confirmed`, `cancelled` | - |
| `description` | String | - | - | - | - | - |
| `note` | String | - | - | - | - | - |
| `confirmedBy` | ObjectId | - | - | - | - | `User` |
| `confirmedAt` | Date | - | - | - | - | - |
| `createdBy` | ObjectId | ✅ | - | - | - | `User` |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `paymentCode_1` | paymentCode: 1 | ✅ | ✅ |

#### Giá Trị Thực Tế Trong DB

- **paymentMethod:** `bank_transfer`
- **status:** `confirmed`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "694a121925a226276cfc7db8",
  "student": "694a121025a226276cfc7cda",
  "class": "694a121025a226276cfc7ce2",
  "amount": 3500000,
  "paymentMethod": "bank_transfer",
  "status": "confirmed",
  "description": "Thanh toán học phí",
  "confirmedBy": "6927449a6de5cdebe530f7c4",
  "confirmedAt": "2025-12-23T03:52:57.981Z",
  "createdBy": "694a121025a226276cfc7cda",
  "createdAt": "2025-12-23T03:52:57.981Z",
  "updatedAt": "2025-12-23T03:52:57.981Z",
  "paymentCode": "PAY2025120001",
  "__v": 0
}
```

---

### 🧾 Receipt (`receipts`)

- **Documents:** 139
- **Dung lượng:** 42.64 KB
- **Kích thước trung bình/doc:** 314 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `receiptNumber` | String | - | ✅ | - | - | - |
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `class` | ObjectId | - | - | - | - | `Class` |
| `amount` | Number | ✅ | - | - | - | - |
| `paymentMethod` | String | ✅ | - | - | `cash`, `bank_transfer`, `credit_card`, `momo`, `refund`, `other` | - |
| `type` | String | - | - | `"tuition"` | `tuition`, `refund`, `other` | - |
| `status` | String | - | - | `"active"` | `active`, `refunded`, `cancelled` | - |
| `description` | String | - | - | - | - | - |
| `note` | String | - | - | - | - | - |
| `createdBy` | ObjectId | ✅ | - | - | - | `Staff` |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `receiptNumber_1` | receiptNumber: 1 | ✅ | - |

#### Giá Trị Thực Tế Trong DB

- **paymentMethod:** `bank_transfer`, `cash`, `credit_card`, `momo`, `other`
- **type:** `refund`, `tuition`
- **status:** `active`, `refunded`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "692744aa6de5cdebe530f9ee",
  "receiptNumber": "RCP2025110001",
  "student": "6927449e6de5cdebe530f83c",
  "class": "6927449b6de5cdebe530f7d2",
  "amount": 5000000,
  "paymentMethod": "bank_transfer",
  "description": "Biên lai học phí khóa IELTS Foundation - Lớp IELTS-F-01",
  "note": "Đã thanh toán đầy đủ",
  "status": "active",
  "createdBy": "6927449a6de5cdebe530f7c0",
  "createdAt": "2025-11-26T18:19:22.767Z",
  "updatedAt": "2025-11-26T18:19:22.767Z",
  "__v": 0
}
```

---

### 💵 TuitionFee (`tuitionfees`)

- **Documents:** 16
- **Dung lượng:** 4.03 KB
- **Kích thước trung bình/doc:** 257 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `tuitionCode` | String | - | ✅ | - | - | - |
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `class` | ObjectId | ✅ | - | - | - | `Class` |
| `amount` | Number | ✅ | - | - | - | - |
| `paidAmount` | Number | - | - | `0` | - | - |
| `remainingAmount` | Number | - | - | `0` | - | - |
| `dueDate` | Date | ✅ | - | - | - | - |
| `status` | String | - | - | `"unpaid"` | `unpaid`, `partial`, `paid` | - |
| `paymentMethod` | String | - | - | - | `cash`, `bank_transfer`, `credit_card`, `momo`, `other` | - |
| `note` | String | - | - | - | - | - |
| `updatedBy` | ObjectId | - | - | - | - | `User` |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `tuitionCode_1` | tuitionCode: 1 | ✅ | ✅ |

#### Giá Trị Thực Tế Trong DB

- **status:** `paid`, `partial`, `unpaid`
- **paymentMethod:** `bank_transfer`, `cash`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "6927449e6de5cdebe530f850",
  "student": "6927449e6de5cdebe530f84d",
  "class": "6927449b6de5cdebe530f7d2",
  "amount": 5000000,
  "paidAmount": 5000000,
  "remainingAmount": 0,
  "dueDate": "2025-09-30T18:19:07.380Z",
  "status": "paid",
  "paymentMethod": "bank_transfer",
  "createdAt": "2025-11-26T18:19:10.972Z",
  "updatedAt": "2025-11-26T18:19:10.972Z",
  "tuitionCode": "TF2025110002",
  "__v": 0
}
```

---

### 🔔 Notification (`notifications`)

- **Documents:** 291
- **Dung lượng:** 105.1 KB
- **Kích thước trung bình/doc:** 369 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `recipient` | ObjectId | ✅ | - | - | - | `User` |
| `sender` | ObjectId | - | - | - | - | `User` |
| `type` | String | ✅ | - | - | `announcement`, `request_response`, `payment_reminder`, `grade_published`, `class_schedule`, `attendance_alert`, `system` | - |
| `title` | String | ✅ | - | - | - | - |
| `message` | String | ✅ | - | - | - | - |
| `link` | String | - | - | - | - | - |
| `relatedModel` | String | - | - | - | - | - |
| `relatedId` | ObjectId | - | - | - | - | - |
| `priority` | String | - | - | `"normal"` | `low`, `normal`, `high`, `urgent` | - |
| `isRead` | Boolean | - | - | `false` | - | - |
| `readAt` | Date | - | - | - | - | - |
| `expiresAt` | Date | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `recipient_1_isRead_1_createdAt_-1` | recipient: 1, isRead: 1, createdAt: -1 | - | - |
| `recipient_1_type_1` | recipient: 1, type: 1 | - | - |
| `expiresAt_1` | expiresAt: 1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **type:** `announcement`, `attendance_alert`, `class_schedule`, `grade_published`, `payment_reminder`, `request_response`, `system`
- **priority:** `high`, `low`, `normal`, `urgent`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "692744aa6de5cdebe530f9e2",
  "recipient": "6927449a6de5cdebe530f7c4",
  "recipientModel": "Staff",
  "type": "class_schedule",
  "title": "Nhắc nhở lịch dạy hôm nay",
  "message": "Bạn có lớp IELTS-F-01 vào tối nay lúc 19:00 tại Room 301",
  "priority": "high",
  "isRead": true,
  "readAt": "2025-11-26T18:19:22.576Z",
  "createdAt": "2025-11-26T18:19:22.577Z",
  "updatedAt": "2025-11-26T18:19:22.577Z",
  "__v": 0
}
```

---

### 📩 Request (`requests`)

- **Documents:** 34
- **Dung lượng:** 11.18 KB
- **Kích thước trung bình/doc:** 336 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `requestCode` | String | - | ✅ | - | - | - |
| `student` | ObjectId | ✅ | - | - | - | `Student` |
| `type` | String | ✅ | - | - | `leave`, `makeup`, `transfer`, `pause`, `resume`, `withdrawal`, `course_enrollment`, `consultation`, `reserve`, `other` | - |
| `title` | String | - | - | - | - | - |
| `content` | String | - | - | - | - | - |
| `course` | ObjectId | - | - | - | - | `Course` |
| `class` | ObjectId | - | - | - | - | `Class` |
| `targetClass` | ObjectId | - | - | - | - | `Class` |
| `assignedToClass` | ObjectId | - | - | - | - | `Class` |
| `startDate` | Date | - | - | - | - | - |
| `endDate` | Date | - | - | - | - | - |
| `reason` | String | - | - | - | - | - |
| `contactPhone` | String | - | - | - | - | - |
| `preferredDate` | Date | - | - | - | - | - |
| `additionalNote` | String | - | - | - | - | - |
| `documents` | Array | - | - | - | - | - |
| `status` | String | - | - | `"pending"` | `pending`, `approved`, `rejected`, `cancelled` | - |
| `priority` | String | - | - | `"normal"` | `low`, `normal`, `high`, `urgent` | - |
| `processedBy` | ObjectId | - | - | - | - | `Staff` |
| `approvedDate` | Date | - | - | - | - | - |
| `rejectionReason` | String | - | - | - | - | - |
| `responseNote` | String | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `requestCode_1` | requestCode: 1 | ✅ | - |
| `student_1_status_1` | student: 1, status: 1 | - | - |
| `status_1_createdAt_-1` | status: 1, createdAt: -1 | - | - |
| `type_1_status_1` | type: 1, status: 1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **type:** `consultation`, `course_enrollment`, `leave`, `makeup`, `pause`, `resume`, `transfer`, `withdrawal`
- **status:** `approved`, `pending`, `rejected`
- **priority:** `high`, `normal`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "692744aa6de5cdebe530f9ca",
  "student": "6927449e6de5cdebe530f84d",
  "type": "makeup",
  "class": "6927449b6de5cdebe530f7d2",
  "startDate": "2025-10-12T18:19:07.380Z",
  "missedDate": "2025-10-12T18:19:07.380Z",
  "reason": "Missed session due to medical appointment",
  "status": "approved",
  "priority": "normal",
  "processedBy": "6927449a6de5cdebe530f7be",
  "documents": [],
  "createdAt": "2025-11-26T18:19:22.115Z",
  "updatedAt": "2025-11-26T18:19:22.115Z",
  "requestCode": "REQ20251100002",
  "approvedDate": "2025-11-26T18:19:22.170Z",
  "__v": 0
}
```

---

### 📅 Schedule (`schedules`)

- **Documents:** 62
- **Dung lượng:** 17.21 KB
- **Kích thước trung bình/doc:** 284 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `class` | ObjectId | - | - | - | - | `Class` |
| `teacher` | ObjectId | - | - | - | - | `Staff` |
| `student` | ObjectId | - | - | - | - | `Student` |
| `date` | Date | ✅ | - | - | - | - |
| `startTime` | String | ✅ | - | - | - | - |
| `endTime` | String | ✅ | - | - | - | - |
| `room` | String | - | - | - | - | - |
| `topic` | String | - | - | - | - | - |
| `description` | String | - | - | - | - | - |
| `status` | String | - | - | `"scheduled"` | `scheduled`, `ongoing`, `completed`, `cancelled`, `postponed` | - |
| `actualStartTime` | Date | - | - | - | - | - |
| `actualEndTime` | Date | - | - | - | - | - |
| `materials` | Array | - | - | - | - | - |
| `homework.title` | String | - | - | - | - | - |
| `homework.description` | String | - | - | - | - | - |
| `homework.dueDate` | Date | - | - | - | - | - |
| `homework.attachments` | Array | - | - | - | - | - |
| `notes` | String | - | - | - | - | - |
| `cancelReason` | String | - | - | - | - | - |
| `_id` | ObjectId | - | - | - | - | - |
| `createdAt` | Date | - | - | - | - | - |
| `updatedAt` | Date | - | - | - | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |
| `class_1_date_1` | class: 1, date: 1 | - | - |
| `teacher_1_date_1` | teacher: 1, date: 1 | - | - |
| `date_1_status_1` | date: 1, status: 1 | - | - |
| `room_1_date_1_startTime_1` | room: 1, date: 1, startTime: 1 | - | - |
| `student_1_date_1` | student: 1, date: 1 | - | - |

#### Giá Trị Thực Tế Trong DB

- **status:** `completed`, `scheduled`

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "6927449b6de5cdebe530f7d7",
  "class": "6927449b6de5cdebe530f7d2",
  "teacher": "6927449a6de5cdebe530f7c4",
  "date": "2025-09-30T18:19:07.380Z",
  "startTime": "19:00",
  "endTime": "21:00",
  "room": "Room 301",
  "topic": "Session 1: IELTS Reading",
  "status": "completed",
  "homework": {
    "attachments": []
  },
  "materials": [],
  "createdAt": "2025-11-26T18:19:07.444Z",
  "updatedAt": "2025-11-26T18:19:07.444Z",
  "__v": 0
}
```

---

### 🔢 Counter (`counters`)

- **Documents:** 14
- **Dung lượng:** 673 B
- **Kích thước trung bình/doc:** 48 B

#### Schema Fields

| Field | Type | Required | Unique | Default | Enum Values | Ref |
|-------|------|----------|--------|---------|-------------|-----|
| `_id` | String | ✅ | - | - | - | - |
| `seq` | Number | - | - | `0` | - | - |

#### Indexes

| Tên Index | Fields | Unique | Sparse |
|-----------|--------|--------|--------|
| `_id_` | _id: 1 | - | - |

#### Mẫu Dữ Liệu (1 Document)

```json
{
  "_id": "student",
  "__v": 0,
  "seq": 336
}
```

---

## 🔗 Quan Hệ Giữa Các Collections

```
Student ──┬── enrolledCourses ──────> Course
          ├── attendance ────────────> Attendance
          └── financialRecords ──────> Finance

Class ────┬── course ───────────────> Course
          ├── teacher ──────────────> Staff
          └── students[].student ───> Student

Grade ────┬── student ──────────────> Student
          ├── class ────────────────> Class
          ├── course ───────────────> Course
          └── gradedBy ─────────────> Staff

Attendance ┬── student ─────────────> Student
           └── class ───────────────> Class

Finance ──┬── student ──────────────> Student
          ├── course ───────────────> Course
          └── createdBy ────────────> Staff

Payment ──┬── student ──────────────> Student
          └── class ────────────────> Class

Receipt ──┬── student ──────────────> Student
          ├── class ────────────────> Class
          └── createdBy ────────────> Staff

TuitionFee ┬── student ─────────────> Student
           └── class ───────────────> Class

Request ──┬── student ──────────────> Student
          ├── course ───────────────> Course
          ├── class ────────────────> Class
          ├── targetClass ──────────> Class
          ├── assignedToClass ──────> Class
          └── processedBy ──────────> Staff

Schedule ─┬── class ────────────────> Class
          ├── teacher ──────────────> Staff
          └── student ──────────────> Student

Notification ┬── recipient ─────────> User (Student/Staff)
             └── sender ────────────> User (Student/Staff)

Staff ────┬── managedClasses ───────> Class
          └── teachingClasses ──────> Class

Course ───── classes ───────────────> Class
```

## 🔢 Mã Tự Động (Counter)

| Đối Tượng | Format | Ví Dụ |
|-----------|--------|-------|
| Student | `HV{00000}` | HV00001, HV00088 |
| Course | `COURSE{0000}` | COURSE0001 |
| Class | `CLS{N}` | CLS1, CLS15 |
| Request | `REQ{YYYYMM}{0000}` | REQ2025110001 |
| Finance | `TXN{YYYYMM}{00000}` | TXN20251100001 |
| Payment | `PAY{YYYYMM}{0000}` | PAY2025110001 |
| Receipt | `RCP{YYYYMM}{0000}` | RCP2025110001 |
| TuitionFee | `TF{YYYYMM}{0000}` | TF2025110001 |

### Counter Hiện Tại Trong DB

| Counter ID | Giá Trị Hiện Tại |
|------------|------------------|
| `student` | 336 |
| `tuition_202511` | 8 |
| `financeTransaction_202511` | 9 |
| `enrollment_202511` | 8 |
| `request_202511` | 3 |
| `consult_202511` | 3 |
| `placement_202511` | 1 |
| `payment_202511` | 1 |
| `request_202512` | 110 |
| `financeTransaction_202512` | 69 |
| `classCode` | 9 |
| `tuition_202512` | 26 |
| `payment_202512` | 8 |
| `receipt_202512` | 46 |

---

> *File này được tạo tự động bởi script `server/scripts/exportDatabaseSchema.js`*
> *Chạy lại: `cd server && node scripts/exportDatabaseSchema.js`*
