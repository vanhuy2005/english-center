# API Tạo Tài Khoản Học Viên

## Endpoint
```
POST /api/auth/create-student
```

## Mô tả
API này cho phép tạo tài khoản học viên mới với số điện thoại và mật khẩu mặc định là "123456".

## Request Body
```json
{
  "phone": "0987654321",
  "fullName": "Nguyễn Văn A"
}
```

### Tham số bắt buộc:
- `phone` (string): Số điện thoại (10-11 chữ số)
- `fullName` (string): Họ và tên đầy đủ

## Response

### Thành công (201 Created)
```json
{
  "success": true,
  "message": "Tạo tài khoản học viên thành công",
  "data": {
    "student": {
      "_id": "676123456789abcdef123456",
      "studentCode": "HV00001",
      "phone": "0987654321",
      "fullName": "Nguyễn Văn A",
      "status": "active",
      "isFirstLogin": true,
      "academicStatus": "inactive",
      "createdAt": "2024-12-17T10:00:00.000Z",
      "updatedAt": "2024-12-17T10:00:00.000Z"
    },
    "defaultPassword": "123456"
  }
}
```

### Lỗi (400 Bad Request)
```json
{
  "success": false,
  "message": "Số điện thoại đã được sử dụng"
}
```

```json
{
  "success": false,
  "message": "Vui lòng cung cấp số điện thoại và họ tên"
}
```

### Lỗi server (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Lỗi server khi tạo tài khoản",
  "error": "Chi tiết lỗi..."
}
```

## Cách sử dụng

### 1. Từ JavaScript/Node.js
```javascript
const axios = require('axios');

async function createStudent() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/create-student', {
      phone: '0987654321',
      fullName: 'Nguyễn Văn Test'
    });
    
    console.log('Student created:', response.data.data.student);
    console.log('Default password:', response.data.data.defaultPassword);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}
```

### 2. Từ cURL
```bash
curl -X POST http://localhost:5000/api/auth/create-student \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0987654321",
    "fullName": "Nguyễn Văn Test"
  }'
```

### 3. Từ React Component
Xem file `CreateStudentForm.jsx` để có ví dụ đầy đủ.

## Lưu ý quan trọng

1. **Mật khẩu mặc định**: Tất cả tài khoản mới được tạo với mật khẩu mặc định là "123456"
2. **Đăng nhập lần đầu**: Học viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu (`isFirstLogin: true`)
3. **Mã học viên**: Hệ thống tự động tạo mã học viên theo format "HV00001", "HV00002"...
4. **Số điện thoại duy nhất**: Mỗi số điện thoại chỉ có thể đăng ký một tài khoản
5. **Trạng thái ban đầu**: 
   - `status`: "active" (có thể đăng nhập)
   - `academicStatus`: "inactive" (chưa đăng ký khóa học nào)

## Quy trình sau khi tạo tài khoản

1. Tạo tài khoản học viên qua API
2. Cung cấp thông tin đăng nhập cho học viên (số điện thoại + mật khẩu mặc định)
3. Học viên đăng nhập lần đầu và đổi mật khẩu
4. Đăng ký khóa học cho học viên (thay đổi `academicStatus` thành "active")

## Test API

Chạy file test:
```bash
cd server
node test-create-student.js
```