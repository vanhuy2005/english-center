# 🗄️ HƯỚNG DẪN CÀI ĐẶT CƠ SỞ DỮ LIỆU

## 📋 Yêu Cầu

- MongoDB Atlas account (hoặc MongoDB cài đặt local)
- Node.js version 14 trở lên

---

## 🚀 BƯỚC 1: Cấu Hình Kết Nối Database

### Option 1: Sử dụng MongoDB Atlas (Cloud - Khuyên dùng)

1. **Tạo tài khoản MongoDB Atlas:**

   - Truy cập: https://www.mongodb.com/cloud/atlas
   - Đăng ký tài khoản miễn phí

2. **Tạo Cluster:**

   - Click "Build a Database"
   - Chọn FREE tier (M0)
   - Chọn region gần nhất (Singapore/Tokyo)
   - Click "Create Cluster"

3. **Lấy Connection String:**

   - Click "Connect"
   - Chọn "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

4. **Cập nhật file `.env`:**

   ```bash
   cd server
   cp .env.example .env
   ```

   Mở file `.env` và cập nhật:

   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/english_center?retryWrites=true&w=majority
   ```

### Option 2: Sử dụng MongoDB Local

1. **Cài đặt MongoDB Community Server:**

   - Download: https://www.mongodb.com/try/download/community
   - Cài đặt theo hướng dẫn

2. **Khởi động MongoDB:**

   ```bash
   # Windows
   net start MongoDB

   # Mac/Linux
   sudo systemctl start mongod
   ```

3. **Cập nhật file `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/english_center
   ```

---

## 🌱 BƯỚC 2: Seed Dữ Liệu Ban Đầu

### 1. Cài đặt dependencies

```bash
cd server
npm install
```

### 2. Chạy seed scripts

#### a) Seed tài khoản Director (Giám đốc)

```bash
node seeds/seedDirector.js
```

**Kết quả mong đợi:**

```
✅ MongoDB connected
✅ Director account created: DIR001
```

**Thông tin tài khoản Director:**

- Email: `director@example.com`
- Password: `Director123!`
- Hoặc tùy chỉnh trong file `.env`:
  ```env
  SEED_DIRECTOR_EMAIL=your_email@example.com
  SEED_DIRECTOR_PASSWORD=YourPassword123!
  SEED_DIRECTOR_NAME=Tên Giám Đốc
  ```

#### b) Seed dữ liệu khóa học

```bash
node seeds/seedCourses.js
```

**Kết quả mong đợi:**

```
✓ Kết nối MongoDB thành công
✓ Xóa dữ liệu khóa học cũ
✓ Đã thêm 5 khóa học
✓ Seed dữ liệu thành công!
```

**Khóa học được tạo:**

- English A1 - Sơ cấp (3.5 triệu VNĐ)
- English A2 - Sơ cấp nâng cao (3.5 triệu VNĐ)
- English B1 - Trung cấp (4.5 triệu VNĐ)
- English B2 - Trung cấp nâng cao (4.5 triệu VNĐ)
- English C1 - Nâng cao (6 triệu VNĐ)

---

## ✅ BƯỚC 3: Kiểm Tra Kết Nối

### Kiểm tra bằng MongoDB Compass (GUI Tool)

1. **Download MongoDB Compass:**

   - https://www.mongodb.com/try/download/compass

2. **Kết nối:**

   - Mở MongoDB Compass
   - Paste connection string từ `.env`
   - Click "Connect"

3. **Xác nhận dữ liệu:**
   - Tìm database `english_center` (hoặc tên bạn đặt)
   - Kiểm tra collections:
     - `staffs` - Có 1 document (Director)
     - `courses` - Có 5 documents (5 khóa học)

### Kiểm tra bằng code

```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Database connected!')).catch(err => console.error('❌ Error:', err));"
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi: "MongoNetworkError: failed to connect"

**Nguyên nhân:** Không kết nối được MongoDB

**Giải pháp:**

1. Kiểm tra MONGODB_URI trong `.env` đúng chưa
2. Kiểm tra network/firewall
3. Với MongoDB Atlas: Thêm IP vào whitelist
   - MongoDB Atlas Dashboard → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

### Lỗi: "Authentication failed"

**Nguyên nhân:** Username/password không đúng

**Giải pháp:**

1. Kiểm tra username và password trong connection string
2. Với MongoDB Atlas: Tạo lại database user
   - Database Access → Add New Database User

### Lỗi: "E11000 duplicate key error"

**Nguyên nhân:** Dữ liệu đã tồn tại

**Giải pháp:**

```bash
# Xóa database và seed lại
# Trong MongoDB Compass: Delete database "english_center"
# Hoặc dùng MongoDB Shell:
mongo
use english_center
db.dropDatabase()
exit

# Sau đó chạy lại seed scripts
node seeds/seedDirector.js
node seeds/seedCourses.js
```

---

## 📊 Cấu Trúc Database

```
english_center (Database)
├── staffs           # Nhân viên & giảng viên
│   └── Director account (mặc định)
├── students         # Học viên
├── courses          # Khóa học (5 khóa mặc định)
├── classes          # Lớp học
├── enrollments      # Đăng ký học
├── schedules        # Lịch học
├── attendances      # Điểm danh
├── grades           # Điểm số
├── receipts         # Biên lai thu
└── notifications    # Thông báo
```

---

## 📝 Ghi Chú

- **Backup định kỳ:** Với MongoDB Atlas, tự động backup mỗi ngày
- **Môi trường Development:** Có thể dùng database riêng cho dev/test
- **Production:** Khuyến khích dùng MongoDB Atlas với paid tier để có performance tốt hơn

---

## 🆘 Cần Trợ Giúp?

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Atlas Support: https://www.mongodb.com/cloud/atlas/support
- Project Issues: https://github.com/vanhuy2005/english-center/issues
