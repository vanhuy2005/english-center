# 📊 Models Refactoring - Logic nghiệp vụ chặt chẽ

## ✅ Vấn đề đã fix

### 1. **Password Hash Issue** (CRITICAL)

- **Vấn đề**: Password bị hash 2 lần (seed script + pre-save hook) → không thể login
- **Giải pháp**: Seed script chỉ truyền plain password, để model tự hash qua pre-save hook
- **File**: `seedComplete.js` - removed manual bcrypt.hash()

## 📋 Models Review theo Workflow Nghiệp vụ

### Workflow 1: Ghi danh học viên (Enrollment Staff)

```
Tư vấn → Đăng ký → Tạo hồ sơ → Phân lớp → Thu học phí
```

**Models liên quan**:

1. **User** (base) - Tài khoản đăng nhập
2. **Student** (profile) - Hồ sơ học viên
3. **Course** - Khóa học
4. **Class** - Lớp học cụ thể
5. **Finance** - Giao dịch học phí

**Logic cần đảm bảo**:

- ✅ User.role = 'student' → MUST có Student profile
- ✅ Student.enrolledCourses[] → array of Course IDs
- ✅ Student.academicStatus → 'active' khi đang học
- ✅ Finance.student → link to Student ID
- ✅ Finance.course → link to Course ID
- ⚠️ **MISSING**: Relationship Student → Class (học viên thuộc lớp nào?)

### Workflow 2: Giáo viên dạy học (Teacher)

```
Nhận phân công → Điểm danh → Giảng dạy → Nhập điểm
```

**Models liên quan**:

1. **User** (role=teacher)
2. **Teacher** (profile)
3. **Class** - Lớp được phân công
4. **Attendance** - Điểm danh
5. **Grade** - Điểm số

**Logic cần đảm bảo**:

- ✅ Teacher.classes[] → array of Class IDs
- ✅ Class.teacher → link to Teacher ID
- ⚠️ **REVIEW**: Class.students structure

### Workflow 3: Học vụ quản lý (Academic Staff)

```
Xếp lịch → Phân công GV → Theo dõi điểm danh → Xử lý yêu cầu
```

**Models liên quan**:

1. **Schedule** - Lịch học
2. **Class** - Lớp học
3. **Attendance** - Điểm danh
4. **Request** - Yêu cầu nghỉ học, học bù

**Logic cần đảm bảo**:

- ✅ Schedule links to Class
- ✅ Attendance links to Student + Class + Date
- ⚠️ **CHECK**: Request model completeness

### Workflow 4: Kế toán quản lý (Accountant)

```
Tạo hóa đơn → Thu tiền → Ghi nhận → Báo cáo
```

**Models liên quan**:

1. **Finance** - Giao dịch
2. **Student** - Học viên
3. **Course** - Khóa học

**Logic cần đảm bảo**:

- ✅ Finance.createdBy → User ID (accountant)
- ✅ Finance.status: pending/paid/partial/overdue
- ✅ Finance.paidAmount vs amount
- ✅ Finance.dueDate tracking

## 🔍 Model-by-Model Analysis

### ✅ User Model - BASE (OK)

**Thuộc tính chính**:

- phone (unique, login identifier) ✅
- email (optional, sparse index) ✅
- password (hashed via pre-save) ✅
- role (6 types) ✅
- isFirstLogin (force password change) ✅
- status (active/inactive/suspended) ✅

**Relationships**: 1-to-1 với Student/Teacher/Staff profiles ✅

---

### ⚠️ Student Model - NEEDS REVIEW

**Hiện tại**:

```javascript
{
  user: ObjectId,
  studentCode: String,
  enrolledCourses: [ObjectId], // Course IDs
  academicStatus: String,
  dateOfBirth, gender, address, contactPerson...
}
```

**Vấn đề**:

1. ❌ Thiếu relationship với Class
2. ❌ enrolledCourses chỉ lưu Course, không lưu Class cụ thể
3. ❌ Không track progress (hoàn thành bao nhiêu %, điểm trung bình)

**Đề xuất refactor**:

```javascript
{
  user: ObjectId,
  studentCode: String,

  // Enrollment tracking
  enrollments: [
    {
      course: ObjectId,      // Course đã đăng ký
      class: ObjectId,       // Lớp cụ thể
      enrolledDate: Date,
      status: 'active|completed|dropped',
      progress: Number,      // % hoàn thành
      finalGrade: Number     // Điểm tổng kết
    }
  ],

  // Academic info
  academicStatus: 'active|graduated|suspended|withdrawn',
  gpa: Number,               // Điểm trung bình tích lũy

  // Personal info (giữ nguyên)
  dateOfBirth, gender, address, contactPerson...
}
```

---

### ⚠️ Teacher Model - NEEDS REVIEW

**Hiện tại**:

```javascript
{
  user: ObjectId,
  teacherCode: String,
  subjects: [String],
  classes: [ObjectId],       // Classes assigned
  employmentStatus: String
}
```

**Vấn đề**:

