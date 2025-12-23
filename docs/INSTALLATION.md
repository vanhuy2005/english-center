# 📦 HƯỚNG DẪN CÀI ĐẶT CHƯƠNG TRÌNH

Hệ thống quản lý trung tâm Anh ngữ - English Center Management System

---

## 📋 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết

- **Node.js:** Version 14.x trở lên

  - Download: https://nodejs.org/
  - Kiểm tra: `node --version`

- **npm:** Version 6.x trở lên (đi kèm Node.js)

  - Kiểm tra: `npm --version`

- **Git:** Để clone repository

  - Download: https://git-scm.com/
  - Kiểm tra: `git --version`

- **MongoDB:** Atlas (cloud) hoặc Community Server (local)
  - Xem hướng dẫn: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### Phần Cứng Khuyên Dùng

- **RAM:** Tối thiểu 4GB (khuyên dùng 8GB+)
- **Storage:** Tối thiểu 1GB trống
- **CPU:** Dual-core trở lên

---

## 🚀 BƯỚC 1: Clone Repository

```bash
# Clone project từ GitHub
git clone https://github.com/vanhuy2005/english-center.git

# Di chuyển vào thư mục project
cd english-center/ENGLISH-CENTER
```

---

## 🔧 BƯỚC 2: Cài Đặt Backend (Server)

### 1. Di chuyển vào thư mục server

```bash
cd server
```

### 2. Cài đặt dependencies

```bash
npm install
```

**Packages chính sẽ được cài đặt:**

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Mã hóa mật khẩu
- jsonwebtoken - Xác thực JWT
- cors - Cross-Origin Resource Sharing
- dotenv - Quản lý biến môi trường
- express-rate-limit - Rate limiting
- cookie-parser - Parse cookies

### 3. Cấu hình môi trường

#### a) Copy file .env.example

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

#### b) Cập nhật file `.env`

Mở file `.env` và cập nhật các thông tin:

```env
# Database - QUAN TRỌNG: Cập nhật connection string của bạn
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/english_center

# Server Port
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173

# JWT Secrets - Thay đổi thành chuỗi bí mật của bạn
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (Tùy chọn - cho upload ảnh)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Tùy chọn - cho gửi thông báo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100

# Seed Data (Tùy chọn - tùy chỉnh tài khoản Director)
SEED_DIRECTOR_EMAIL=director@example.com
SEED_DIRECTOR_PASSWORD=Director123!
SEED_DIRECTOR_NAME=Giám Đốc Hệ Thống
SEED_DIRECTOR_PHONE=0912345678
SEED_DIRECTOR_CODE=DIR001
```

### 4. Seed Database (Tạo dữ liệu ban đầu)

```bash
# Tạo tài khoản Director
node seeds/seedDirector.js

# Tạo dữ liệu khóa học mẫu
node seeds/seedCourses.js
```

**Xem hướng dẫn chi tiết:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### 5. Kiểm tra cài đặt

```bash
# Khởi động server (development mode)
npm run dev

# Hoặc production mode
npm start
```

**Kết quả mong đợi:**

```
✅ MongoDB connected
Server started on port 5000
```

---

## 🎨 BƯỚC 3: Cài Đặt Frontend (Client)

### 1. Mở terminal mới, di chuyển vào thư mục client

```bash
# Từ thư mục gốc ENGLISH-CENTER
cd client
```

### 2. Cài đặt dependencies

```bash
npm install
```

**Packages chính sẽ được cài đặt:**

- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- @mui/material - UI components
- tailwindcss - CSS framework
- recharts - Charts & graphs
- react-i18next - Đa ngôn ngữ
- react-hot-toast - Notifications

### 3. Cấu hình môi trường (nếu cần)

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Mở file `.env` (client):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Khởi động frontend

```bash
npm run dev
```

**Kết quả mong đợi:**

