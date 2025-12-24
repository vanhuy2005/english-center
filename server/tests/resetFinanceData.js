const mongoose = require('mongoose');
require('dotenv').config();

async function resetFinanceData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/english_center_dev');
    console.log('✅ Connected to MongoDB\n');

    const Finance = require('../src/shared/models/Finance.model');
    const Student = require('../src/shared/models/Student.model');
    const Course = require('../src/shared/models/Course.model');

    // 1. Xóa toàn bộ dữ liệu Finance cũ
    const deleteResult = await Finance.deleteMany({});
    console.log(`🗑️  Đã xóa ${deleteResult.deletedCount} records cũ\n`);

    // 2. Lấy dữ liệu cần thiết
    const students = await Student.find().limit(10);
    const courses = await Course.find().limit(5);
    
    // Tạo ObjectId mặc định cho createdBy
    const defaultCreatedBy = new mongoose.Types.ObjectId();

    if (!students.length || !courses.length) {
      console.error('❌ Không tìm thấy dữ liệu Student hoặc Course');
      console.log('Students found:', students.length);
      console.log('Courses found:', courses.length);
      process.exit(1);
    }
    
    console.log(`✅ Tìm thấy ${students.length} students và ${courses.length} courses\n`);

    // 3. Tạo 10 records mới với tổng doanh thu ~10 triệu
    const newFinances = [];
    const amounts = [1200000, 1500000, 800000, 1000000, 900000, 1100000, 1300000, 700000, 1000000, 500000];
    const statuses = ['paid', 'paid', 'paid', 'paid', 'paid', 'partial', 'partial', 'pending', 'pending', 'overdue'];
    const paymentMethods = ['bank_transfer', 'cash', 'momo', 'bank_transfer', 'cash', 'bank_transfer', 'cash', 'cash', 'bank_transfer', 'momo'];

    for (let i = 0; i < 10; i++) {
      const student = students[i % students.length];
      const course = courses[i % courses.length];
      const amount = amounts[i];
      const status = statuses[i];
      const paymentMethod = paymentMethods[i];

      let paidAmount = 0;
      let paidDate = null;

      if (status === 'paid') {
        paidAmount = amount;
        // Tất cả thanh toán vào ngày 24/12/2025
        paidDate = new Date('2025-12-24T10:00:00');
      } else if (status === 'partial') {
        paidAmount = Math.floor(amount * 0.5); // Đã trả 50%
        paidDate = new Date('2025-12-24T14:00:00'); // Cùng ngày 24/12
      }

      const remainingAmount = amount - paidAmount;

      newFinances.push({
        transactionCode: `FIN${Date.now()}${i}`,
        student: student._id,
        course: course._id,
        type: 'tuition',
        amount: amount,
        paymentMethod: paymentMethod,
        status: status,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        dueDate: new Date(Date.now() + 30 * 86400000), // 30 ngày sau
        paidDate: paidDate,
        description: `Học phí khóa ${course.name}`,
        createdBy: defaultCreatedBy,
      });
    }

    const insertResult = await Finance.insertMany(newFinances);
    console.log(`✅ Đã tạo ${insertResult.length} records mới\n`);

    // 4. Tính toán thống kê
    const stats = await Finance.aggregate([
      { $match: { status: { $in: ['paid', 'partial'] } } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$paidAmount' },
          totalRecords: { $sum: 1 }
        } 
      }
    ]);

    const allRecords = await Finance.countDocuments();

    console.log('='.repeat(60));
    console.log('📊 THỐNG KÊ SAU KHI RESET');
    console.log('='.repeat(60));
    console.log('Tổng số records:', allRecords);
    console.log('Records đã thanh toán:', stats[0]?.totalRecords || 0);
    console.log('💰 TỔNG DOANH THU:', (stats[0]?.totalRevenue || 0).toLocaleString('vi-VN'), 'VNĐ');
    console.log('='.repeat(60));

    const byStatus = await Finance.aggregate([
      { 
        $group: { 
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          paidAmount: { $sum: '$paidAmount' }
        } 
      }
    ]);

    console.log('\n📋 PHÂN BỐ THEO TRẠNG THÁI:');
    byStatus.forEach(s => {
      console.log(`\n${s._id.toUpperCase()}:`);
      console.log(`  - Số lượng: ${s.count}`);
      console.log(`  - Tổng tiền: ${s.totalAmount.toLocaleString('vi-VN')} VNĐ`);
      console.log(`  - Đã thu: ${s.paidAmount.toLocaleString('vi-VN')} VNĐ`);
    });

    console.log('\n✅ Hoàn thành!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

resetFinanceData();