1. ⚠️ classes[] không có metadata (từ khi nào, lương?)
2. ❌ Thiếu performance metrics (giờ dạy, đánh giá)

**Đề xuất refactor**:

```javascript
{
  user: ObjectId,
  teacherCode: String,

  // Teaching info
  subjects: [String],
  certifications: [String],  // Chứng chỉ

  // Work assignments
  assignments: [
    {
      class: ObjectId,
      startDate: Date,
      endDate: Date,
      salary: Number         // Lương cho lớp này
    }
  ],

  // Performance
  totalHoursTaught: Number,
  averageRating: Number,

  // Employment
  employmentStatus: 'active|on_leave|resigned',
  dateJoined, dateLeft
}
```

---

### ✅ Course Model - OK (nhưng cần bổ sung)

**Hiện tại**: OK
**Bổ sung**:

```javascript
{
  // Existing fields OK

  // Add prerequisites tracking
  prerequisites: [ObjectId],  // Khóa tiên quyết

  // Add syllabus
  syllabus: {
    totalSessions: Number,
    topics: [
      {
        session: Number,
        title: String,
        content: String
      }
    ]
  }
}
```

---

### ⚠️ Class Model - NEEDS MAJOR REFACTOR

**Hiện tại**:

```javascript
{
  name, classCode,
  course: ObjectId,
  teacher: ObjectId,
  students: [
    {
      student: ObjectId,
      enrolledDate: Date,
      status: String
    }
  ],
  schedule: [...],
  startDate, endDate
}
```

**Vấn đề**:

1. ✅ Structure OK
2. ⚠️ Thiếu current session tracking
3. ❌ Thiếu actual vs planned sessions

**Đề xuất refactor**:

```javascript
{
  // Basic info (giữ nguyên)
  name, classCode, course, teacher,

  // Students (giữ nguyên)
  students: [...],

  // Schedule (giữ nguyên)
  schedule: [...],

  // Progress tracking
  totalPlannedSessions: Number,
  completedSessions: Number,
  currentSession: Number,

  // Dates
  startDate, endDate,
  actualStartDate, actualEndDate,

  // Status
  status: 'upcoming|ongoing|completed|cancelled'
}
```

---

### ✅ Finance Model - OK

**Hiện tại**: Good structure
**Suggestions**:

- ✅ Auto-calculate remainingAmount in pre-save
- ✅ Add payment history tracking

---

### ❌ Attendance Model - MISSING

**Cần tạo mới**:

```javascript
{
  class: ObjectId,
  student: ObjectId,
  date: Date,
  session: Number,
  status: 'present|absent|late|excused',
  note: String,
  markedBy: ObjectId,  // Teacher/Staff who marked
  markedAt: Date
}
```

---

### ❌ Grade Model - MISSING

**Cần tạo mới**:

```javascript
{
  student: ObjectId,
  class: ObjectId,
  course: ObjectId,

  // Score breakdown
  scores: [
    {
      type: 'midterm|final|quiz|assignment',
      name: String,
      score: Number,
      maxScore: Number,
      weight: Number,  // % trong tổng điểm
      date: Date
    }
  ],

  // Final
  finalScore: Number,
  grade: String,      // A, B, C, D, F
  isPassed: Boolean,

  // Meta
  gradedBy: ObjectId,
  gradedAt: Date
}
```

---

### ⚠️ Schedule Model - NEEDS REVIEW

**Hiện tại**: Có thể đã tích hợp trong Class
**Logic**:

- Class.schedule[] đủ cho lịch định kỳ
- Cần separate model cho lịch học bù, lịch make-up

---

### ❌ Request Model - MISSING

**Cần tạo mới**:

```javascript
{
  student: ObjectId,
  type: 'leave|makeup|transfer|withdraw',

  // Request details
  reason: String,
  fromDate: Date,
  toDate: Date,
  affectedClasses: [ObjectId],

  // Processing
  status: 'pending|approved|rejected',
  processedBy: ObjectId,  // Staff who processed
  processedAt: Date,
  response: String,

  // Meta
  createdAt, updatedAt
}
```

---

## 🎯 Priority Refactoring

### Phase 1: Critical (Blocking features)

1. ✅ Fix User password hash (DONE)
2. 🔄 Refactor Student model - add enrollments structure
3. 🔄 Create Attendance model
4. 🔄 Create Grade model

### Phase 2: Important (Core features)

5. 🔄 Refactor Teacher model - add assignments
6. 🔄 Refactor Class model - add progress tracking
7. 🔄 Create Request model

### Phase 3: Enhancement

8. Add Course.syllabus
9. Add performance metrics
10. Add audit logs

## 🔧 Implementation Order

1. **Student.enrollments** - affects enrollment workflow
2. **Attendance** - needed by teacher & academic staff
3. **Grade** - needed by teacher
4. **Request** - needed by student & academic staff
5. **Teacher.assignments** - for salary tracking
6. **Class progress tracking** - for reporting

---

**Next Steps**: Chờ confirmation để bắt đầu implement refactoring theo thứ tự ưu tiên.
