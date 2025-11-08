# 🖥️ English Center - Backend API

> **Node.js + Express + MongoDB backend for the English Center Management System with RESTful API architecture.**

---

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Modules](#api-modules)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Middleware](#middleware)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## 🌟 Overview

The backend application is built with **Node.js** and **Express.js**, providing a comprehensive RESTful API for the English Center Management System. It features modular architecture, role-based access control, JWT authentication, and MongoDB integration via Mongoose.

### Key Features

- 🚀 **RESTful API**: Clean, well-structured API endpoints
- 🔐 **JWT Authentication**: Secure token-based authentication
- 👥 **RBAC**: Role-Based Access Control for 6 user roles
- 📊 **MongoDB**: NoSQL database with Mongoose ODM
- 🛡️ **Security**: Rate limiting, CORS, input validation
- 📦 **Modular**: Feature-based module organization
- ⚡ **Performance**: Optimized queries and indexing

---

## 🛠️ Tech Stack

### Core Dependencies

| Package      | Version | Purpose                             |
| ------------ | ------- | ----------------------------------- |
| **express**  | 4.18.2  | Web framework for Node.js           |
| **mongoose** | 7.0.0   | MongoDB object modeling (ODM)       |
| **nodemon**  | 3.1.10  | Development server with auto-reload |

### Authentication & Security

| Package                | Version | Purpose                             |
| ---------------------- | ------- | ----------------------------------- |
| **jsonwebtoken**       | 9.0.0   | JWT token generation & validation   |
| **bcryptjs**           | 2.4.3   | Password hashing with salt          |
| **cors**               | 2.8.5   | Cross-Origin Resource Sharing       |
| **express-rate-limit** | 8.2.1   | API rate limiting & DDoS protection |

### Utilities

| Package    | Version | Purpose                         |
| ---------- | ------- | ------------------------------- |
| **dotenv** | 16.0.3  | Environment variable management |

---

## 📁 Project Structure

```
server/
├── src/
│   ├── app.js                      # Express application setup
│   │
│   ├── config/
│   │   └── database.js            # MongoDB connection configuration
│   │
│   ├── modules/                    # Feature-based modules
│   │   │
│   │   ├── auth/                  # Authentication module
│   │   │   ├── auth.controller.js # Login, register, token refresh
│   │   │   └── auth.routes.js     # POST /api/auth/login, /register, etc.
│   │   │
│   │   ├── student/               # Student management
│   │   │   ├── student.controller.js
│   │   │   └── student.routes.js  # GET/POST/PUT/DELETE /api/students/*
│   │   │
│   │   ├── teacher/               # Teacher management
│   │   │   ├── teacher.controller.js
│   │   │   └── teacher.routes.js  # GET/POST /api/teachers/*
│   │   │
│   │   ├── course/                # Course management
│   │   │   ├── course.controller.js
│   │   │   └── course.routes.js   # CRUD /api/courses/*
│   │   │
│   │   ├── class/                 # Class management
│   │   │   ├── class.controller.js
│   │   │   └── class.routes.js    # CRUD /api/classes/*
│   │   │
│   │   ├── finance/               # Financial transactions
│   │   │   ├── finance.controller.js
│   │   │   └── finance.routes.js  # GET/POST /api/finance/*
│   │   │
│   │   ├── schedule/              # Scheduling system
│   │   │   ├── schedule.controller.js
│   │   │   └── schedule.routes.js
│   │   │
│   │   ├── grade/                 # Grade management
│   │   │   ├── grade.controller.js
│   │   │   └── grade.routes.js
│   │   │
│   │   ├── attendance/            # Attendance tracking
│   │   │   ├── attendance.controller.js
│   │   │   └── attendance.routes.js
│   │   │
│   │   ├── request/               # Student requests
│   │   │   ├── request.controller.js
│   │   │   └── request.routes.js
│   │   │
│   │   ├── notification/          # Notifications
│   │   │   ├── notification.controller.js
│   │   │   └── notification.routes.js
│   │   │
│   │   ├── director/              # Director features
│   │   │   ├── director.controller.js  # Dashboard, reports, analytics
│   │   │   └── director.routes.js      # GET /api/director/*
│   │   │
│   │   └── staff/                 # Staff modules
│   │       ├── enrollment/        # Enrollment staff
│   │       │   ├── enrollment.controller.js  # Student enrollment
│   │       │   └── enrollment.routes.js      # GET/POST /api/staff/enrollment/*
│   │       │
│   │       ├── academic/          # Academic staff
│   │       │   ├── academic.controller.js    # Class, attendance, grades
│   │       │   └── academic.routes.js        # GET/PUT /api/staff/academic/*
│   │       │
│   │       └── accountant/        # Accountant
│   │           ├── accountant.controller.js  # Tuition, payments, receipts
│   │           └── accountant.routes.js      # GET/POST /api/staff/accountant/*
│   │
│   └── shared/                     # Shared resources
│       │
│       ├── models/                # Mongoose schemas
│       │   ├── User.js            # User accounts (all roles)
│       │   ├── Student.js         # Student profiles
│       │   ├── Teacher.js         # Teacher profiles
│       │   ├── Class.js           # Class information
│       │   ├── Course.js          # Course catalog
│       │   ├── Attendance.js      # Attendance records
│       │   ├── Grade.js           # Student grades
│       │   ├── Payment.js         # Payment transactions
│       │   ├── Receipt.js         # Payment receipts
│       │   ├── TuitionFee.js      # Tuition fee records
│       │   ├── Request.js         # Student requests
│       │   └── Notification.js    # System notifications
│       │
│       ├── middleware/            # Express middleware
│       │   ├── auth.middleware.js       # JWT verification
│       │   ├── validate.middleware.js   # Input validation
│       │   └── error.middleware.js      # Error handling
│       │
│       └── utils/                 # Utility functions
│           ├── response.js        # Standardized API responses
│           ├── validation.js      # Validation helpers
│           └── helpers.js         # General helpers
│
├── db_migrations/                  # Database migration scripts
│   └── migrate_approvedBy_to_processedBy.js
│
├── server.js                       # Entry point
├── seedDirector.js                 # Seed admin director account
├── seedData.js                     # Seed sample data
├── seedStudent.js                  # Seed student data
├── seedComplete.js                 # Complete data seeding
├── package.json                    # Dependencies & scripts
└── .env.example                    # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** v5 or higher (running locally or cloud instance)
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration

Edit `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/english-center

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173
```

### Database Seeding (Optional)

```bash
# Seed admin director account
node seedDirector.js

# Seed complete sample data
node seedComplete.js

# Or seed specific data
node seedData.js      # General data
node seedStudent.js   # Student-specific data
```

**Default Admin Credentials** (after seeding):

- Email: `director@example.com`
- Password: `Password123`

### Running the Server

**Development Mode** (with auto-reload):

```bash
npm run dev
```

**Production Mode**:

```bash
npm start
```

Server will run at: `http://localhost:5000`

---

## 📚 API Modules

### 1. Authentication (`/api/auth`)

**Controller**: `modules/auth/auth.controller.js`

| Endpoint                    | Method | Description                    |
| --------------------------- | ------ | ------------------------------ |
| `/api/auth/register`        | POST   | Register new user account      |
| `/api/auth/login`           | POST   | User login, returns JWT tokens |
| `/api/auth/refresh-token`   | POST   | Refresh access token           |
| `/api/auth/logout`          | POST   | Invalidate refresh token       |
| `/api/auth/me`              | GET    | Get current user profile       |
| `/api/auth/change-password` | PUT    | Change user password           |

**Authentication Flow**:

```
1. POST /api/auth/login
   ├─► Validate credentials
   ├─► Hash password check
   ├─► Generate access token (1h)
   ├─► Generate refresh token (7d)
   └─► Return tokens + user data

2. Authenticated Requests
   ├─► Include: Authorization: Bearer <access_token>
   ├─► Middleware verifies token
   └─► Attach user to req.user

3. POST /api/auth/refresh-token
   ├─► Validate refresh token
   └─► Return new access token
```

### 2. Director (`/api/director`)

**Controller**: `modules/director/director.controller.js`

**Dashboard & Users** (5 endpoints):

- `GET /api/director/dashboard` - Executive KPI dashboard
- `GET /api/director/users` - List all users
- `POST /api/director/users` - Create new user

**Revenue Reports** (3 endpoints):

- `GET /api/director/reports/charts/revenue` - Revenue charts
- `GET /api/director/reports/revenue-stats` - Revenue statistics

**Student Reports** (5 endpoints):

- `GET /api/director/reports/student-stats` - Student statistics
- `GET /api/director/reports/enrollment-trend` - Enrollment trends
- `GET /api/director/reports/student-distribution` - Distribution by level
- `GET /api/director/reports/top-students` - Top performing students

**Class Reports** (5 endpoints):

- `GET /api/director/reports/class-stats` - Class statistics
- `GET /api/director/reports/classes-by-status` - Classes by status
- `GET /api/director/reports/class-capacity` - Capacity analysis
- `GET /api/director/reports/all-classes` - All classes list

**Teacher Reports** (4 endpoints):

- `GET /api/director/reports/teacher-stats` - Teacher statistics
- `GET /api/director/reports/teacher-performance` - Performance metrics
- `GET /api/director/reports/top-teachers` - Top performers
- `GET /api/director/reports/teacher-workload` - Workload analysis

**Retention Reports** (4 endpoints):

- `GET /api/director/reports/retention-stats` - Retention statistics
- `GET /api/director/reports/retention-trend` - Retention trends
- `GET /api/director/reports/dropout-reasons` - Dropout analysis
- `GET /api/director/reports/at-risk-students` - At-risk students
- `GET /api/director/reports/retention-by-cohort` - Cohort retention

**Department Reports** (4 endpoints):

- `GET /api/director/reports/departments` - All departments
- `GET /api/director/reports/department/:id` - Department details
- `GET /api/director/reports/department/:id/teachers` - Department teachers
- `GET /api/director/reports/department/:id/students` - Department students

**Additional** (2 endpoints):

- `GET /api/director/reports/charts/attendance` - Attendance charts
- `GET /api/director/reports/activities` - Activity logs

### 3. Teacher (`/api/teachers`)

**Controller**: `modules/teacher/teacher.controller.js`

| Endpoint                                     | Method | Description           |
| -------------------------------------------- | ------ | --------------------- |
| `/api/teachers/dashboard`                    | GET    | Teacher dashboard     |
| `/api/teachers/classes`                      | GET    | List assigned classes |
| `/api/teachers/classes/:classId`             | GET    | Class details         |
| `/api/teachers/classes/:classId/students`    | GET    | Class students        |
| `/api/teachers/classes/:classId/sessions`    | GET    | Class sessions        |
| `/api/teachers/classes/:classId/sessions`    | POST   | Create session        |
| `/api/teachers/classes/:classId/statistics`  | GET    | Class statistics      |
| `/api/teachers/attendance/:sessionId`        | GET    | Session attendance    |
| `/api/teachers/attendance/:sessionId`        | POST   | Mark attendance       |
| `/api/teachers/classes/:classId/grades`      | GET    | Class grades          |
| `/api/teachers/classes/:classId/grades`      | POST   | Input grades          |
| `/api/teachers/classes/:classId/evaluations` | GET    | Student evaluations   |
| `/api/teachers/classes/:classId/evaluations` | POST   | Submit evaluation     |
| `/api/teachers/schedule`                     | GET    | Teaching schedule     |
| `/api/teachers/notifications`                | GET    | Notifications         |
| `/api/teachers/notifications/:id/read`       | PATCH  | Mark as read          |
| `/api/teachers/notifications/read-all`       | PATCH  | Mark all as read      |
| `/api/teachers/notifications/:id`            | DELETE | Delete notification   |

### 4. Student (`/api/students`)

**Controller**: `modules/student/student.controller.js`

**Student Data** (CRUD):

- `GET /api/students` - List all students (paginated)
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

**Student Portal**:

- `GET /api/students/me/courses` - My enrolled courses
- `GET /api/students/me/grades` - My grades
- `GET /api/students/me/attendance` - My attendance
- `GET /api/students/me/tuition` - My tuition fees
- `GET /api/students/me/schedule` - My class schedule
- `GET /api/students/me/notifications` - My notifications
- `GET /api/students/me/requests` - My requests
- `POST /api/students/me/requests` - Submit request
- `POST /api/students/me/enroll` - Self-enroll in class

**Additional**:

- `GET /api/students/:id/courses` - Student courses
- `GET /api/students/:id/enrollment-history` - Enrollment history
- `POST /api/students/:id/enroll` - Enroll student in class

### 5. Academic Staff (`/api/staff/academic`)

**Controller**: `modules/staff/academic/academic.controller.js`

| Endpoint                                     | Method | Description         |
| -------------------------------------------- | ------ | ------------------- |
| `/api/staff/academic/dashboard`              | GET    | Academic dashboard  |
| `/api/staff/academic/classes`                | GET    | All classes         |
| `/api/staff/academic/attendance`             | GET    | Attendance overview |
| `/api/staff/academic/attendance/report`      | POST   | Generate report     |
| `/api/staff/academic/grades`                 | GET    | All grades          |
| `/api/staff/academic/grades/:id`             | PUT    | Update grade        |
| `/api/staff/academic/students/progress`      | GET    | Student progress    |
| `/api/staff/academic/requests`               | GET    | Academic requests   |
| `/api/staff/academic/requests/:id/approve`   | PUT    | Approve request     |
| `/api/staff/academic/requests/:id/reject`    | PUT    | Reject request      |
| `/api/staff/academic/reports/class/:classId` | GET    | Class report        |
| `/api/staff/academic/statistics`             | GET    | Academic statistics |

### 6. Accountant (`/api/staff/accountant`)

**Controller**: `modules/staff/accountant/accountant.controller.js`

**Tuition Management** (4 endpoints):

- `GET /api/staff/accountant/dashboard` - Financial dashboard
- `GET /api/staff/accountant/tuition` - All tuition fees
- `GET /api/staff/accountant/tuition/student/:studentId` - Student tuition
- `PUT /api/staff/accountant/tuition/:id` - Update tuition

**Receipt Management** (4 endpoints):

- `GET /api/staff/accountant/receipts` - All receipts
- `GET /api/staff/accountant/receipts/:id` - Receipt details
- `POST /api/staff/accountant/receipts` - Create receipt
- `DELETE /api/staff/accountant/receipts/:id` - Delete receipt

**Payment Processing** (3 endpoints):

- `GET /api/staff/accountant/payments` - Payment history
- `POST /api/staff/accountant/payments/confirm` - Confirm payment
- `POST /api/staff/accountant/payments/refund` - Process refund

**Reports** (6 endpoints):

- `GET /api/staff/accountant/reports/revenue` - Revenue reports
- `GET /api/staff/accountant/reports/debt` - Debt reports
- `POST /api/staff/accountant/reports/export` - Export report
- `GET /api/staff/accountant/statistics/revenue` - Revenue stats
- `GET /api/staff/accountant/statistics/overview` - Financial overview

### 7. Enrollment Staff (`/api/staff/enrollment`)

**Controller**: `modules/staff/enrollment/enrollment.controller.js`

| Endpoint                                    | Method | Description           |
| ------------------------------------------- | ------ | --------------------- |
| `/api/staff/enrollment/dashboard`           | GET    | Enrollment dashboard  |
| `/api/staff/enrollment/students`            | GET    | Student list          |
| `/api/staff/enrollment/students`            | POST   | Register student      |
| `/api/staff/enrollment/students/:id`        | GET    | Student details       |
| `/api/staff/enrollment/students/:id`        | PUT    | Update student        |
| `/api/staff/enrollment/students/:id/enroll` | POST   | Enroll in class       |
| `/api/staff/enrollment/classes`             | GET    | Available classes     |
| `/api/staff/enrollment/requests`            | GET    | Enrollment requests   |
| `/api/staff/enrollment/requests/:id`        | PUT    | Process request       |
| `/api/staff/enrollment/statistics`          | GET    | Enrollment statistics |

### 8. Course Management (`/api/courses`)

**Controller**: `modules/course/course.controller.js`

| Endpoint           | Method | Description        |
| ------------------ | ------ | ------------------ |
| `/api/courses`     | GET    | List all courses   |
| `/api/courses/:id` | GET    | Get course details |
| `/api/courses`     | POST   | Create new course  |
| `/api/courses/:id` | PUT    | Update course      |
| `/api/courses/:id` | DELETE | Delete course      |

### 9. Finance (`/api/finance`)

**Controller**: `modules/finance/finance.controller.js`

| Endpoint                          | Method | Description          |
| --------------------------------- | ------ | -------------------- |
| `/api/finance`                    | GET    | All transactions     |
| `/api/finance/:id`                | GET    | Transaction details  |
| `/api/finance/student/:studentId` | GET    | Student transactions |
| `/api/finance`                    | POST   | Create transaction   |
| `/api/finance/:id/payment`        | POST   | Record payment       |

---

## 🗄️ Database Models

### User Model (`shared/models/User.js`)

```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['director', 'teacher', 'student', 'academic', 'accountant', 'enrollment'],
    required: true
  },
  avatar: String,
  phone: String,
  address: String,
  isActive: {
    type: Boolean,
    default: true
  }
}
```

**Methods**:

- `matchPassword(enteredPassword)` - Compare passwords
- `getSignedJwtToken()` - Generate JWT token

**Pre-save Hook**: Hash password before saving

### Student Model (`shared/models/Student.js`)

```javascript
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  studentCode: {
    type: String,
    unique: true,
    required: true
  },
  dateOfBirth: Date,
  level: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced']
  },
  enrolledCourses: [{
    courseId: { type: ObjectId, ref: 'Course' },
    classId: { type: ObjectId, ref: 'Class' },
    enrollDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    }
  }],
  parents: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}
```

### Teacher Model (`shared/models/Teacher.js`)

```javascript
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  teacherCode: {
    type: String,
    unique: true,
    required: true
  },
  specialization: [String],
  experience: Number,
  qualifications: [String],
  assignedClasses: [{
    type: ObjectId,
    ref: 'Class'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}
```

### Class Model (`shared/models/Class.js`)

```javascript
{
  name: {
    type: String,
    required: true
  },
  course: {
    type: ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: ObjectId,
    ref: 'Teacher',
    required: true
  },
  students: [{
    studentId: {
      type: ObjectId,
      ref: 'Student'
    },
    enrollDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    }
  }],
  startDate: Date,
  endDate: Date,
  schedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    startTime: String,
    endTime: String
  }],
  capacity: Number,
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}
```

### Other Models

- **Course** (`Course.js`): Course catalog with name, code, level, duration, fee
- **Attendance** (`Attendance.js`): Daily attendance records (present, absent, late, excused)
- **Grade** (`Grade.js`): Student grades with type (midterm, final, quiz, assignment)
- **TuitionFee** (`TuitionFee.js`): Tuition fees with payment status
- **Receipt** (`Receipt.js`): Payment receipts with receipt number
- **Payment** (`Payment.js`): Payment transactions
- **Request** (`Request.js`): Student requests (leave, transfer, etc.)
- **Notification** (`Notification.js`): System notifications

---

## 🔐 Authentication

### JWT Implementation

**Token Generation** (`shared/models/User.js`):

```javascript
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
```

**Authentication Middleware** (`shared/middleware/auth.middleware.js`):

```javascript
module.exports.protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
```

**Authorization Middleware**:

```javascript
module.exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized`,
      });
    }
    next();
  };
};
```

**Usage Example**:

```javascript
// Protect route + authorize specific roles
router.get("/dashboard", protect, authorize("director"), getDashboard);
```

---

## 🛡️ Middleware

### 1. Authentication Middleware

**File**: `shared/middleware/auth.middleware.js`

- `protect()` - Verify JWT token
- `authorize(...roles)` - Check user role

### 2. Validation Middleware

**File**: `shared/middleware/validate.middleware.js`

Validates request data against schemas:

```javascript
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};
```

### 3. Error Middleware

**File**: `shared/middleware/error.middleware.js`

Global error handler:

```javascript
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    error = new Error(message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};
```

### 4. Rate Limiting

**Configuration** (`app.js`):

```javascript
const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP",
});

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts",
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", loginLimiter);
```

---

## ⚙️ Configuration

### Database Configuration

**File**: `src/config/database.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Express App Configuration

