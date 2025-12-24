/* SEED DATA - DIRECTOR DASHBOARD
   Mục tiêu: Tạo dữ liệu tổng thể (Học viên, Giáo viên, Tài chính 6 tháng, Hoạt động)
   để Dashboard Giám đốc hiển thị biểu đồ thực tế.
*/
const mongoose = require('mongoose');
require('dotenv').config();

// Import Models (Điều chỉnh đường dẫn theo dự án của bạn)
const Student = require('../src/shared/models/Student.model');
const Staff = require('../src/shared/models/Staff.model'); // Teacher is Staff with role teacher
const Course = require('../src/shared/models/Course.model');
const Class = require('../src/shared/models/Class.model');
const Receipt = require('../src/shared/models/Receipt.model');
// const ActivityLog = require('./models/ActivityLog'); // Nếu chưa có, có thể bỏ qua hoặc tạo model dummy

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/english_center_dev";
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ DB Connection Error:', error);
    process.exit(1);
  }
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDirector = async () => {
  await connectDB();
  console.log('🚀 Starting Director Data Seeding...');

  try {
    // 1. Tạo dữ liệu Doanh thu Lịch sử (6 tháng gần nhất)
    // Để biểu đồ Line Chart hiển thị được xu hướng
    const students = await Student.find();
    const classes = await Class.find();
    
    if (students.length < 10) {
      console.log('⚠️ Ít học viên quá, vui lòng chạy seedData.js cơ bản trước.');
      process.exit(1);
    }

    const receiptsToCreate = [];
    const today = new Date();
    
    // Loop qua 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0).getDate();
      
      // Mỗi tháng tạo random 5-15 giao dịch
      const txCount = getRandomInt(5, 15);
      
      for (let j = 0; j < txCount; j++) {
        const randomDay = getRandomInt(1, daysInMonth);
        const txDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);
        
        // Doanh thu tăng dần theo thời gian để biểu đồ đi lên (mô phỏng tăng trưởng)
        const baseAmount = 2000000 + ( (5-i) * 500000 ); 
        const amount = baseAmount + getRandomInt(-500000, 500000);

        receiptsToCreate.push({
          receiptNumber: `HIST-${txDate.getTime()}-${j}`,
          student: getRandomItem(students)._id,
          class: getRandomItem(classes)?._id,
          amount: amount,
          type: 'tuition',
          paymentMethod: getRandomItem(['cash', 'bank_transfer']),
          status: 'paid',
          createdAt: txDate,
          updatedAt: txDate
        });
      }
    }

    await Receipt.insertMany(receiptsToCreate);
    console.log(`💰 Đã thêm ${receiptsToCreate.length} giao dịch lịch sử cho biểu đồ doanh thu.`);

    // 2. Tạo Mock Hoạt động gần đây (Recent Activities)
    // Nếu bạn chưa có bảng ActivityLog, bước này chỉ mang tính tham khảo logic
    /* const activities = [
        { action: 'Đăng ký mới', desc: 'Nguyễn Văn A tham gia lớp IELTS', type: 'enrollment' },
        { action: 'Thanh toán', desc: 'Trần Thị B đóng học phí', type: 'payment' },
    ];
    // Insert activities...
    */

    console.log('🎉 Director Seeding Completed! Refresh Dashboard để xem kết quả.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDirector();