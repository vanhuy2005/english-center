# 🎓 English Center Management System

[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

> **Hệ thống quản lý toàn diện cho trung tâm Anh ngữ với phân quyền đa vai trò và phân tích dữ liệu nâng cao.**

---

## 📋 Tổng Quan

Hệ thống quản lý toàn diện cho trung tâm tiếng Anh, bao gồm:

- ✅ Quản lý học viên, giáo viên, khóa học, lớp học
- ✅ Quản lý tài chính, thu chi, học phí
- ✅ Điểm danh, xếp lịch, theo dõi tiến độ
- ✅ Báo cáo thống kê và phân tích dữ liệu
- ✅ Hệ thống phân quyền 6 vai trò

---

## 🚀 Bắt Đầu Nhanh

### 📚 Hướng Dẫn Cài Đặt Chi Tiết

1. **[📦 INSTALLATION.md](docs/INSTALLATION.md)** - Hướng dẫn cài đặt chương trình từ A-Z
2. **[🗄️ DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** - Hướng dẫn thiết lập cơ sở dữ liệu

### ⚡ Quick Start (5 phút)

```bash
# 1. Clone repository
git clone https://github.com/vanhuy2005/english-center.git
cd english-center/ENGLISH-CENTER

# 2. Setup Backend
cd server
npm install
cp .env.example .env
# Cập nhật MONGODB_URI trong file .env
node seeds/seedDirector.js
node seeds/seedCourses.js
npm run dev

# 3. Setup Frontend (mở terminal mới)
cd ../client
npm install
npm run dev

# 4. Truy cập ứng dụng
# URL: http://localhost:5173
# Login: director@example.com / Director123!
```

---

## ✨ Tính Năng Chính

### 🎯 Quản Lý Toàn Diện

- **Học viên**: Đăng ký, theo dõi tiến độ, quản lý thông tin cá nhân
- **Giáo viên**: Phân công lớp, quản lý giảng dạy, chấm điểm
- **Khóa học**: Tạo khóa học, quản lý nội dung, theo dõi học phí
- **Lớp học**: Xếp lịch, điểm danh, quản lý sĩ số

### 💰 Quản Lý Tài Chính

- Thu học phí, tạo biên lai
- Báo cáo doanh thu theo thời gian
- Theo dõi công nợ học viên
- Thống kê tài chính chi tiết

### 📊 Báo Cáo & Phân Tích

- Dashboard tương tác với biểu đồ
- Thống kê theo thời gian thực
- Xuất báo cáo Excel/PDF
- Phân tích xu hướng

### 👥 Phân Quyền 6 Vai Trò

1. **Director** - Giám đốc: Toàn quyền quản lý
2. **Academic Staff** - Học vụ: Quản lý học tập, điểm danh
3. **Accountant** - Kế toán: Quản lý tài chính
4. **Enrollment Staff** - Tuyển sinh: Đăng ký học viên
5. **Teacher** - Giáo viên: Giảng dạy, chấm điểm
6. **Student** - Học viên: Xem thông tin cá nhân

### 🌐 Đa Ngôn Ngữ

- Tiếng Việt
- English
- Dễ dàng mở rộng thêm ngôn ngữ

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication & Authorization
- **Bcrypt** - Password hashing
- **Express Rate Limit** - API rate limiting

### Frontend

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling framework
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React i18next** - Internationalization
- **React Hot Toast** - Notifications

---

## 📁 Cấu Trúc Project

```
ENGLISH-CENTER/
│
├── client/                    # Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilities
│   │   └── i18n/             # Internationalization
│   └── package.json
│
├── server/                    # Backend Application
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── student/      # Student management
│   │   │   ├── teacher/      # Teacher management
│   │   │   ├── course/       # Course management
│   │   │   ├── finance/      # Finance management
│   │   │   └── ...
│   │   ├── shared/           # Shared code
│   │   │   ├── models/       # Mongoose models
│   │   │   ├── middleware/   # Middlewares
│   │   │   └── utils/        # Utilities
│   │   └── config/           # Configurations
│   ├── seeds/                # Database seed scripts
│   │   ├── seedDirector.js   # Seed admin account
│   │   └── seedCourses.js    # Seed sample courses
│   └── package.json
│
├── docs/                      # Documentation
│   ├── INSTALLATION.md        # Installation guide
│   ├── DATABASE_SETUP.md      # Database setup guide
│   ├── API_DOCUMENTATION.md   # API documentation
│   ├── FOLDER_STRUCTURE.md    # Folder structure
│   └── archive/              # Archived detailed docs
│
├── LICENSE
└── README.md                  # This file
```

---

## 👥 Vai Trò Người Dùng

| Vai Trò              | Mô Tả                | Quyền Chính                                  |
| -------------------- | -------------------- | -------------------------------------------- |
| **Director**         | Giám đốc trung tâm   | Quản lý toàn bộ hệ thống, xem tất cả báo cáo |
| **Academic Staff**   | Nhân viên học vụ     | Quản lý điểm danh, điểm số, lịch học         |
| **Accountant**       | Nhân viên kế toán    | Quản lý thu chi, học phí, báo cáo tài chính  |
| **Enrollment Staff** | Nhân viên tuyển sinh | Đăng ký học viên, quản lý thông tin          |
| **Teacher**          | Giảng viên           | Quản lý lớp học, điểm danh, nhập điểm        |
| **Student**          | Học viên             | Xem thông tin cá nhân, lịch học, điểm số     |

---

## 📚 Tài Liệu

### Hướng Dẫn Cài Đặt

- **[INSTALLATION.md](docs/INSTALLATION.md)** - Hướng dẫn cài đặt từng bước
- **[DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** - Thiết lập MongoDB và seed data

### Tài Liệu Kỹ Thuật

- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API endpoints và usage
- **[FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)** - Chi tiết cấu trúc project

### Tài Liệu Chi Tiết (Archive)

- [AUTHENTICATION_WORKFLOW.md](docs/archive/AUTHENTICATION_WORKFLOW.md) - Workflow xác thực
- [AUTHENTICATION_COMPLETED.md](docs/archive/AUTHENTICATION_COMPLETED.md) - Tài liệu auth hoàn chỉnh
- [QUICK_START_TEST.md](docs/archive/QUICK_START_TEST.md) - Hướng dẫn test nhanh
- [Và nhiều tài liệu khác...](docs/archive/)

---

## 🔐 Bảo Mật

- ✅ JWT Authentication với refresh token
- ✅ Password hashing với bcrypt (salt rounds: 10)
- ✅ Role-based access control (RBAC)
- ✅ API rate limiting
- ✅ Input validation & sanitization
- ✅ CORS configuration
- ✅ Environment variables cho sensitive data

---

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd server
npm test

# Frontend tests (coming soon)
cd client
npm test
```

---

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

```bash
# Build production
npm run build

# Set environment variables trên hosting platform
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
```

### Frontend Deployment (Vercel/Netlify)

```bash
cd client
npm run build

# Deploy thư mục dist/
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is **private** and proprietary. All rights reserved.

---

## 👨‍💻 Developer

**Nguyen Van Quang Huy**

- GitHub: [@vanhuy2005](https://github.com/vanhuy2005)
- Email: nguyen.van.quang.huy.2105@gmail.com

---

## 🙏 Acknowledgments

- React Team for amazing framework
- MongoDB for scalable database
- Material-UI for beautiful components
- Tailwind CSS for utility-first CSS
- All open-source contributors

---

## 📞 Support

Nếu gặp vấn đề trong quá trình cài đặt hoặc sử dụng:

1. Xem [INSTALLATION.md](docs/INSTALLATION.md) và [DATABASE_SETUP.md](docs/DATABASE_SETUP.md)
2. Kiểm tra [Issues](https://github.com/vanhuy2005/english-center/issues)
3. Tạo issue mới nếu chưa có giải pháp
4. Liên hệ email: 4901104009@hcmue.student.edu.vn

---

**Made with ❤️ by Group C.503**
