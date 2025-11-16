# Gộp Models Nhân Viên - Staff Model Refactor

## Ngày cập nhật: 2025-01-08

## Tổng quan

Đã gộp 3 models nhân viên riêng biệt (AcademicStaff, EnrollmentStaff, Accountant) thành 1 model Staff thống nhất.

## Thay đổi chính

### 1. Models đã xóa

- ❌ `AcademicStaff.model.js`
- ❌ `EnrollmentStaff.model.js`
- ❌ `Accountant.model.js`

### 2. Model mới

- ✅ `Staff.model.js` - Model thống nhất cho tất cả loại nhân viên

### 3. Cấu trúc Staff Model

```javascript
{
  user: ObjectId,              // Reference to User
  staffCode: String,           // Mã nhân viên (unique)
  staffType: String,           // "academic" | "accountant" | "enrollment"
  dateOfBirth: Date,
  gender: String,
  address: String,
  employmentStatus: String,    // "active" | "on_leave" | "resigned"
  dateJoined: Date,
  dateLeft: Date,
  department: String,          // Auto-set based on staffType
  position: String,            // Auto-set based on staffType
  responsibilities: [String],  // Auto-set based on staffType
  
  // Academic Staff specific
  managedClasses: [ObjectId],
  
  // Accountant specific
  accessLevel: String,         // "standard" | "senior" | "manager"
  
  // Performance metrics (all staff types)
  performanceMetrics: {
    // Academic
    totalRequestsProcessed: Number,
    thisMonthRequests: Number,
    averageResponseTime: Number,
    // Accountant
    totalTransactions: Number,
    thisMonthTransactions: Number,
    totalAmountProcessed: Number,
    // Enrollment
    totalEnrollments: Number,
    thisMonthEnrollments: Number,
    conversionRate: Number,
  },
  
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Lợi ích

1. **Đơn giản hóa cấu trúc**: Chỉ cần quản lý 1 model thay vì 3
2. **Dễ bảo trì**: Thêm/sửa field chỉ cần làm ở 1 nơi
3. **Linh hoạt**: Dễ dàng thêm loại nhân viên mới
4. **Nhất quán**: Tất cả nhân viên có cùng cấu trúc cơ bản
5. **Tối ưu database**: Giảm số lượng collections

## Migration

### Chạy migration script (nếu có dữ liệu cũ)

```bash
node src/db_migrations/migrate_staff_models.js
```

Script này sẽ:
- Chuyển dữ liệu từ `academicstaffs`, `enrollmentstaffs`, `accountants` sang `staffs`
- Thêm field `staffType` tương ứng
- Xóa các collections cũ

### Seed dữ liệu mới

```bash
node seedComplete.js
```

## Sử dụng trong code

### Import model

```javascript
const Staff = require("./src/shared/models/Staff.model");
```

### Tạo nhân viên mới

```javascript
// Academic Staff
const academicStaff = await Staff.create({
  user: userId,
  staffCode: "NVHV001",
  staffType: "academic",
  dateOfBirth: new Date("1990-05-20"),
  gender: "female",
  address: "123 Street",
  employmentStatus: "active",
  dateJoined: new Date(),
});

// Accountant
const accountant = await Staff.create({
  user: userId,
  staffCode: "NVKT001",
  staffType: "accountant",
  accessLevel: "standard",
  // ... other fields
});

// Enrollment Staff
const enrollmentStaff = await Staff.create({
  user: userId,
  staffCode: "NVTS001",
  staffType: "enrollment",
  // ... other fields
});
```

### Query theo loại nhân viên

```javascript
// Lấy tất cả academic staff
const academicStaffs = await Staff.find({ staffType: "academic" });

// Lấy tất cả accountants đang active
const activeAccountants = await Staff.find({
  staffType: "accountant",
  employmentStatus: "active",
});

// Lấy enrollment staff với user info
const enrollmentStaffs = await Staff.find({ staffType: "enrollment" })
  .populate("user", "fullName email phone");
```

## Auto-set Fields

Model sẽ tự động set các field sau dựa trên `staffType`:

### Academic Staff
- `department`: "Phòng Học vụ"
- `position`: "Nhân viên Học vụ"
- `responsibilities`: ["Quản lý điểm danh", "Quản lý điểm số", ...]

### Accountant
- `department`: "Phòng Kế toán"
- `position`: "Nhân viên Kế toán"
- `accessLevel`: "standard" (default)
- `responsibilities`: ["Quản lý học phí", "Xử lý thanh toán", ...]

### Enrollment Staff
- `department`: "Phòng Tuyển sinh"
- `position`: "Nhân viên Tuyển sinh"

## Files đã cập nhật

- ✅ `server/seedComplete.js` - Sử dụng Staff model thống nhất
- ✅ `server/src/db_migrations/migrate_staff_models.js` - Script migration mới

## Files không cần cập nhật

Các controller đã không import trực tiếp các model staff cũ:
- ✅ `academic.controller.js` - Không import staff models
- ✅ `accountant.controller.js` - Không import staff models
- ✅ `enrollment.controller.js` - Không import staff models

## Testing

### 1. Xóa database cũ và seed lại

```bash
# Xóa database
mongo
use english_center
db.dropDatabase()

# Seed lại
node seedComplete.js
```

### 2. Kiểm tra collections

```bash
mongo
use english_center
show collections
# Chỉ nên thấy "staffs", không còn "academicstaffs", "enrollmentstaffs", "accountants"

db.staffs.find().pretty()
# Kiểm tra có đúng 3 records với staffType khác nhau
```

### 3. Test API endpoints

```bash
# Login với academic staff
POST /api/auth/login
{
  "phone": "0904000001",
  "password": "123456"
}

# Login với accountant
POST /api/auth/login
{
  "phone": "0906000001",
  "password": "123456"
}

# Login với enrollment staff
POST /api/auth/login
{
  "phone": "0905000001",
  "password": "123456"
}
```

## Rollback (nếu cần)

Nếu cần quay lại cấu trúc cũ:

1. Restore các file model cũ từ git history
2. Chạy script migration ngược lại (cần tạo)
3. Cập nhật lại seedComplete.js

## Notes

- ⚠️ Đảm bảo backup database trước khi chạy migration
- ⚠️ Test kỹ trên môi trường dev trước khi deploy production
- ✅ Model Staff đã có đầy đủ indexes và validations
- ✅ Pre-save middleware tự động set department, position, responsibilities

## Checklist hoàn thành

- [x] Xóa các model cũ
- [x] Cập nhật seedComplete.js
- [x] Tạo migration script
- [x] Tạo tài liệu
- [ ] Test migration với dữ liệu thật
- [ ] Deploy lên production

## Liên hệ

Nếu có vấn đề, liên hệ team dev để được hỗ trợ.
