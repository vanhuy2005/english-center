# 🚀 Setup & Testing Guide - English Center Management System

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **MongoDB**: v5.x or higher (or MongoDB Atlas account)
- **Git**: Latest version

### Check Installation

```powershell
node --version
npm --version
git --version
```

---

## 📥 Installation

### 1. Clone Repository

```powershell
cd C:\Users\Admin\Desktop
git clone https://github.com/yourusername/english-center.git
cd english-center\ENGLISH-CENTER
```

### 2. Install Backend Dependencies

```powershell
cd server
npm install
```

### 3. Install Frontend Dependencies

```powershell
cd ..\client
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

#### 1. Create `.env` file in `server/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/english-center?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=english_center_jwt_secret_key_2025_secure_random_string_12345
JWT_EXPIRES_IN=7d

# JWT Refresh Token Configuration
JWT_REFRESH_SECRET=english_center_refresh_token_secret_2025_another_secure_string_67890
JWT_REFRESH_EXPIRES_IN=30d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@englishcenter.com
```

#### 2. Update MongoDB Connection

Replace `username`, `password`, and `cluster` with your actual MongoDB credentials.

**Using MongoDB Atlas**:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Replace in `.env`

**Using Local MongoDB**:

```env
MONGODB_URI=mongodb://localhost:27017/english-center
```

### Frontend Configuration

#### 1. Create `.env` file in `client/` directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000
```

---

## 💾 Database Setup

### 1. Seed Initial Data

#### Option A: Seed All Data (Recommended for first-time setup)

```powershell
cd server
node seedData.js
```

This will create:

- ✅ 6 test users (director, academic, enrollment, accountant, teachers, students)
- ✅ 3 teachers
- ✅ 5 students
- ✅ 5 courses
- ✅ Finance records

#### Option B: Seed Complete Data (More comprehensive)

```powershell
cd server
node seedComplete.js
```

This includes everything from Option A plus:

- ✅ Classes
- ✅ Attendance records
- ✅ Grades
- ✅ Schedules
- ✅ Notifications
- ✅ Requests

#### Option C: Seed Specific Data

```powershell
# Seed only director
node seedDirector.js

# Seed only student
node seedStudent.js

# Seed all data
node seedAllData.js
```

### 2. Verify Database

```powershell
# Run MongoDB shell
mongosh "your-mongodb-uri"

# Check collections
use english-center
show collections

# Count documents
db.users.countDocuments()
db.students.countDocuments()
db.courses.countDocuments()
```

---

## 🚀 Running the Application

### Development Mode

#### 1. Start Backend Server

```powershell
# Terminal 1
cd server
npm run dev
```

Expected output:

```
 MongoDB Connected: cluster.mongodb.net
 Database: english-center
 Server running on port 3000
 Environment: development
 API URL: http://localhost:3000
```

#### 2. Start Frontend

```powershell
# Terminal 2
cd client
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 3. Access Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Production Mode

#### 1. Build Frontend

```powershell
cd client
npm run build
```

#### 2. Start Backend

```powershell
cd server
npm start
```

---

## 🧪 Testing

### 1. Health Check

```powershell
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Test Authentication

#### Run Automated Tests

```powershell
cd server
node test-auth.js
```

This will test:

- ✅ Public endpoints (no authentication)
- ✅ Login for all roles
- ✅ Protected endpoints access
- ✅ Authorization (role-based access control)

Expected output:

```
🧪 AUTHENTICATION & AUTHORIZATION TESTS
============================================================

Test 1: Public Endpoint (No Authentication)
============================================================
ℹ️  Testing public endpoint (health check)
✅ Health check passed

Test 2: Login for All Roles
============================================================
ℹ️  Testing login for: Student 1 (student)
✅ Login successful for Student 1
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
   User: Nguyễn Văn A (student)
...

📊 TEST SUMMARY
============================================================
Total Tests: 25
Passed: 25
Failed: 0

Pass Rate: 100.00%
✅ ALL TESTS PASSED! 🎉
```

#### Manual Login Test

```powershell
# Test student login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"phone\":\"0901234567\",\"password\":\"student123\"}'
```

### 3. Test Protected Endpoints

```powershell
# Get student courses (requires authentication)
curl http://localhost:3000/api/students/me/courses `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test Frontend

