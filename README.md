# 🎓 English Center Management System# 🎓 English Center Management System

[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)**Full-stack web application** cho quản lý trung tâm tiếng Anh với phân quyền đa vai trò.

[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green.svg)](https://www.mongodb.com/)## 📋 Tổng quan

[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

Hệ thống quản lý toàn diện cho trung tâm tiếng Anh, bao gồm:

> **Comprehensive full-stack web application for managing English language centers with role-based access control and advanced analytics.**

- Quản lý học viên, giáo viên, khóa học, lớp học

---- Quản lý tài chính, thu chi, học phí

- Điểm danh, xếp lịch, theo dõi tiến độ

## 📖 Table of Contents- Báo cáo thống kê và phân tích dữ liệu

- Hệ thống phân quyền 6 vai trò: Director, Staff (3 loại), Teacher, Student

- [Overview](#-overview)

- [Features](#-features)## 🏗️ Kiến trúc

- [Tech Stack](#-tech-stack)

- [System Architecture](#-system-architecture)### Backend (Node.js + Express + MongoDB)

- [Getting Started](#-getting-started)

- [Project Structure](#-project-structure)```

- [User Roles](#-user-roles)server/

- [API Documentation](#-api-documentation)├── src/

- [Database Schema](#-database-schema)│ ├── app.js # Express app initialization

- [Contributing](#-contributing)│ ├── config/ # Database config

- [License](#-license)│ ├── modules/ # Feature modules

│ │ ├── auth/ # Authentication & authorization

---│ │ ├── student/ # Student management

│ │ ├── teacher/ # Teacher management

## 🌟 Overview│ │ ├── course/ # Course management

│ │ ├── finance/ # Finance management

The **English Center Management System** is a modern, full-stack web application designed to streamline the operations of English language learning centers. It provides comprehensive tools for managing students, teachers, courses, finances, attendance, and reporting—all within a secure, role-based access control framework.│ │ ├── director/ # Director features

│ │ └── staff/ # Staff features

### Key Highlights│ │ ├── enrollment/ # Enrollment staff

│ │ ├── academic/ # Academic staff

- **6 User Roles**: Director, Academic Staff, Accountant, Enrollment Staff, Teacher, Student│ │ └── accountant/ # Accountant staff

- **Real-time Analytics**: Interactive dashboards with Chart.js/Recharts visualizations│ └── shared/ # Shared resources

- **Multilingual Support**: English & Vietnamese (i18n)│ ├── models/ # Mongoose models

- **Responsive Design**: Mobile-first UI with Tailwind CSS│ ├── middleware/ # Auth, validation middleware

- **RESTful API**: Well-documented backend with MongoDB│ └── utils/ # Helper functions

- **Secure Authentication**: JWT-based auth with bcrypt password hashing├── server.js # Entry point

└── package.json

---```

## ✨ Features### Frontend (React + Vite + Tailwind CSS)

### Core Functionality```

client/

- ✅ **User Management**: Complete CRUD operations for all user roles├── public/

- ✅ **Student Enrollment**: Registration, class assignment, progress tracking│ └── index.html

- ✅ **Course & Class Management**: Create courses, schedule classes, assign teachers├── src/

- ✅ **Attendance System**: Digital attendance tracking with reports│ ├── main.jsx # Entry point

- ✅ **Grade Management**: Teacher grade input, academic staff oversight│ ├── App.jsx # Root component

- ✅ **Financial Management**: Tuition fees, payments, receipts, revenue reports│ ├── components/

- ✅ **Request Handling**: Student leave requests, class transfers, academic adjustments│ │ ├── common/ # Reusable UI components

- ✅ **Scheduling**: Calendar view for classes and teacher assignments│ │ └── charts/ # Chart components

- ✅ **Reports & Analytics**: Comprehensive reporting system for all roles│ ├── contexts/ # React contexts

- ✅ **Notifications**: Real-time system notifications│ │ ├── AuthContext.jsx # Authentication state

│ │ ├── LanguageContext.jsx # i18n state

### Role-Specific Features│ │ └── ThemeContext.jsx # Theme state

│ ├── hooks/ # Custom hooks

#### 👔 Director│ ├── layouts/ # Layout components

- Executive dashboard with KPIs│ │ ├── MainLayout.jsx

- Revenue and enrollment analytics│ │ ├── Sidebar.jsx

- Teacher performance reports│ │ └── Topbar.jsx

- Student retention analysis│ ├── pages/ # Page components

- Department management│ │ ├── auth/ # Login, register

│ │ ├── director/ # Director dashboard

#### 📚 Academic Staff│ │ └── students/ # Student management

- Class management and scheduling│ ├── services/ # API services

- Attendance tracking across all classes│ ├── utils/ # Helper functions

- Grade oversight and approval│ ├── locales/ # i18n translations

- Student progress monitoring│ │ ├── en.json

- Academic statistics and reports│ │ └── vi.json

│ └── index.css # Global styles (Tailwind)

#### 💰 Accountant├── vite.config.js

- Tuition fee management└── package.json

- Payment processing and receipts```

- Debt tracking and reminders

- Revenue reports and analytics## 🚀 Cài đặt và chạy

- Refund processing

### Yêu cầu

#### 🎓 Enrollment Staff

- Student registration and onboarding- Node.js >= 16

- Class enrollment processing- MongoDB >= 5.0

- Inquiry management- npm hoặc yarn

- Enrollment statistics

### Backend

#### 👩‍🏫 Teacher

- Class and student management```bash

- Attendance markingcd server

- Grade input and evaluationnpm install

- Teaching schedule view

- Student performance tracking# Tạo file .env

cp .env.example .env

#### 👨‍🎓 Student# Cấu hình MongoDB URI, JWT secret, etc.

- Personal dashboard

- View courses and grades# Seed dữ liệu mẫu (optional)

- Attendance historynode seedDirector.js

- Tuition payment trackingnode seedData.js

- Submit requests (leave, transfer)

# Chạy server

---npm start # Production

npm run dev # Development với nodemon

## 🛠️ Tech Stack```

### BackendServer chạy tại: `http://localhost:5000`

| Technology | Version | Purpose |### Frontend

|------------|---------|---------|

| **Node.js** | ≥16.0.0 | Runtime environment |```bash

| **Express** | 4.18.2 | Web framework |cd client

| **MongoDB** | ≥5.0.0 | NoSQL database |npm install

| **Mongoose** | 7.0.0 | MongoDB ODM |

| **JWT** | 9.0.0 | Authentication tokens |# Tạo file .env

| **bcryptjs** | 2.4.3 | Password hashing |cp .env.example .env

| **express-rate-limit** | 8.2.1 | API rate limiting |# Cấu hình API URL

| **cors** | 2.8.5 | Cross-origin resource sharing |

| **dotenv** | 16.0.3 | Environment configuration |# Chạy dev server

npm run dev

### Frontend

# Build production

| Technology | Version | Purpose |npm run build

|------------|---------|---------|npm run preview

| **React** | 18.2.0 | UI library |```

| **Vite** | 5.0.8 | Build tool & dev server |

| **React Router** | 6.20.0 | Client-side routing |Client chạy tại: `http://localhost:3000`

| **Tailwind CSS** | 3.3.6 | Utility-first CSS framework |

| **Axios** | 1.6.2 | HTTP client |## 👥 Phân quyền và Tính năng

| **Recharts** | 2.15.4 | Chart visualization |

| **Chart.js** | 4.4.1 | Additional charting |### 1. Director (Giám đốc)

| **React Hot Toast** | 2.4.1 | Toast notifications |

| **i18next** | 23.16.8 | Internationalization |- ✅ Dashboard tổng quan: thống kê, biểu đồ, báo cáo

| **lucide-react** | 0.294.0 | Icon library |- ✅ Quản lý toàn bộ học viên, giáo viên, nhân viên

| **clsx** | 2.1.1 | Conditional classNames |- ✅ Quản lý khóa học, lớp học, chương trình đào tạo

| **date-fns** | 3.0.0 | Date utilities |- ✅ Xem và phê duyệt các yêu cầu (nghỉ học, học bù)

- ✅ Báo cáo tài chính, doanh thu, chi phí

---- ✅ Phân tích và thống kê chi tiết

## 🏗️ System Architecture### 2. Staff - Enrollment (Nhân viên tuyển sinh)

```- Đăng ký học viên mới

┌─────────────────────────────────────────────────────────────┐- Tư vấn và phân lớp

│                         Client Layer                        │- Xử lý hồ sơ nhập học

│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │- Quản lý thông tin liên hệ

│  │  React UI  │──│  Vite Dev  │──│  Tailwind Styling  │   │

│  └────────────┘  └────────────┘  └────────────────────┘   │### 3. Staff - Academic (Nhân viên học vụ)

│       │                   │                                 │

│       └───────────────────┴────────────────────────────────┤- Xếp lịch học, phân công giảng viên

│                         API Layer                           │- Quản lý điểm danh, vắng mặt

│  ┌─────────────────────────────────────────────────────┐   │- Xử lý yêu cầu nghỉ học, học bù

│  │              REST API (Express.js)                  │   │- Theo dõi tiến độ học tập

│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────────────┐ │   │

│  │  │ Auth │  │ CRUD │  │ RBAC │  │  Rate Limiting │ │   │### 4. Staff - Accountant (Kế toán)

│  │  └──────┘  └──────┘  └──────┘  └────────────────┘ │   │

│  └─────────────────────────────────────────────────────┘   │- Quản lý học phí, thu chi

│       │                   │                                 │- Tạo hóa đơn, phiếu thu

│       └───────────────────┴────────────────────────────────┤- Báo cáo tài chính

│                      Data Layer                             │- Theo dõi công nợ

│  ┌─────────────────────────────────────────────────────┐   │

│  │           MongoDB Database (Mongoose ODM)           │   │### 5. Teacher (Giáo viên)

│  │  ┌──────┐  ┌────────┐  ┌───────┐  ┌─────────────┐ │   │

│  │  │Users │  │Classes │  │Finance│  │ Attendance  │ │   │- Xem lịch dạy, lớp được phân công

│  │  └──────┘  └────────┘  └───────┘  └─────────────┘ │   │- Điểm danh học viên

│  └─────────────────────────────────────────────────────┘   │- Nhập điểm, đánh giá

└─────────────────────────────────────────────────────────────┘- Giao bài tập, tài liệu

```

### 6. Student (Học viên)

---

- Xem thông tin cá nhân, lịch học

## 🚀 Getting Started- Xem điểm số, kết quả học tập

- Đăng ký học bù, xin nghỉ

### Prerequisites- Xem học phí, lịch sử thanh toán

Ensure you have the following installed:## 🛠️ Công nghệ sử dụng

- **Node.js** v16 or higher ([Download](https://nodejs.org/))### Backend

- **MongoDB** v5 or higher ([Download](https://www.mongodb.com/try/download/community))

- **npm** or **yarn** package manager- **Node.js** + **Express** - Server framework

- **Git** for version control- **MongoDB** + **Mongoose** - Database & ODM

- **JWT** - Authentication

### Installation- **bcrypt** - Password hashing

- **express-rate-limit** - API rate limiting

#### 1. Clone the Repository- **cors** - CORS handling

````bash### Frontend

git clone https://github.com/your-org/english-center.git

cd english-center- **React 18** - UI library

```- **Vite** - Build tool & dev server

- **React Router** - Routing

#### 2. Backend Setup- **Tailwind CSS** - Styling framework

- **Recharts** - Chart visualization

```bash- **Axios** - HTTP client

cd server- **React Hot Toast** - Notifications

npm install- **clsx** - Conditional classes



# Create environment file## 📦 Cấu trúc Database

cp .env.example .env

### Models

# Edit .env with your configuration:

# - MONGODB_URI=mongodb://localhost:27017/english-center- **User** - Người dùng (base model cho tất cả roles)

# - JWT_SECRET=your_secret_key- **Student** - Học viên

# - PORT=5000- **Teacher** - Giáo viên

```- **Course** - Khóa học

- **Class** - Lớp học

**Seed Sample Data** (Optional):- **Finance** - Giao dịch tài chính

- **Schedule** - Lịch học

```bash- **Attendance** - Điểm danh

node seedDirector.js    # Creates admin director account- **Request** - Yêu cầu (nghỉ học, học bù, etc.)

node seedData.js        # Populates database with sample data

```## 🌐 API Endpoints



**Start Server:**### Authentication



```bash```

npm start       # Production modePOST   /api/auth/register     # Đăng ký (student, director)

npm run dev     # Development mode with nodemonPOST   /api/auth/login        # Đăng nhập

```POST   /api/auth/logout       # Đăng xuất

GET    /api/auth/me           # Lấy thông tin user hiện tại

Server runs at: `http://localhost:5000`POST   /api/auth/refresh      # Refresh token

````

#### 3. Frontend Setup

### Students

````bash

cd ../client```

npm installGET    /api/students          # Danh sách học viên (pagination, search)

GET    /api/students/:id      # Chi tiết học viên

# Create environment filePOST   /api/students          # Tạo học viên mới

cp .env.example .envPUT    /api/students/:id      # Cập nhật học viên

DELETE /api/students/:id      # Xóa học viên

# Edit .env:GET    /api/students/:id/courses      # Khóa học của học viên

# - VITE_API_URL=http://localhost:5000/apiPOST   /api/students/:id/enroll       # Ghi danh khóa học

````

**Start Development Server:**### Courses

`bash`

npm run devGET /api/courses # Danh sách khóa học

````GET /api/courses/:id       # Chi tiết khóa học

POST   /api/courses           # Tạo khóa học

Client runs at: `http://localhost:5173`PUT    /api/courses/:id       # Cập nhật khóa học

DELETE /api/courses/:id       # Xóa khóa học

**Build for Production:**```



```bash### Finance

npm run build

npm run preview    # Preview production build```

```GET    /api/finance           # Danh sách giao dịch

GET    /api/finance/:id       # Chi tiết giao dịch

---POST   /api/finance           # Tạo giao dịch

POST   /api/finance/:id/payment      # Xử lý thanh toán

## 📁 Project StructureGET    /api/finance/student/:id      # Lịch sử tài chính học viên

````

### Backend (`/server`)

### Director

````

server/```

├── src/GET    /api/director/overview        # Tổng quan dashboard

│   ├── app.js                      # Express app configurationGET    /api/director/reports/revenue # Báo cáo doanh thu

│   ├── config/GET    /api/director/reports/attendance # Báo cáo điểm danh

│   │   └── database.js            # MongoDB connectionGET    /api/director/reports/distribution # Phân bố học viên

│   ├── modules/                    # Feature modules```

│   │   ├── auth/                  # Authentication & authorization

│   │   │   ├── auth.controller.js## 🎨 Giao diện

│   │   │   └── auth.routes.js

│   │   ├── student/               # Student management### Responsive Design

│   │   ├── teacher/               # Teacher management

│   │   ├── course/                # Course management- Mobile-first approach

│   │   ├── class/                 # Class management- Breakpoints: sm, md, lg, xl

│   │   ├── finance/               # Financial operations- Sidebar collapse trên mobile

│   │   ├── schedule/              # Scheduling system- Touch-friendly UI

│   │   ├── grade/                 # Grade management

│   │   ├── attendance/            # Attendance tracking### Dark/Light Theme

│   │   ├── request/               # Student requests

│   │   ├── notification/          # Notifications- Theme switcher trong settings

│   │   ├── director/              # Director features- CSS variables cho colors

│   │   └── staff/                 # Staff modules- Persisted trong localStorage

│   │       ├── enrollment/        # Enrollment staff

│   │       ├── academic/          # Academic staff### i18n (Internationalization)

│   │       └── accountant/        # Accountant

│   └── shared/                     # Shared resources- Vietnamese & English

│       ├── models/                # Mongoose models- Language toggle button

│       │   ├── User.js- Translation files: `locales/vi.json`, `locales/en.json`

│       │   ├── Student.js

│       │   ├── Teacher.js## 🔒 Bảo mật

│       │   ├── Class.js

│       │   ├── Course.js- ✅ JWT authentication với refresh tokens

│       │   ├── Attendance.js- ✅ Password hashing (bcrypt)

│       │   ├── Grade.js- ✅ Role-based access control (RBAC)

│       │   ├── Payment.js- ✅ API rate limiting

│       │   ├── Receipt.js- ✅ Input validation & sanitization

│       │   ├── TuitionFee.js- ✅ CORS configuration

│       │   ├── Request.js- ✅ Secure HTTP-only cookies (cookie-based auth)

│       │   └── Notification.js

│       ├── middleware/            # Express middleware## 📊 Tính năng đã triển khai

│       │   ├── auth.middleware.js

│       │   ├── validate.middleware.js### ✅ Hoàn thành

│       │   └── error.middleware.js

│       └── utils/                 # Helper functions- [x] Authentication & Authorization

│           ├── response.js- [x] Director Dashboard với charts & statistics

│           ├── validation.js- [x] Student List với pagination, search, filters

│           └── helpers.js- [x] Finance management (CRUD)

├── server.js                       # Entry point- [x] Course management (CRUD)

├── package.json- [x] Teacher management (CRUD)

└── .env.example- [x] API services layer

```- [x] i18n (Vietnamese/English)

- [x] Responsive layouts

### Frontend (`/client`)- [x] Error handling & validation

- [x] Reusable UI components

```- [x] Chart components (Line, Bar, Pie, Doughnut)

client/

├── public/### 🚧 Đang phát triển

│   └── index.html

├── src/- [ ] Student Detail Page

│   ├── main.jsx                   # Entry point- [ ] Student Form (Create/Edit)

│   ├── App.jsx                    # Root component- [ ] Class Management

│   ├── components/- [ ] Schedule Management

│   │   ├── common/               # Reusable UI components- [ ] Attendance System

│   │   │   ├── Badge.jsx- [ ] Grade Management

│   │   │   ├── Button.jsx- [ ] Request Management (Leave, Makeup)

│   │   │   ├── Card.jsx          # Unified Card component- [ ] Teacher Dashboard

│   │   │   ├── Input.jsx- [ ] Student Dashboard

│   │   │   ├── Loading.jsx- [ ] Staff Dashboards (3 types)

│   │   │   ├── Modal.jsx- [ ] Reports & Analytics (advanced)

│   │   │   ├── Table.jsx

│   │   │   ├── Progress.jsx## 🧪 Testing

│   │   │   ├── Form.jsx

│   │   │   ├── ChangePasswordDialog.jsx```bash

│   │   │   └── index.js# Backend

│   │   └── charts/               # Chart componentscd server

│   │       ├── BarChart.jsxnpm test

│   │       ├── LineChart.jsx

│   │       ├── PieChart.jsx# Frontend

│   │       ├── DoughnutChart.jsxcd client

│   │       └── index.jsnpm test

│   ├── contexts/                  # React contexts```

│   │   ├── AuthContext.jsx       # Authentication state

│   │   ├── LanguageContext.jsx   # i18n state## 📝 License

│   │   └── ThemeContext.jsx      # Theme state

│   ├── hooks/                     # Custom React hooksPrivate project - All rights reserved

│   │   ├── useAuth.js

│   │   ├── useFetch.js## 👨‍💻 Development Team

│   │   ├── useDebounce.js

│   │   ├── useLocalStorage.js- Backend Development

│   │   ├── usePagination.js- Frontend Development

│   │   ├── useTable.js- UI/UX Design

│   │   └── index.js- Database Design

│   ├── layouts/                   # Layout components- Project Management

│   │   ├── MainLayout.jsx

│   │   ├── AuthLayout.jsx---

│   │   ├── Sidebar.jsx

│   │   ├── Topbar.jsx**Built with ❤️ for English Center Management**

│   │   ├── DirectorSidebar.jsx
│   │   ├── TeacherSidebar.jsx
│   │   ├── StudentSidebar.jsx
│   │   ├── EnrollmentSidebar.jsx
│   │   ├── AcademicStaffSidebar.jsx
│   │   └── AccountantSidebar.jsx
│   ├── pages/                     # Page components
│   │   ├── auth/                 # Login, register
│   │   ├── director/             # Director pages
│   │   ├── teacher/              # Teacher pages
│   │   ├── student/              # Student pages
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentListPage.jsx
│   │   │   ├── StudentDetailPage.jsx
│   │   │   └── ...
│   │   ├── classes/              # Class management
│   │   ├── schedule/             # Schedule pages
│   │   └── staff/                # Staff pages
│   │       ├── academic/         # Academic staff (8 pages)
│   │       ├── accountant/       # Accountant (11 pages)
│   │       └── enrollment/       # Enrollment staff
│   ├── services/                  # API service layer
│   │   ├── api.js                # Axios instance
│   │   └── index.js
│   ├── utils/                     # Utility functions
│   │   ├── date.js
│   │   ├── helpers.js
│   │   ├── validation.js
│   │   └── index.js
│   ├── i18n/                      # Internationalization
│   │   ├── config.js
│   │   ├── en.json
│   │   └── vi.json
│   ├── config/                    # Configuration files
│   │   ├── routes.jsx            # Route definitions
│   │   └── menu.js               # Menu configuration
│   ├── lib/
│   │   └── utils.js              # Tailwind utils (cn)
│   ├── index.css                  # Global styles
│   └── App.css
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.example
````

---

## 👥 User Roles

### 1. 👔 Director

**Permissions**: Full system access, user management, all reports

**Key Features**:

- Executive dashboard with KPIs
- User account creation (all roles)
- Revenue & financial reports
- Student enrollment analytics
- Teacher performance metrics
- Class capacity & distribution reports
- Retention & dropout analysis

### 2. 📚 Academic Staff

**Permissions**: Class management, attendance, grades, academic reporting

**Key Features**:

- Class creation and scheduling
- System-wide attendance tracking
- Grade management and approval
- Student progress monitoring
- Request handling (transfers, deferrals)
- Academic statistics

### 3. 💰 Accountant

**Permissions**: Financial operations, tuition management, payment processing

**Key Features**:

- Tuition fee management
- Payment receipt creation
- Debt tracking and reminders
- Revenue reports
- Refund processing
- Financial analytics

### 4. 🎓 Enrollment Staff

**Permissions**: Student enrollment, registration, class assignment

**Key Features**:

- Student registration
- Class enrollment processing
- Inquiry management
- Enrollment statistics

### 5. 👩‍🏫 Teacher

**Permissions**: Own classes, attendance marking, grade input

**Key Features**:

- Class and student list
- Attendance marking
- Grade input and evaluation
- Student performance tracking
- Teaching schedule
- Class statistics

### 6. 👨‍🎓 Student

**Permissions**: View own data, submit requests

**Key Features**:

- Personal dashboard
- View courses and schedule
- View grades and attendance
- Tuition payment tracking
- Submit leave/transfer requests

---

## 📚 API Documentation

Comprehensive API documentation is available in:

**📄 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    /* response data */
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    /* error details */
  }
}
```

### Quick Reference

| Module                 | Endpoints                 | Description                      |
| ---------------------- | ------------------------- | -------------------------------- |
| **Auth**               | `/api/auth/*`             | Authentication & user management |
| **Students**           | `/api/students/*`         | Student CRUD operations          |
| **Teachers**           | `/api/teachers/*`         | Teacher operations               |
| **Courses**            | `/api/courses/*`          | Course management                |
| **Classes**            | `/api/classes/*`          | Class management                 |
| **Director**           | `/api/director/*`         | Director dashboard & reports     |
| **Staff (Academic)**   | `/api/staff/academic/*`   | Academic staff operations        |
| **Staff (Accountant)** | `/api/staff/accountant/*` | Financial operations             |
| **Staff (Enrollment)** | `/api/staff/enrollment/*` | Enrollment operations            |
| **Finance**            | `/api/finance/*`          | Financial transactions           |

---

## 🗄️ Database Schema

### Core Collections

#### `users`

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: String (director, teacher, student, academic, accountant, enrollment),
  avatar: String,
  phone: String,
  address: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### `students`

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  studentCode: String (unique),
  dateOfBirth: Date,
  level: String,
  enrolledCourses: [{ courseId, classId, enrollDate, status }],
  parents: [{ name, relationship, phone, email }],
  status: String (active, inactive, suspended),
  createdAt: Date
}
```

#### `teachers`

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  teacherCode: String (unique),
  specialization: [String],
  experience: Number,
  qualifications: [String],
  assignedClasses: [ObjectId] (ref: 'Class'),
  status: String,
  createdAt: Date
}
```

#### `courses`

```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique),
  description: String,
  level: String,
  duration: Number (weeks),
  fee: Number,
  schedule: String,
  isActive: Boolean,
  createdAt: Date
}
```

#### `classes`

```javascript
{
  _id: ObjectId,
  name: String,
  course: ObjectId (ref: 'Course'),
  teacher: ObjectId (ref: 'Teacher'),
  students: [{ studentId, enrollDate, status }],
  startDate: Date,
  endDate: Date,
  schedule: [{ dayOfWeek, startTime, endTime }],
  capacity: Number,
  status: String (active, completed, cancelled),
  createdAt: Date
}
```

#### `attendances`

```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: 'Student'),
  class: ObjectId (ref: 'Class'),
  session: ObjectId (ref: 'Session'),
  date: Date,
  status: String (present, absent, late, excused),
  note: String,
  markedBy: ObjectId (ref: 'Teacher'),
  createdAt: Date
}
```

#### `grades`

```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: 'Student'),
  class: ObjectId (ref: 'Class'),
  teacher: ObjectId (ref: 'Teacher'),
  score: Number,
  grade: String (A+, A, B+, etc.),
  type: String (midterm, final, quiz, assignment),
  status: String (pending, approved),
  comment: String,
  updatedBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### `tuitionFees`

```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: 'Student'),
  class: ObjectId (ref: 'Class'),
  amount: Number,
  paidAmount: Number,
  remainingAmount: Number,
  dueDate: Date,
  status: String (unpaid, partial, paid),
  createdAt: Date
}
```

#### `receipts`

```javascript
{
  _id: ObjectId,
  receiptNumber: String (unique),
  student: ObjectId (ref: 'Student'),
  class: ObjectId (ref: 'Class'),
  amount: Number,
  paymentMethod: String,
  description: String,
  note: String,
  status: String (active, voided),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date
}
```

---

## 🔒 Security

### Authentication

- **JWT Tokens**: Access tokens (1h expiry) + Refresh tokens (7d expiry)
- **Password Hashing**: bcrypt with salt rounds = 10
- **Session Management**: Secure HTTP-only cookies

### Authorization

- **Role-Based Access Control (RBAC)**: 6 distinct roles
- **Route Protection**: Middleware validates user role for each endpoint
- **Data Isolation**: Users can only access data relevant to their role

### API Security

- **Rate Limiting**: Protects against DDoS attacks
  - Login: 5 requests per 15 minutes
  - Registration: 3 requests per hour
  - General API: 100 requests per 15 minutes
- **CORS**: Configured for specific origins
- **Input Validation**: Joi schemas on all inputs
- **SQL Injection Prevention**: Mongoose parameterized queries

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

---

## 📦 Deployment

### Production Build

#### Backend

```bash
cd server
npm install --production
NODE_ENV=production npm start
```

#### Frontend

```bash
cd client
npm run build
# Serve the 'dist' folder with a static file server
```

### Environment Variables

Create `.env` files for each environment:

**Backend (`server/.env`)**:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/english-center
JWT_SECRET=your_production_secret
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
```

**Frontend (`client/.env.production`)**:

```env
VITE_API_URL=https://api.your-domain.com/api
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style

- **Backend**: Follow Airbnb JavaScript Style Guide
- **Frontend**: ESLint configuration provided
- **Commits**: Use conventional commits (feat, fix, docs, style, refactor, test, chore)

---

## 📄 License

This project is **private** and proprietary. All rights reserved.

---

## 👨‍💻 Development Team

- **Backend Development**: REST API, Database Design, Authentication
- **Frontend Development**: React UI, State Management, Routing
- **UI/UX Design**: Responsive Design, User Experience
- **DevOps**: CI/CD, Deployment, Monitoring
- **Project Management**: Agile, Sprint Planning

---

## 📞 Support

For questions or support:

- **Email**: support@english-center.com
- **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/english-center/issues)

---

## 🗺️ Roadmap

### Phase 1 (Completed ✅)

- [x] User authentication & authorization
- [x] Role-based dashboards
- [x] Student, teacher, course management
- [x] Basic attendance & grading

### Phase 2 (In Progress 🚧)

- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Payment gateway integration

### Phase 3 (Planned 📋)

- [ ] Live video classes
- [ ] AI-powered learning recommendations
- [ ] Multi-branch support
- [ ] Advanced reporting

---

<div align="center">

**Built with ❤️ for English Learning Excellence**

[⬆ Back to Top](#-english-center-management-system)

</div>
