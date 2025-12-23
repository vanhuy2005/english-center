# 📊 Thống Kê Doanh Thu Từ Phiếu Thu

## Tổng Quan

Đã tạo một hệ thống thống kê doanh thu toàn diện dựa trên phiếu thu với các biểu đồ và báo cáo chi tiết.

## Các Tính Năng

### 1. **Dashboard Thống Kê**

- **Tổng Doanh Thu**: Hiển thị tổng số tiền từ tất cả phiếu thu
- **Số Phiếu Thu**: Đếm tổng số phiếu thu trong kỳ
- **Doanh Thu Trung Bình**: Tính mức doanh thu trung bình trên mỗi phiếu
- **Phương Thức Thanh Toán Phổ Biến Nhất**: Hiện phương thức được sử dụng nhiều nhất

### 2. **Biểu Đồ Trực Quan**

#### 📍 Biểu Đồ Tròn (Pie Chart)

- Phân tích doanh thu theo phương thức thanh toán
- Hiển thị tỉ lệ phần trăm cho mỗi phương thức
- Các phương thức: Tiền mặt, Chuyển khoản, Thẻ tín dụng, MoMo, Hoàn tiền, Khác

#### 📊 Biểu Đồ Cột (Bar Chart)

- Doanh thu hàng ngày (7 ngày gần đây)
- Thể hiện rõ xu hướng doanh thu trong tuần

#### 📈 Biểu Đồ Diện Tích (Area Chart)

- Tổng doanh thu tích lũy
- Thể hiện cách doanh thu accumulate theo thời gian

### 3. **Bảng Chi Tiết**

- Bảng thống kê theo phương thức thanh toán
- Cột: Phương thức, Số lần, Tổng tiền, Tỉ lệ (%)
- Định dạng tiền tệ Vietnamese Dong (₫)

### 4. **Tính Năng Lọc**

- **Lọc Theo Ngày**: Sử dụng RangePicker để chọn khoảng thời gian
- **Đặt Lại**: Nút reset để quay lại mặc định
- **Xuất Báo Cáo**: Chức năng sẵn sàng để mở rộng (tương lai)

## Cấu Trúc Dữ Liệu

### Dữ Liệu Từ API

```json
{
  "success": true,
  "message": "Lấy thống kê thành công",
  "totalAmount": 50000000,
  "totalReceipts": 25,
  "byMethod": [
    {
      "_id": "cash",
      "total": 30000000,
      "count": 15
    },
    {
      "_id": "bank_transfer",
      "total": 20000000,
      "count": 10
    }
  ],
  "dailyStats": [
    {
      "date": "2024-12-18",
      "amount": 5000000,
      "receipts": 3
    }
  ]
}
```

## Các Tệp Được Cập Nhật

### Frontend

1. **[client/src/pages/staff/accountant/ReceiptStatisticsPage.jsx](client/src/pages/staff/accountant/ReceiptStatisticsPage.jsx)** (Mới)

   - Component chính hiển thị thống kê
   - Tích hợp Recharts cho các biểu đồ
   - Xử lý lọc theo ngày tháng

2. **[client/src/pages/staff/accountant/index.js](client/src/pages/staff/accountant/index.js)**

   - Export component mới: `ReceiptStatisticsPage`

3. **[client/src/App.jsx](client/src/App.jsx)**

   - Thêm route: `/accountant/receipts/statistics`
   - Import `ReceiptStatisticsPage`

4. **[client/src/config/menu.js](client/src/config/menu.js)**
   - Thêm menu item: "Thống Kê Phiếu Thu"
   - Icon: 📊
   - Path: `/accountant/receipts/statistics`

### Backend

1. **[server/routes/receipts.js](server/routes/receipts.js)**
   - Enhanced `/stats/summary` endpoint
   - Thêm `dailyStats` vào response
   - Tính toán doanh thu tích lũy theo ngày

## Cách Sử Dụng

### Truy Cập Trang

1. Đăng nhập với tài khoản Accountant hoặc Director
2. Từ menu bên trái, chọn **"Thống Kê Phiếu Thu"**
3. Hoặc truy cập trực tiếp: `/accountant/receipts/statistics`

### Lọc Dữ Liệu

1. Nhấp vào **RangePicker** để chọn ngày bắt đầu và ngày kết thúc
2. Nhấn nút **"Đặt lại"** để xóa bộ lọc
3. Dữ liệu sẽ tự động cập nhật

### Xuất Báo Cáo

- Nút **"Xuất báo cáo"** sẽ được cập nhật trong tương lai

## Phương Thức Thanh Toán Được Hỗ Trợ

| Mã            | Tên Tiếng Việt |
| ------------- | -------------- |
| cash          | Tiền mặt       |
| bank_transfer | Chuyển khoản   |
| credit_card   | Thẻ tín dụng   |
| momo          | MoMo           |
| refund        | Hoàn tiền      |
| other         | Khác           |

## Quyền Truy Cập

- ✅ **Accountant** (Kế toán)
- ✅ **Director** (Giám đốc)
- ❌ Các role khác không có quyền

## Công Nghệ Sử Dụng

- **React** - Frontend framework
- **Ant Design** - UI components (Card, Table, DatePicker, Button, etc.)
- **Recharts** - Thư viện biểu đồ
- **Dayjs** - Xử lý ngày tháng
- **MongoDB Aggregation** - Xử lý dữ liệu trên server

## Mở Rộng Trong Tương Lai

1. ✅ Xuất báo cáo thành PDF/Excel
2. ✅ Thêm thống kê theo học viên
3. ✅ So sánh doanh thu tháng này với tháng trước
4. ✅ Phân tích chi tiết theo lớp học
5. ✅ Biểu đồ heatmap theo ngày trong tuần

## Troubleshooting

### Không thấy trang thống kê

- Kiểm tra quyền truy cập (Accountant hoặc Director)
- Xóa cache và reload trang

### Không có dữ liệu hiển thị

- Kiểm tra khoảng thời gian chọn
- Đảm bảo có phiếu thu trong khoảng thời gian đó
- Kiểm tra backend có chạy bình thường

### Build lỗi

```bash
cd client
npm install
npm run build
```

---

**Tạo bởi**: AI Assistant  
**Ngày tạo**: 18/12/2024  
**Phiên bản**: 1.0
