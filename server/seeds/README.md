# 🌱 Database Seed Scripts

Thư mục này chứa các script để tạo dữ liệu ban đầu cho hệ thống.

## 📋 Danh Sách Scripts

### 1. seedDirector.js

**Mục đích:** Tạo tài khoản Director (Giám đốc) mặc định

**Cách chạy:**

```bash
node seeds/seedDirector.js
```

**Dữ liệu tạo:**

- 1 tài khoản Director với thông tin từ `.env` hoặc mặc định:
  - Email: `director@example.com`
  - Password: `Director123!`
  - Staff Code: `DIR001`
  - Full Name: `Giám đốc Hệ thống`

**Tùy chỉnh:** Cập nhật các biến sau trong file `.env`:

```env
SEED_DIRECTOR_EMAIL=your_email@example.com
SEED_DIRECTOR_PASSWORD=YourPassword123!
SEED_DIRECTOR_NAME=Tên Giám Đốc
SEED_DIRECTOR_PHONE=0912345678
SEED_DIRECTOR_CODE=DIR001
```

---

### 2. seedCourses.js

**Mục đích:** Tạo dữ liệu khóa học mẫu

**Cách chạy:**

```bash
node seeds/seedCourses.js
```

**Dữ liệu tạo:**

- 5 khóa học mẫu:
  1. **English A1** - Sơ cấp (3.5 triệu VNĐ)
  2. **English A2** - Sơ cấp nâng cao (3.5 triệu VNĐ)
  3. **English B1** - Trung cấp (4.5 triệu VNĐ)
  4. **English B2** - Trung cấp nâng cao (4.5 triệu VNĐ)
  5. **English C1** - Nâng cao (6 triệu VNĐ)

**Lưu ý:** Script này sẽ xóa tất cả khóa học cũ trước khi tạo mới.

---

### 3. seedStudent.js

**Mục đích:** Tạo tài khoản học sinh với đầy đủ dữ liệu test

**Cách chạy:**

```bash
node seeds/seedStudent.js
```

**Dữ liệu tạo:**

- 1 tài khoản Student hoàn chỉnh:
  - Email: `student.test@example.com`
  - Password: `Student123!`
  - Phone: `0912000001`
  - 3 khóa học đã đăng ký (completed, ongoing, upcoming)
  - Điểm số đầy đủ (giữa kỳ, cuối kỳ, trung bình)
  - Điểm chuyên cần (attendance records)
  - Thời khóa biểu cụ thể
  - Tài chính (đã thanh toán, chưa thanh toán)

**Yêu cầu:** Phải chạy `seedCourses.js` trước

---

## 🚀 Cách Sử Dụng

### Chạy tất cả seeds (khuyến nghị)

```bash
# Từ thư mục server/
node seeds/seedDirector.js
node seeds/seedCourses.js
node seeds/seedStudent.js
```

### Chạy từng script riêng lẻ

```bash
# Chỉ tạo tài khoản Director
node seeds/seedDirector.js

# Chỉ tạo khóa học
node seeds/seedCourses.js
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Kết nối Database:** Đảm bảo đã cấu hình `MONGODB_URI` trong file `.env`
2. **Chạy từ thư mục server:** Các lệnh trên phải được chạy từ thư mục `server/`
3. **Idempotent:** Các script có thể chạy nhiều lần an toàn
   - `seedDirector.js`: Cập nhật thông tin nếu tài khoản đã tồn tại
   - `seedCourses.js`: Xóa và tạo lại tất cả khóa học

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"

```bash
# Cài đặt dependencies
cd server
npm install
```

### Lỗi: "MongoDB connection failed"

- Kiểm tra `MONGODB_URI` trong `.env`
- Xem hướng dẫn: [../docs/DATABASE_SETUP.md](../docs/DATABASE_SETUP.md)

### Lỗi: "Duplicate key error"

- Với `seedDirector.js`: Tài khoản đã tồn tại (bình thường)
- Với `seedCourses.js`: Chạy lại script để xóa và tạo mới

---

## 📝 Tạo Script Seed Mới

Để tạo script seed mới, tham khảo template:

```javascript
#!/usr/bin/env node
require("dotenv").config();

const connectDB = require("../src/config/database");
const YourModel = require("../src/shared/models/YourModel");

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // Your seed logic here
    const data = await YourModel.create({
      // data fields
    });

    console.log("✅ Seed completed:", data);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
})();
```

---

## 📚 Tài Liệu Liên Quan

- [DATABASE_SETUP.md](../docs/DATABASE_SETUP.md) - Hướng dẫn setup database
- [INSTALLATION.md](../docs/INSTALLATION.md) - Hướng dẫn cài đặt chương trình
