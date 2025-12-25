# HƯỚNG DẪN TEST & FIX BÁO CÁO DOANH THU

## ✅ ĐÃ FIX

### 1. Client Side (RevenueReportPage.jsx)

- ✅ Thay đổi từ dùng 100% mock data sang gọi API thực tế
- ✅ Gọi `reportService.getRevenueStats()` để lấy tổng quan
- ✅ Gọi `reportService.getRevenueChart()` để lấy dữ liệu biểu đồ
- ✅ Tự động tính toán Revenue Sources và Expense Breakdown từ chart data
- ✅ Fallback về mock data nếu API lỗi

### 2. Server Side (director.controller.js)

- ✅ Fix `getRevenueStats()` - Thêm field `margin` (tỷ suất lợi nhuận)
- ✅ Fix `getRevenueChartData()` - Cập nhật công thức tính profit/expenses
  - Old: Profit = 70%, Expenses = 30%
  - New: Profit = 35%, Expenses = 65% (thực tế hơn)

## 📊 CÁCH HOẠT ĐỘNG

### Flow Data:

```
Database (Finance Model - paid records)
    ↓
getRevenueChartData() - Aggregate by month
    ↓
Return: [{ month, revenue, profit, expenses }]
    ↓
Client tính toán:
  - Revenue Sources (85% học phí, 10% giáo trình, 4% thi, 1% khác)
  - Expense Breakdown (50% lương GV, 25% lương NV, 15% mặt bằng, ...)
```

## 🧪 CÁCH TEST

### Bước 1: Kiểm tra có dữ liệu Finance không

```bash
cd server
node -e "require('./src/config/database')().then(() => { const Finance = require('./src/shared/models/Finance.model'); Finance.countDocuments().then(count => { console.log('Finance records:', count); process.exit(0); }); });"
```

### Bước 2: Nếu chưa có dữ liệu, chạy seed

**Option A: Seed Finance data riêng (nếu có script)**

```bash
cd server
node seeds/seedFinanceData.js
```

**Option B: Tạo finance records từ enrollment (recommended)**

```bash
cd server
node -e "
const connectDB = require('./src/config/database');
const Finance = require('./src/shared/models/Finance.model');
const Student = require('./src/shared/models/Student.model');
const Class = require('./src/shared/models/Class.model');

(async () => {
  await connectDB();

  const students = await Student.find().limit(20);
  const classes = await Class.find().limit(5);

  const finances = [];
  const today = new Date();

  // Tạo 50 records cho 6 tháng gần nhất
  for (let month = 5; month >= 0; month--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - month, 1);

    for (let i = 0; i < 8; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const cls = classes[Math.floor(Math.random() * classes.length)];
      const amount = 3000000 + Math.floor(Math.random() * 7000000); // 3-10M

      finances.push({
        student: student._id,
        class: cls._id,
        amount: amount,
        paidAmount: amount,
        type: 'tuition',
        status: 'paid',
        paymentMethod: 'bank_transfer',
        paidDate: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1),
        createdAt: monthDate
      });
    }
  }

  await Finance.insertMany(finances);
  console.log('✅ Created', finances.length, 'finance records');
  process.exit(0);
})();
"
```

### Bước 3: Restart server

```bash
cd server
npm run dev
```

### Bước 4: Test API trực tiếp

**Test Revenue Stats:**

```bash
# Thay YOUR_DIRECTOR_TOKEN bằng token thực
curl -X GET "http://localhost:3000/api/director/reports/revenue-stats" \
  -H "Authorization: Bearer YOUR_DIRECTOR_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 360000000,
    "totalProfit": 126000000,
    "totalExpenses": 234000000,
    "growth": 12.5,
    "margin": 35.0
  }
}
```

**Test Revenue Chart:**

```bash
curl -X GET "http://localhost:3000/api/director/reports/charts/revenue?period=month&limit=12" \
  -H "Authorization: Bearer YOUR_DIRECTOR_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "T1",
      "month": "T1",
      "revenue": 45000000,
      "profit": 15750000,
      "expenses": 29250000
    },
    ...
  ]
}
```

### Bước 5: Test trên UI

1. Login với tài khoản Director
2. Vào trang "Báo Cáo Tài Chính"
3. Kiểm tra:
   - ✅ Statistics Cards hiển thị số liệu
   - ✅ Biểu đồ "Doanh Thu & Lợi Nhuận" có 3 đường (revenue, profit, expenses)
   - ✅ Pie Chart "Cơ Cấu Nguồn Thu" hiển thị 4 phần
   - ✅ Bar Chart "Phân Bổ Chi Phí" hiển thị 5 thanh
4. Thử chuyển filter (Tuần này / Tháng này / Quý này / Năm nay)
5. Check Console (F12) xem có lỗi API không

## 🐛 TROUBLESHOOTING

### Issue 1: Biểu đồ không hiển thị

**Check:**

- Open DevTools (F12) → Console tab
- Xem có lỗi API 401/403/404 không
- Nếu có 401: Token hết hạn, login lại
- Nếu có 404: Endpoint sai, check server routes

**Solution:**

```javascript
// Client sẽ tự động fallback về mock data nếu API lỗi
// Check console để biết lý do:
console.error("Revenue stats error:", err); // Xem lỗi này
```

### Issue 2: API trả về nhưng data = 0

**Check:**

```bash
# Verify Finance records exist
cd server
node -e "require('./src/config/database')().then(() => { const Finance = require('./src/shared/models/Finance.model'); Finance.find({ status: 'paid' }).limit(5).then(docs => { console.log(docs); process.exit(0); }); });"
```

**Solution:** Chạy lại seed script (Bước 2 Option B)

### Issue 3: Pie Chart & Bar Chart rỗng

**Nguyên nhân:** Chart data từ API trống hoặc không đúng format

**Check:**

```javascript
// Trong RevenueReportPage.jsx, thêm log:
console.log("Chart data received:", chartDataRes);
console.log("Source data calculated:", sourceData);
console.log("Expense data calculated:", expenseData);
```

**Solution:**

- Nếu chartDataRes rỗng → Chạy seed data
- Nếu calculation sai → Check logic tính toán ở dòng 26-46 trong RevenueReportPage.jsx

## 📝 NOTES

1. **Profit Margin:** Hiện tại hardcode 35% (có thể điều chỉnh trong controller)
2. **Expense Breakdown:** Tính toán ước lượng (50% lương GV, 25% lương NV, ...)
3. **Revenue Sources:** Tính toán ước lượng (85% học phí, 10% giáo trình, ...)
4. **Transactions Table:** Vẫn dùng mock data (chưa có API getRecentTransactions)

## 🚀 NEXT STEPS (Optional)

Nếu muốn data chính xác hơn:

1. **Thêm field `type` vào Finance model:**

   ```javascript
   type: {
     type: String,
     enum: ['tuition', 'material', 'exam_fee', 'other'],
     default: 'tuition'
   }
   ```

2. **Tạo Expense model riêng:**

   ```javascript
   {
     category: String, // 'salary_teacher', 'salary_staff', 'rent', 'marketing', 'other'
     amount: Number,
     month: Date,
     ...
   }
   ```

3. **Implement API `getRevenueBreakdown()` và `getExpenseBreakdown()`**

4. **Update RevenueReportPage để gọi 2 API mới này**