#### Login Flow

1. Open http://localhost:5173
2. Enter credentials:
   - Phone: `0901234567`
   - Password: `student123`
3. Click "Đăng nhập"
4. Should redirect to dashboard

#### Test Accounts

```javascript
// Student
{ phone: "0901234567", password: "student123" }

// Teacher
{ phone: "0912345678", password: "teacher123" }

// Director
{ phone: "0900000001", password: "director123" }

// Academic Staff
{ phone: "0900000002", password: "academic123" }

// Enrollment Staff
{ phone: "0900000003", password: "enrollment123" }

// Accountant
{ phone: "0900000004", password: "accountant123" }
```

---

## 🐛 Troubleshooting

### Issue 1: MongoDB Connection Failed

**Error**: `MongoNetworkError: failed to connect to server`

**Solutions**:

1. Check MongoDB is running: `mongosh`
2. Verify connection string in `.env`
3. Whitelist your IP in MongoDB Atlas
4. Check firewall settings

### Issue 2: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=3001
```

### Issue 3: JWT_SECRET Not Set

**Error**: `JWT_SECRET is not defined in environment variables`

**Solution**:

1. Create `.env` file in `server/` directory
2. Add: `JWT_SECRET=your_secret_key_here`
3. Restart server

### Issue 4: CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:

1. Check `CLIENT_URL` in server `.env` matches frontend URL
2. Add frontend URL to CORS whitelist in `server/src/app.js`
3. Restart backend server

### Issue 5: 401 Unauthorized on Login

**Error**: `POST http://localhost:3000/api/auth/login 401 (Unauthorized)`

**Solutions**:

1. Check credentials are correct
2. Verify user exists in database: `db.users.findOne({ phone: "0901234567" })`
3. Check password is hashed correctly
4. Clear browser cache and localStorage
5. Check request interceptor is NOT adding token to `/auth/login`

### Issue 6: Token Not Saved After Login

**Error**: API calls after login still get 401

**Solutions**:

1. Check `setAuthToken(token)` is called after successful login
2. Verify token is saved to localStorage
3. Check browser developer tools → Application → Local Storage
4. Clear localStorage and try again

### Issue 7: Frontend Not Loading

**Error**: `Cannot GET /`

**Solutions**:

```powershell
# Clear Vite cache
cd client
rm -r node_modules/.vite
npm run dev
```

### Issue 8: Module Not Found

**Error**: `Cannot find module 'bcryptjs'`

**Solution**:

```powershell
# Reinstall dependencies
cd server
rm -r node_modules
rm package-lock.json
npm install
```

---

## 📊 Monitoring

### Backend Logs

#### Development Mode

```
 Server running on port 3000
 Environment: development
 API URL: http://localhost:3000
✅ User 0901234567 logged in successfully
⚠️  Invalid token: JsonWebTokenError
🚫 User student attempted to access /api/director/dashboard
```

### Frontend Logs

#### Browser Console

```javascript
// Check authentication state
localStorage.getItem("token");
localStorage.getItem("user");
localStorage.getItem("role");

// Check API base URL
import.meta.env.VITE_API_BASE_URL;
```

---

## 🔒 Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Use different JWT_REFRESH_SECRET
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable MongoDB authentication
- [ ] Whitelist IP addresses
- [ ] Remove console.log statements
- [ ] Set NODE_ENV=production

---

## 📚 Additional Resources

### Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Workflow](./AUTHENTICATION_WORKFLOW.md)
- [Folder Structure](./FOLDER_RESTRUCTURE.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)

### Useful Commands

```powershell
# Backend
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
node seedData.js     # Seed database

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database
mongosh "your-uri"   # Connect to MongoDB
db.users.find()      # Query users
db.dropDatabase()    # Reset database (careful!)
```

---

## 🎯 Next Steps

After successful setup:

1. ✅ Review [API Documentation](./API_DOCUMENTATION.md)
2. ✅ Study [Authentication Workflow](./AUTHENTICATION_WORKFLOW.md)
3. ✅ Test all user roles
4. ✅ Customize UI/UX
5. ✅ Add more features
6. ✅ Deploy to production

---

**Last Updated**: November 8, 2025  
**Version**: 1.0.0
