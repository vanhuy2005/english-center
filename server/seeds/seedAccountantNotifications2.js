const mongoose = require('mongoose');
require('dotenv').config();

async function seedAccountantNotifications() {
  try {
    await mongoose.connect('mongodb://localhost:27017/english_center_dev');
    console.log('✅ Connected to MongoDB\n');

    const Notification = require('../src/shared/models/Notification.model');
    const Finance = require('../src/shared/models/Finance.model');
    const Student = require('../src/shared/models/Student.model');
    const Course = require('../src/shared/models/Course.model');
    
    // ID của kế toán trong hệ thống
    const recipientId = new mongoose.Types.ObjectId('69466194ce185853c85d6a8d');
    
    console.log(`✅ Sẽ tạo notifications cho kế toán: ${recipientId}\n`);

    // Xóa notifications cũ
    const deleteResult = await Notification.deleteMany({ recipient: recipientId });
    console.log(`🗑️  Đã xóa ${deleteResult.deletedCount} notifications cũ\n`);

    // Lấy dữ liệu Finance
    const allFinances = await Finance.find()
      .populate('student', 'fullName studentCode phone')
      .populate('course', 'name')
      .sort({ createdAt: -1 });

    console.log(`📊 Tìm thấy ${allFinances.length} giao dịch Finance\n`);

    const notifications = [];

    // ============================================================
    // 1. THÔNG BÁO THANH TOÁN MỚI CẦN DUYỆT
    // ============================================================
    
    // Lấy các giao dịch "partial" (đã chuyển khoản nhưng chưa duyệt)
    const pendingApprovalPayments = allFinances
      .filter(f => f.status === 'partial' && f.paidAmount > 0 && f.paidAmount < f.amount)
      .slice(0, 8);

    console.log(`💳 Tạo ${pendingApprovalPayments.length} thông báo thanh toán cần duyệt...\n`);

    pendingApprovalPayments.forEach((finance, idx) => {
      const student = finance.student;
      const course = finance.course;
      const paidAmount = finance.paidAmount || 0;
      const remainingAmount = finance.remainingAmount || 0;
      const paymentMethod = finance.paymentMethod === 'bank_transfer' ? 'chuyển khoản ngân hàng' : 
                           finance.paymentMethod === 'momo' ? 'MoMo' :
                           finance.paymentMethod === 'credit_card' ? 'thẻ tín dụng' : 'tiền mặt';

      notifications.push({
        recipient: recipientId,
        type: 'payment_reminder',
        title: '💳 Thanh toán mới cần duyệt',
        message: `Học viên ${student?.fullName || 'N/A'} (${student?.studentCode || 'N/A'}) vừa thanh toán ${paidAmount.toLocaleString('vi-VN')}đ qua ${paymentMethod} cho khóa ${course?.name || 'N/A'}. Còn lại: ${remainingAmount.toLocaleString('vi-VN')}đ. Vui lòng duyệt để ghi nhận doanh thu.`,
        link: `/accountant/students/${student?._id}/payments`,
        relatedModel: 'Finance',
        relatedId: finance._id,
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - (idx * 15 + 5) * 60 * 1000), // Cách nhau 15 phút
      });
    });

    // Thêm một số thanh toán online đầy đủ cần duyệt
    const paidPayments = allFinances
      .filter(f => f.status === 'paid' && (f.paymentMethod === 'bank_transfer' || f.paymentMethod === 'momo'))
      .slice(0, 5);

    paidPayments.forEach((finance, idx) => {
      const student = finance.student;
      const course = finance.course;
      const paidAmount = finance.paidAmount || 0;
      const paymentMethod = finance.paymentMethod === 'bank_transfer' ? 'chuyển khoản' : 'MoMo';

      notifications.push({
        recipient: recipientId,
        type: 'system',
        title: '✅ Thanh toán online thành công',
        message: `Học viên ${student?.fullName || 'N/A'} (${student?.studentCode || 'N/A'}) đã thanh toán đầy đủ ${paidAmount.toLocaleString('vi-VN')}đ qua ${paymentMethod} cho khóa ${course?.name || 'N/A'}. Đã được duyệt tự động.`,
        link: `/accountant/students/${student?._id}/payments`,
        relatedModel: 'Finance',
        relatedId: finance._id,
        priority: 'normal',
        isRead: idx > 2, // 3 cái đầu chưa đọc
        readAt: idx > 2 ? new Date(Date.now() - 30 * 60 * 1000) : null,
        createdAt: new Date(Date.now() - (idx * 20 + 120) * 60 * 1000), // Cách nhau 20 phút, bắt đầu từ 2 giờ trước
      });
    });

    // ============================================================
    // 2. CẢNH BÁO NỢ PHÍ QUÁ HẠN
    // ============================================================
    
    const overdueFinances = allFinances.filter(f => f.status === 'overdue');
    const overdueTotal = overdueFinances.reduce((sum, f) => sum + (f.remainingAmount || f.amount), 0);
    const overdueCount = overdueFinances.length;

    console.log(`⚠️  Tìm thấy ${overdueCount} học viên nợ quá hạn\n`);

    if (overdueCount > 0) {
      // Thông báo tổng quát về nợ quá hạn
      notifications.push({
        recipient: recipientId,
        type: 'announcement',
        title: '⚠️ Cảnh báo: Nợ học phí quá hạn',
        message: `Hiện có ${overdueCount} học viên chưa thanh toán học phí đã quá hạn. Tổng số tiền nợ: ${overdueTotal.toLocaleString('vi-VN')}đ. Cần liên hệ nhắc nhở và lập kế hoạch thu hồi công nợ.`,
        link: '/accountant/tuition-status?status=overdue',
        priority: 'urgent',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
      });

      // Thông báo chi tiết từng học viên nợ quá hạn
      const topOverdueStudents = overdueFinances
        .sort((a, b) => (b.remainingAmount || b.amount) - (a.remainingAmount || a.amount))
        .slice(0, 10); // Top 10 học viên nợ nhiều nhất

      topOverdueStudents.forEach((finance, idx) => {
        const student = finance.student;
        const course = finance.course;
        const overdueAmount = finance.remainingAmount || finance.amount;
        const dueDate = finance.dueDate;
        const overdueDays = dueDate ? Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        notifications.push({
          recipient: recipientId,
          type: 'payment_reminder',
          title: `⚠️ Học viên nợ quá hạn ${overdueDays} ngày`,
          message: `Học viên ${student?.fullName || 'N/A'} (${student?.studentCode || 'N/A'}) đã quá hạn thanh toán ${overdueDays} ngày. Số tiền nợ: ${overdueAmount.toLocaleString('vi-VN')}đ cho khóa ${course?.name || 'N/A'}. SĐT: ${student?.phone || 'N/A'}. Cần liên hệ ngay!`,
          link: `/accountant/students/${student?._id}/payments`,
          relatedModel: 'Finance',
          relatedId: finance._id,
          priority: overdueDays > 30 ? 'urgent' : 'high',
          isRead: false,
          createdAt: new Date(Date.now() - (idx * 10 + 40) * 60 * 1000), // Cách nhau 10 phút
        });
      });
    }

    // ============================================================
    // 3. CẢNH BÁO SẮP ĐẾN HẠN THANH TOÁN
    // ============================================================
    
    const now = Date.now();
    const threeDaysLater = now + (3 * 24 * 60 * 60 * 1000);
    
    const upcomingDueFinances = allFinances.filter(f => {
      if (f.status !== 'pending' && f.status !== 'partial') return false;
      if (!f.dueDate) return false;
      const dueTime = new Date(f.dueDate).getTime();
      return dueTime > now && dueTime <= threeDaysLater;
    });

    console.log(`📅 Tìm thấy ${upcomingDueFinances.length} học viên sắp đến hạn thanh toán\n`);

    if (upcomingDueFinances.length > 0) {
      const upcomingTotal = upcomingDueFinances.reduce((sum, f) => sum + (f.remainingAmount || f.amount), 0);

      notifications.push({
        recipient: recipientId,
        type: 'payment_reminder',
        title: '📅 Nhắc nhở: Học phí sắp đến hạn',
        message: `Có ${upcomingDueFinances.length} học viên sắp đến hạn thanh toán trong 3 ngày tới. Tổng số tiền: ${upcomingTotal.toLocaleString('vi-VN')}đ. Cần nhắc nhở để tránh quá hạn.`,
        link: '/accountant/tuition-status?status=pending',
        priority: 'normal',
        isRead: false,
        createdAt: new Date(Date.now() - 90 * 60 * 1000), // 1.5 giờ trước
      });
    }

    // ============================================================
    // 4. BÁO CÁO TỔNG QUAN
    // ============================================================
    
    const totalRevenue = allFinances
      .filter(f => f.status === 'paid' || f.status === 'partial')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    
    const pendingCount = allFinances.filter(f => f.status === 'pending').length;
    const totalPending = allFinances
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    notifications.push({
      recipient: recipientId,
      type: 'announcement',
      title: '📊 Báo cáo tài chính tháng 12/2025',
      message: `Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')}đ. Chờ thu: ${totalPending.toLocaleString('vi-VN')}đ (${pendingCount} học viên). Quá hạn: ${overdueTotal.toLocaleString('vi-VN')}đ (${overdueCount} học viên). Cần xử lý ${pendingApprovalPayments.length} giao dịch đang chờ duyệt.`,
      link: '/accountant/dashboard',
      priority: 'high',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
    });

    // ============================================================
    // 5. THÔNG BÁO HỆ THỐNG KHÁC
    // ============================================================
    
    notifications.push(
      {
        recipient: recipientId,
        type: 'announcement',
        title: '📋 Thông báo kiểm tra sổ quỹ',
        message: 'Phòng Kế toán sẽ tiến hành kiểm tra sổ quỹ vào ngày 26/12/2025. Vui lòng chuẩn bị đầy đủ chứng từ và đối chiếu số liệu.',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        recipient: recipientId,
        type: 'request_response',
        title: '💰 Yêu cầu hoàn tiền học phí',
        message: 'Có 1 yêu cầu hoàn tiền học phí từ học viên Nguyễn Thị Mai đang chờ xử lý. Vui lòng kiểm tra lý do và xử lý trong 3 ngày làm việc.',
        isRead: true,
        readAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        priority: 'normal',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }
    );

    // Insert vào database
    const insertResult = await Notification.insertMany(notifications);
    console.log(`✅ Đã tạo ${insertResult.length} notifications\n`);

    // Thống kê
    const totalNotifications = await Notification.countDocuments({ recipient: recipientId });
    const unreadNotifications = await Notification.countDocuments({ recipient: recipientId, isRead: false });

    const overdueNotifCount = overdueCount > 0 ? (Math.min(overdueCount, 10) + 1) : 0;
    
    console.log('='.repeat(70));
    console.log('📊 THỐNG KÊ NOTIFICATIONS');
    console.log('='.repeat(70));
    console.log('Tổng số notifications:', totalNotifications);
    console.log('Chưa đọc:', unreadNotifications);
    console.log('Đã đọc:', totalNotifications - unreadNotifications);
    console.log('\n📋 Chi tiết:');
    console.log(`   💳 Thanh toán cần duyệt: ${pendingApprovalPayments.length + paidPayments.length}`);
    console.log(`   ⚠️  Nợ quá hạn: ${overdueNotifCount}`);
    console.log(`   📅 Sắp đến hạn: ${upcomingDueFinances.length > 0 ? 1 : 0}`);
    console.log(`   📊 Báo cáo và hệ thống: 3`);
    console.log('='.repeat(70));

    console.log('\n✅ Hoàn thành! Refresh trang để xem notifications mới.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedAccountantNotifications();
