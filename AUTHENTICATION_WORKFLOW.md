# 🔐 Authentication & Authorization Workflow

## Tổng Quan Hệ Thống

Hệ thống xác thực và phân quyền được thiết kế theo tiêu chuẩn **JWT (JSON Web Token)** với các tính năng:

- ✅ Đăng nhập bằng số điện thoại + mật khẩu
- ✅ Token-based authentication
- ✅ Role-based authorization (RBAC)
- ✅ Refresh token mechanism
- ✅ First-time login password change
- ✅ Client-side token validation
- ✅ Secure token storage

---

## 📋 Workflow Đăng Nhập (Login Flow)

### 1️⃣ Client-Side Flow (Frontend)

```
User Input (Phone + Password)
        ↓
LoginPage.handleSubmit()
        ↓
AuthContext.login()
        ↓
POST /api/auth/login (NO TOKEN SENT)
        ↓
Receive: { token, user, profile, isFirstLogin }
        ↓
setAuthToken(token) → Update global token
        ↓
Save to localStorage: token, user, role
        ↓
Update React state: token, user, role
        ↓
Check isFirstLogin?
    ├─ YES → Show ChangePasswordModal
    └─ NO  → Navigate to /dashboard
```

### 2️⃣ Server-Side Flow (Backend)

```
POST /api/auth/login (auth.controller.js)
        ↓
Find user by phone (with password field)
        ↓
Validate password with bcrypt.compare()
        ↓
Check user.status === 'active'
        ↓
Generate JWT tokens:
    - accessToken (7 days)
    - refreshToken (30 days)
        ↓
Save refreshToken to user.refreshToken
        ↓
Get role-specific profile (Student/Teacher)
        ↓
Return: { success, data: { token, user, profile, isFirstLogin } }
```

---

## 🔒 Authorization Flow (Protected Routes)

### 1️⃣ Request Interceptor (api.js)

```javascript
// Before sending request
apiClient.interceptors.request.use((config) => {
  // 🚫 SKIP token for public endpoints
  const publicEndpoints = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh-token",
  ];
  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    config.url?.includes(endpoint)
  );

  if (!isPublicEndpoint) {
    // ✅ Add token to Authorization header
    const token = currentToken || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
```

### 2️⃣ Backend Middleware (auth.middleware.js)

```javascript
// protect middleware
exports.protect = async (req, res, next) => {
  // 1. Extract token from Authorization header
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Verify token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }

  // 3. Verify token with JWT_SECRET
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. Get user from decoded ID
  const user = await User.findById(decoded.id).select(
    "-password -refreshToken"
  );

  // 5. Check user exists and is active
  if (!user || user.status !== "active") {
    return res.status(401).json({
      success: false,
      message: "Người dùng không tồn tại hoặc bị khóa",
    });
  }

  // 6. Attach user to request
  req.user = user;
  next();
};
```

```javascript
// authorize middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} không có quyền truy cập.`,
      });
    }
    next();
  };
};
```

### 3️⃣ Route Protection Pattern

```javascript
// Example: Student self-service routes
router.get(
  "/me/courses",
  protect, // 1. Verify token
  authorize("student"), // 2. Check role = "student"
  studentController.getMyCourses
);

// Example: Admin routes
router.get(
  "/",
  protect, // 1. Verify token
  authorize("director", "academic", "enrollment"), // 2. Check role
  studentController.getAllStudents
);
```

---

## 👥 Role-Based Access Control (RBAC)

### Roles Hierarchy

```
┌─────────────────────────────────────────────┐
│            director (Giám đốc)              │
│  - Full access to all modules               │
│  - Can manage users, courses, finance       │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│         academic (Chuyên viên học vụ)       │
│  - Manage classes, schedules, grades        │
│  - View student/teacher data                │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│        enrollment (Chuyên viên tuyển sinh)  │
│  - Register students                        │
│  - Manage student enrollment                │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│        accountant (Kế toán)                 │
│  - Manage finance, tuition                  │
│  - Generate financial reports               │
└─────────────────────────────────────────────┘
           ↓
