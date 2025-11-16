# Quick Guide: Staff Model Migration

## Đã làm gì?

Gộp 3 models nhân viên thành 1:
- ❌ AcademicStaff.model.js
- ❌ EnrollmentStaff.model.js  
- ❌ Accountant.model.js
- ✅ Staff.model.js (thống nhất)

## Chạy ngay

### 1. Nếu có dữ liệu cũ - Chạy migration

```bash
cd server
node src/db_migrations/migrate_staff_models.js
```

### 2. Hoặc seed lại từ đầu

```bash
cd server
node seedComplete.js
```

## Sử dụng trong code

```javascript
const Staff = require("./src/shared/models/Staff.model");

// Tạo academic staff
await Staff.create({
  user: userId,
  staffCode: "NVHV001",
  staffType: "academic",  // ← Quan trọng!
  // ... other fields
});

// Tạo accountant
await Staff.create({
  user: userId,
  staffCode: "NVKT001",
  staffType: "accountant",  // ← Quan trọng!
  accessLevel: "standard",
  // ... other fields
});

// Tạo enrollment staff
await Staff.create({
  user: userId,
  staffCode: "NVTS001",
  staffType: "enrollment",  // ← Quan trọng!
  // ... other fields
});

// Query
const academicStaffs = await Staff.find({ staffType: "academic" });
const accountants = await Staff.find({ staffType: "accountant" });
const enrollmentStaffs = await Staff.find({ staffType: "enrollment" });
```

## Xem chi tiết

Đọc file `STAFF_MODEL_REFACTOR.md` để biết thêm chi tiết.
