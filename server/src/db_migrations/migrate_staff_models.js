/**
 * Migration Script: Merge Staff Models
 * Chuyển đổi dữ liệu từ AcademicStaff, EnrollmentStaff, Accountant sang Staff model thống nhất
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");

const migrateStaffModels = async () => {
  try {
    console.log("🔄 Starting staff models migration...\n");

    await connectDB();

    const db = mongoose.connection.db;

    // Kiểm tra các collection cũ có tồn tại không
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const oldCollections = {
      academicstaffs: "academic",
      enrollmentstaffs: "enrollment",
      accountants: "accountant",
    };

    let totalMigrated = 0;

    for (const [oldCollection, staffType] of Object.entries(oldCollections)) {
      if (collectionNames.includes(oldCollection)) {
        console.log(`📦 Migrating ${oldCollection}...`);

        const oldData = await db.collection(oldCollection).find({}).toArray();

        if (oldData.length > 0) {
          // Chuyển đổi dữ liệu sang format mới
          const newData = oldData.map((doc) => ({
            user: doc.user,
            staffCode: doc.staffCode,
            staffType: staffType,
            dateOfBirth: doc.dateOfBirth,
            gender: doc.gender,
            address: doc.address,
            employmentStatus: doc.employmentStatus || "active",
            dateJoined: doc.dateJoined,
            dateLeft: doc.dateLeft,
            department: doc.department,
            position: doc.position,
            responsibilities: doc.responsibilities,
            managedClasses: doc.managedClasses || [],
            accessLevel: doc.accessLevel,
            performanceMetrics: doc.performanceMetrics || {},
            notes: doc.notes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          }));

          // Insert vào collection staffs
          await db.collection("staffs").insertMany(newData);
          console.log(`✅ Migrated ${newData.length} records from ${oldCollection}`);
          totalMigrated += newData.length;

          // Xóa collection cũ
          await db.collection(oldCollection).drop();
          console.log(`🗑️  Dropped old collection: ${oldCollection}\n`);
        } else {
          console.log(`⚠️  No data found in ${oldCollection}\n`);
        }
      } else {
        console.log(`⚠️  Collection ${oldCollection} not found, skipping...\n`);
      }
    }

    console.log(`\n✅ Migration completed! Total migrated: ${totalMigrated} records`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

// Run migration
migrateStaffModels();
