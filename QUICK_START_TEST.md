# 🚀 QUICK START - TEST AUTHENTICATION

## Bước 1: Khởi động Server

Mở terminal và chạy:

```bash
cd ENGLISH-CENTER/server
npm start
```

✅ Nếu thấy message:

```
✓ Server running on port 3000
✓ MongoDB Connected
```

→ Server đã sẵn sàng!

---

## Bước 2: Khởi động Frontend

Mở terminal mới và chạy:

```bash
cd ENGLISH-CENTER/client
npm run dev
```

✅ Nếu thấy message:

```
Local: http://localhost:5173
```

→ Frontend đã sẵn sàng!

---

## Bước 3: Test Login trên Browser

1. Mở browser: **http://localhost:5173/login**

2. Nhập thông tin:

   - **Số điện thoại:** `0901000001` (Director)
   - **Mật khẩu:** `123456`

3. Click **Đăng nhập**

4. ✅ **Kết quả mong đợi:**
   - Toast hiện "Đăng nhập thành công!"
   - Redirect to dashboard
   - Sidebar hiện menu phù hợp với role Director

---

## Bước 4: Kiểm tra Console (DevTools)

Mở F12 → Console tab, xem:

```javascript
🔐 Attempting login with phone: 0901000001
📥 Login response received: {success: true, data: {...}}
✅ Login successful: {
  user: "Nguyễn Văn Giám Đốc",
  role: "director",
  token: "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Bước 5: Kiểm tra Network Tab

F12 → Network tab:

1. **Request /api/auth/login:**

   ```json
   {
     "phone": "0901000001",
     "password": "123456"
   }
   ```

2. **Response:**

   ```json
   {
     "success": true,
     "message": "Đăng nhập thành công",
     "data": {
       "user": {...},
       "token": "...",
       "refreshToken": "...",
       "isFirstLogin": true
     }
   }
   ```

3. **Request /api/auth/me (Protected):**
   - Headers: `Authorization: Bearer eyJhbGciOi...`
   - Response: User info + profile

---

## Bước 6: Test Các Roles Khác

### Test Director (Giám đốc)

- Phone: `0901000001`
- Should see: All management features

### Test Teacher (Giảng viên)

- Phone: `0902000001`
- Should see: My classes, attendance, grades

### Test Student (Học viên)

- Phone: `0903000001`
- Should see: My courses, schedule, grades

### Test Academic Staff

- Phone: `0904000001`
- Should see: Attendance management, grade management

### Test Enrollment Staff

- Phone: `0905000001`
- Should see: Student enrollment, statistics

### Test Accountant

- Phone: `0906000001`
- Should see: Tuition management, payments

**Tất cả accounts đều dùng password: `123456`**

---

## Bước 7: Test Authorization

1. Login với Student account (`0903000001`)
2. Try to access `/director/dashboard`
3. ✅ Should be blocked (403 Forbidden) hoặc redirect

---

## Bước 8: Test Logout

1. Click button "Đăng xuất"
2. ✅ Should clear token from localStorage
3. ✅ Should redirect to login page
4. Try to access protected route → Should redirect to login

---

## ❌ Nếu gặp lỗi

### "Failed to load resource: 401 Unauthorized"

**Solution:**

1. Check console logs
2. Verify password đúng là `123456`
3. Verify phone number chính xác
4. Check server logs có lỗi gì không

### "Cannot connect to server"

**Solution:**

1. Check server có đang chạy không? (Terminal có log "Server running")
2. Check port 3000 có bị chiếm không?
3. Restart server

### "Database connection failed"

**Solution:**

1. Check `.env` file có `MONGODB_URI` đúng
2. Check MongoDB Compass có connect được không
3. Run seed lại: `node seedComplete.js`

---

## ✅ Success Criteria

Hệ thống hoạt động đúng khi:

- [x] Login thành công với tất cả 6 roles
- [x] Token được lưu vào localStorage
- [x] Dashboard load được sau login
- [x] Protected routes yêu cầu authentication
- [x] Authorization block wrong roles
- [x] Logout clear token và redirect
- [x] Invalid credentials bị reject với 401

---

## 🎉 Next Steps

Sau khi authentication hoạt động:

1. Test change password on first login
2. Test các features specific cho từng role
3. Test error handling (network errors, server errors)
4. Implement forgot password feature
5. Add email verification
6. Add 2FA (optional)

---

**Happy Testing! 🚀**