```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ BƯỚC 4: Kiểm Tra Cài Đặt

### 1. Truy cập ứng dụng

Mở trình duyệt và truy cập: **http://localhost:5173**

### 2. Đăng nhập thử

**Tài khoản Director (mặc định):**

- Email: `director@example.com`
- Password: `Director123!`

### 3. Kiểm tra các chức năng cơ bản

- ✅ Đăng nhập thành công
- ✅ Dashboard hiển thị
- ✅ Menu sidebar hoạt động
- ✅ Có thể xem danh sách khóa học

---

## 📁 Cấu Trúc Thư Mục

```
ENGLISH-CENTER/
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Các components tái sử dụng
│   │   ├── pages/         # Các trang chính
│   │   ├── layouts/       # Layouts chính
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── i18n/          # Đa ngôn ngữ
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── shared/       # Shared code
│   │   └── config/       # Configurations
│   ├── seeds/            # Database seed scripts
│   ├── middleware/       # Express middlewares
│   ├── uploads/          # Upload files
│   └── package.json
│
└── docs/                 # Documentation
    ├── DATABASE_SETUP.md      # Hướng dẫn setup database
    ├── INSTALLATION.md        # Hướng dẫn cài đặt (file này)
    ├── API_DOCUMENTATION.md   # API docs
    ├── FOLDER_STRUCTURE.md    # Cấu trúc thư mục
    └── archive/              # Docs cũ/chi tiết
```

---

## 🔄 Scripts Hữu Ích

### Backend (Server)

```bash
npm start          # Chạy production mode
npm run dev        # Chạy development mode (nodemon)
node seeds/seedDirector.js   # Seed tài khoản Director
node seeds/seedCourses.js    # Seed khóa học mẫu
```

### Frontend (Client)

```bash
npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview production build
```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Cannot find module"

**Nguyên nhân:** Dependencies chưa được cài đặt

**Giải pháp:**

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Port already in use"

**Nguyên nhân:** Port 5000 hoặc 5173 đã được sử dụng

**Giải pháp:**

```bash
# Windows - Kill process trên port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

Hoặc thay đổi PORT trong file `.env`:

```env
PORT=5001  # Thay đổi sang port khác
```

### Lỗi: "CORS policy blocked"

**Nguyên nhân:** Backend chưa cấu hình CORS đúng

**Giải pháp:**

- Kiểm tra `CLIENT_URL` trong file `.env` của server
- Restart cả server và client

### Lỗi: "Failed to connect to MongoDB"

**Nguyên nhân:** MongoDB chưa được cấu hình đúng

**Giải pháp:**

- Xem hướng dẫn chi tiết: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- Kiểm tra MONGODB_URI trong `.env`

---

## 🚀 Development Workflow

### Khởi động Development

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

### Trước khi Commit Code

1. **Kiểm tra lỗi:**

   ```bash
   # Client
   cd client
   npm run build  # Kiểm tra build có lỗi không

   # Server - Kiểm tra syntax
   node -c server.js
   ```

2. **Test thủ công:**
   - Đăng nhập/đăng xuất
   - Các chức năng chính
   - Responsive trên mobile

---

## 📚 Tài Liệu Tham Khảo

- **API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Database Setup:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Folder Structure:** [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
- **Archived Docs:** [archive/](./archive/) - Tài liệu chi tiết về workflow, authentication, etc.

---

## 👥 Tài Khoản Test Mặc Định

| Role     | Email/Phone          | Password     | Quyền                 |
| -------- | -------------------- | ------------ | --------------------- |
| Director | director@example.com | Director123! | Quản lý toàn hệ thống |

**Lưu ý:** Đổi password ngay sau khi đăng nhập lần đầu trong môi trường production!

---

## 🆘 Hỗ Trợ

- **Issues:** https://github.com/vanhuy2005/english-center/issues
- **Documentation:** Xem thư mục `docs/`
- **Email:** nguyen.van.quang.huy.2105@gmail.com

---

## 📝 Checklist Cài Đặt

- [ ] Node.js đã được cài đặt
- [ ] MongoDB đã được thiết lập
- [ ] Clone repository thành công
- [ ] Server dependencies đã cài đặt (`npm install`)
- [ ] Client dependencies đã cài đặt (`npm install`)
- [ ] File `.env` đã được cấu hình
- [ ] Database đã được seed
- [ ] Server chạy thành công trên port 5000
- [ ] Client chạy thành công trên port 5173
- [ ] Đăng nhập thành công với tài khoản Director

**Chúc bạn cài đặt thành công! 🎉**