┌──────────────────┬──────────────────────────┐
│   teacher        │      student             │
│  - Manage own    │  - View own courses      │
│    classes       │  - View grades           │
│  - Grade         │  - Submit requests       │
│    students      │  - View schedule         │
└──────────────────┴──────────────────────────┘
```

### Permission Matrix

| Module             | director | academic | enrollment | accountant | teacher          | student  |
| ------------------ | -------- | -------- | ---------- | ---------- | ---------------- | -------- |
| Users Management   | ✅       | ❌       | ❌         | ❌         | ❌               | ❌       |
| Students List      | ✅       | ✅       | ✅         | ✅         | ✅ (limited)     | ❌       |
| Student Enrollment | ✅       | ❌       | ✅         | ❌         | ❌               | ❌       |
| Classes Management | ✅       | ✅       | ❌         | ❌         | ✅ (own)         | ❌       |
| Grades Management  | ✅       | ✅       | ❌         | ❌         | ✅ (own classes) | ❌       |
| Attendance         | ✅       | ✅       | ❌         | ❌         | ✅ (own classes) | ❌       |
| Finance/Tuition    | ✅       | ❌       | ❌         | ✅         | ❌               | ✅ (own) |
| Requests           | ✅       | ✅       | ❌         | ❌         | ❌               | ✅ (own) |
| Reports/Analytics  | ✅       | ✅       | ❌         | ✅         | ❌               | ❌       |

---

## 🔄 Token Management

### Access Token (JWT)

- **Duration**: 7 days
- **Purpose**: API authentication
- **Storage**:
  - `localStorage.token` (persistent)
  - `currentToken` (in-memory, api.js)
  - `AuthContext.token` (React state)

### Refresh Token

- **Duration**: 30 days
- **Purpose**: Get new access token when expired
- **Storage**:
  - Database: `user.refreshToken`
  - Client: `localStorage.refreshToken`

### Token Lifecycle

```
Login Success
    ↓
Generate tokens (access + refresh)
    ↓
Store in localStorage + memory + React state
    ↓
[7 days usage]
    ↓
Access token expires (401 response)
    ↓
POST /api/auth/refresh-token { refreshToken }
    ↓
Backend verifies refresh token
    ↓
Generate new access + refresh tokens
    ↓
Update storage
    ↓
Retry failed request with new token
```

---

## 🚦 Error Handling

### Frontend (Response Interceptor)

```javascript
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { status, data } = error.response;
    const isAuthEndpoint = error.config?.url?.includes("/api/auth/");

    switch (status) {
      case 401: // Unauthorized
        if (!isAuthEndpoint) {
          // Clear tokens and redirect to login
          localStorage.clear();
          currentToken = null;
          navigate("/login");
          toast.error("Phiên đăng nhập hết hạn");
        }
        break;

      case 403: // Forbidden
        toast.error("Bạn không có quyền truy cập");
        break;

      case 404: // Not Found
        toast.error("Không tìm thấy dữ liệu");
        break;

      case 500: // Server Error
        toast.error("Lỗi server");
        break;
    }

    return Promise.reject(error);
  }
);
```

### Backend Error Responses

```javascript
// 401 - Unauthorized (No token or invalid token)
{ success: false, message: "Không có quyền truy cập" }

// 403 - Forbidden (Valid token but insufficient role)
{ success: false, message: "Role student không có quyền truy cập" }

// 404 - Not Found
{ success: false, message: "Không tìm thấy học viên" }

// 500 - Server Error
{ success: false, message: "Lỗi server" }
```

---

## 🔧 Configuration

### Environment Variables (Backend)

```env
# JWT Settings
JWT_SECRET=english_center_jwt_secret_key_2025_secure_random_string_12345
JWT_EXPIRES_IN=7d

# Refresh Token Settings
JWT_REFRESH_SECRET=english_center_refresh_token_secret_2025_another_secure_string_67890
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=3000
NODE_ENV=development
```

### Environment Variables (Frontend)

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📝 API Endpoints

### Public Endpoints (No Authentication Required)

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh-token
```

### Protected Endpoints (Require Authentication)

```
GET  /api/auth/me                 [all roles]
PUT  /api/auth/change-password    [all roles]
POST /api/auth/logout             [all roles]

GET  /api/students/me/courses     [student only]
GET  /api/students/me/grades      [student only]
GET  /api/students/me/attendance  [student only]
GET  /api/students/me/tuition     [student only]

GET  /api/students                [director, academic, enrollment, accountant]
POST /api/students                [director, enrollment]
GET  /api/students/:id            [director, academic, enrollment, accountant, teacher, self]
PUT  /api/students/:id            [director, academic, enrollment, accountant]
DELETE /api/students/:id          [director only]
```