**File**: `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/", apiLimiter);

// Routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/students", require("./modules/student/student.routes"));
app.use("/api/teachers", require("./modules/teacher/teacher.routes"));
app.use("/api/courses", require("./modules/course/course.routes"));
app.use("/api/classes", require("./modules/class/class.routes"));
app.use("/api/director", require("./modules/director/director.routes"));
app.use(
  "/api/staff/academic",
  require("./modules/staff/academic/academic.routes")
);
app.use(
  "/api/staff/accountant",
  require("./modules/staff/accountant/accountant.routes")
);
app.use(
  "/api/staff/enrollment",
  require("./modules/staff/enrollment/enrollment.routes")
);
app.use("/api/finance", require("./modules/finance/finance.routes"));

// Error handler
app.use(require("./shared/middleware/error.middleware"));

module.exports = app;
```

### Environment Variables

**Required Variables** (`.env`):

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/english-center

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173
```

---

## 📦 Deployment

### Production Build

```bash
# Install production dependencies only
npm install --production

# Start server
NODE_ENV=production npm start
```

### Environment Setup

**Production `.env`**:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/english-center?retryWrites=true&w=majority
JWT_SECRET=production_super_secret_key
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name english-center-api

# View logs
pm2 logs english-center-api

# Restart
pm2 restart english-center-api

# Stop
pm2 stop english-center-api
```

### Docker Deployment

**Dockerfile**:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**docker-compose.yml**:

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/english-center
    depends_on:
      - mongo

  mongo:
    image: mongo:5
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### API Testing with cURL

**Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "director@example.com",
    "password": "Password123"
  }'
```

**Protected Route**:

```bash
curl http://localhost:5000/api/director/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 🤝 Contributing

Please follow the [main project contributing guidelines](../README.md#contributing).

---

<div align="center">

**Backend API for English Center Management System**

[⬆ Back to Top](#-english-center---backend-api)

</div>
