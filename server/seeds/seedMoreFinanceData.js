const mongoose = require("mongoose");

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/english_center_dev", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Models
const Finance = mongoose.model(
  "Finance",
  new mongoose.Schema({
    transactionCode: String,
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    amount: Number,
    paidAmount: Number,
    remainingAmount: Number,
    paymentMethod: String,
    status: String,
    paidDate: Date,
    dueDate: Date,
    description: String,
    createdAt: Date,
    updatedAt: Date,
  })
);

const Student = mongoose.model("Student", new mongoose.Schema({}));
const Course = mongoose.model("Course", new mongoose.Schema({}));

// Random helpers
const randomAmount = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min) * 1000000;
const randomDate = (start, end) =>
  new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
const randomStatus = () => {
  const rand = Math.random();
  if (rand < 0.35) return "paid";        // 35% paid
  if (rand < 0.60) return "partial";     // 25% partial
  if (rand < 0.90) return "pending";     // 30% pending
  return "overdue";                       // 10% overdue
};
const randomPaymentMethod = () =>
  ["cash", "bank_transfer", "momo", "credit_card"][
    Math.floor(Math.random() * 4)
  ];

// Seed function
const seedFinanceData = async () => {
  try {
    await connectDB();

    console.log("🔍 Fetching students and courses...");
    const students = await Student.find().limit(50);
    const courses = await Course.find().limit(20);

    if (students.length === 0 || courses.length === 0) {
      console.log("❌ No students or courses found! Run student/course seeds first.");
      process.exit(1);
    }

    console.log(`✅ Found ${students.length} students and ${courses.length} courses`);

    // Xóa dữ liệu Finance cũ
    console.log("🗑️  Clearing old Finance data...");
    await Finance.deleteMany({});

    const financeData = [];
    const startDate = new Date("2025-12-18T00:00:00");
    const endDate = new Date("2025-12-23T23:59:59");

    // Tạo 100 Finance records với số tiền từ 5-8 triệu
    console.log("📝 Creating 100 finance records (5-8 triệu VND, Dec 18-23)...");
    
    for (let i = 0; i < 100; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const course = courses[Math.floor(Math.random() * courses.length)];
      const amount = randomAmount(5, 8); // 5-8 triệu
      const status = randomStatus();
      
      let paidAmount = 0;
      if (status === "paid") {
        paidAmount = amount;
      } else if (status === "partial") {
        paidAmount = Math.floor(amount * (0.3 + Math.random() * 0.5)); // 30-80%
      }

      const createdAt = randomDate(startDate, endDate);
      const paidDate = status === "paid" ? createdAt : status === "partial" ? randomDate(createdAt, endDate) : null;
      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + 30); // Hạn thanh toán sau 30 ngày

      financeData.push({
        transactionCode: `TXN${String(i + 1).padStart(6, "0")}`,
        student: student._id,
        course: course._id,
        amount,
        paidAmount,
        remainingAmount: amount - paidAmount,
        paymentMethod: randomPaymentMethod(),
        status,
        paidDate,
        dueDate,
        description: `Học phí khóa ${course.name || "học"} - Kỳ ${Math.floor(Math.random() * 3) + 1}`,
        createdAt,
        updatedAt: createdAt,
      });
    }

    console.log("💾 Inserting finance records...");
    await Finance.insertMany(financeData);

    // Thống kê
    const stats = {
      total: financeData.length,
      totalAmount: financeData.reduce((sum, f) => sum + f.amount, 0),
      totalPaid: financeData.reduce((sum, f) => sum + f.paidAmount, 0),
      totalRemaining: financeData.reduce((sum, f) => sum + f.remainingAmount, 0),
      byStatus: {
        paid: financeData.filter((f) => f.status === "paid").length,
        partial: financeData.filter((f) => f.status === "partial").length,
        pending: financeData.filter((f) => f.status === "pending").length,
        overdue: financeData.filter((f) => f.status === "overdue").length,
      },
      byPaymentMethod: {
        cash: financeData.filter((f) => f.paymentMethod === "cash").length,
        bank_transfer: financeData.filter((f) => f.paymentMethod === "bank_transfer").length,
        momo: financeData.filter((f) => f.paymentMethod === "momo").length,
        credit_card: financeData.filter((f) => f.paymentMethod === "credit_card").length,
      },
    };

    console.log("\n✅ Finance Data Seeded Successfully!");
    console.log("=" .repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total Records: ${stats.total}`);
    console.log(`   Total Amount: ${(stats.totalAmount / 1000000).toFixed(1)}M VND`);
    console.log(`   Total Paid: ${(stats.totalPaid / 1000000).toFixed(1)}M VND`);
    console.log(`   Total Remaining: ${(stats.totalRemaining / 1000000).toFixed(1)}M VND`);
    console.log(`\n📈 By Status:`);
    console.log(`   Paid: ${stats.byStatus.paid}`);
    console.log(`   Partial: ${stats.byStatus.partial}`);
    console.log(`   Pending: ${stats.byStatus.pending}`);
    console.log(`   Overdue: ${stats.byStatus.overdue}`);
    console.log(`\n💳 By Payment Method:`);
    console.log(`   Cash: ${stats.byPaymentMethod.cash}`);
    console.log(`   Bank Transfer: ${stats.byPaymentMethod.bank_transfer}`);
    console.log(`   Momo: ${stats.byPaymentMethod.momo}`);
    console.log(`   Credit Card: ${stats.byPaymentMethod.credit_card}`);
    console.log("=" .repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

// Run seed
seedFinanceData();