---

## 🧪 Testing Accounts

```javascript
// Student Account
{
  phone: "0901234567",
  password: "student123",
  role: "student",
  email: "student1@gmail.com"
}

// Teacher Account
{
  phone: "0912345678",
  password: "teacher123",
  role: "teacher",
  email: "teacher1@englishcenter.com"
}

// Director Account
{
  phone: "0900000001",
  password: "director123",
  role: "director",
  email: "director@englishcenter.com"
}

// Academic Staff
{
  phone: "0900000002",
  password: "academic123",
  role: "academic",
  email: "academic@englishcenter.com"
}

// Enrollment Staff
{
  phone: "0900000003",
  password: "enrollment123",
  role: "enrollment",
  email: "enrollment@englishcenter.com"
}

// Accountant
{
  phone: "0900000004",
  password: "accountant123",
  role: "accountant",
  email: "accountant@englishcenter.com"
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Request without token" on login

**Problem**: Interceptor adds token to ALL requests, including `/auth/login`
**Solution**: Skip token for public endpoints in request interceptor

### Issue 2: Token expires immediately after login

**Problem**: Token validation on frontend incorrect
**Solution**: Decode JWT payload and check `exp` field properly

### Issue 3: 401 on all API calls after login

**Problem**: Token not saved to global state after login
**Solution**: Call `setAuthToken(token)` after successful login

### Issue 4: Can't refresh token

**Problem**: `JWT_REFRESH_SECRET` not set in environment
**Solution**: Add to `.env` file

### Issue 5: CORS errors

**Problem**: Frontend origin not allowed
**Solution**: Add origin to CORS whitelist in `app.js`

---

## 📊 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  email: String (unique, sparse),
  phone: String (unique, required),
  password: String (hashed with bcrypt),
  fullName: String,
  role: String (enum: ["student", "teacher", "enrollment", "academic", "accountant", "director"]),
  status: String (enum: ["active", "inactive", "suspended"]),
  isFirstLogin: Boolean,
  refreshToken: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Student Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: "User"),
  studentCode: String (auto-generated: HV00001),
  dateOfBirth: Date,
  gender: String (enum: ["male", "female", "other"]),
  address: String,
  contactInfo: { phone, email },
  contactPerson: { name, relation, phone, email },
  enrolledCourses: [ObjectId] (ref: "Course"),
  academicStatus: String (enum: ["active", "on-leave", "completed", "dropped"]),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Best Practices

### Security

1. ✅ Never expose JWT_SECRET in client-side code
2. ✅ Always use HTTPS in production
3. ✅ Set appropriate token expiration times
4. ✅ Hash passwords with bcrypt (salt rounds: 10)
5. ✅ Validate user input on both client and server
6. ✅ Clear tokens on logout
7. ✅ Implement refresh token rotation

### Performance

1. ✅ Store token in memory + localStorage (avoid repeated decoding)
2. ✅ Use token validation middleware once per route
3. ✅ Cache user data after login
4. ✅ Use indexes on User.phone and User.email

### User Experience

1. ✅ Show clear error messages for authentication failures
2. ✅ Auto-redirect on token expiration
3. ✅ Implement "Remember me" with longer token expiration
4. ✅ Force password change on first login
5. ✅ Show loading states during authentication

---

## 📈 Monitoring & Logging

### Backend Logs

```javascript
// Successful login
console.log(`✅ User ${user.phone} logged in successfully`);

// Failed login attempt
console.log(`❌ Failed login attempt for phone: ${phone}`);

// Token verification failure
console.log(`⚠️ Invalid token: ${error.name}`);

// Authorization failure
console.log(`🚫 User ${user.role} attempted to access ${req.path}`);
```

### Frontend Logs

```javascript
// Token saved
console.log("Token saved:", token.substring(0, 20) + "...");

// User saved
console.log("User saved:", user);

// Login error
console.error("Login error:", error);
```

---

**Last Updated**: November 8, 2025
**Version**: 1.0.0
