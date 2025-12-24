const mongoose = require("mongoose");
const Finance = require("../src/shared/models/Finance.model");

const checkPaymentMethods = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/english_center_dev");
    console.log("✅ Connected to MongoDB\n");

    const finances = await Finance.find().lean();
    console.log(`📊 Tổng số Finance records: ${finances.length}\n`);

    // Group by paymentMethod
    const byMethod = {};
    finances.forEach((f) => {
      const method = f.paymentMethod || "null";
      if (!byMethod[method]) {
        byMethod[method] = { count: 0, totalPaid: 0 };
      }
      byMethod[method].count++;
      byMethod[method].totalPaid += f.paidAmount || 0;
    });

    console.log("📋 Phân bố theo phương thức thanh toán:");
    Object.entries(byMethod).forEach(([method, data]) => {
      console.log(`  ${method}: ${data.count} giao dịch, ${data.totalPaid.toLocaleString('vi-VN')} đ`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
};

checkPaymentMethods();
