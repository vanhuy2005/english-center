/**
 * Script: Export Database Schema & Data Statistics
 * Truy vấn trực tiếp MongoDB, xuất toàn bộ schema + thống kê dữ liệu ra file .md
 *
 * Chạy: node scripts/exportDatabaseSchema.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import all models
const Student = require("../src/shared/models/Student.model");
const Staff = require("../src/shared/models/Staff.model");
const Course = require("../src/shared/models/Course.model");
const Class = require("../src/shared/models/Class.model");
const Attendance = require("../src/shared/models/Attendance.model");
const Grade = require("../src/shared/models/Grade.model");
const Finance = require("../src/shared/models/Finance.model");
const Payment = require("../src/shared/models/Payment.model");
const Receipt = require("../src/shared/models/Receipt.model");
const TuitionFee = require("../src/shared/models/TuitionFee.model");
const Notification = require("../src/shared/models/Notification.model");
const Request = require("../src/shared/models/Request.model");
const Schedule = require("../src/shared/models/Schedule.model");
const Counter = require("../src/shared/models/Counter.model");

const MODELS = [
  { name: "Student", model: Student, collection: "students" },
  { name: "Staff", model: Staff, collection: "staffs" },
  { name: "Course", model: Course, collection: "courses" },
  { name: "Class", model: Class, collection: "classes" },
  { name: "Attendance", model: Attendance, collection: "attendances" },
  { name: "Grade", model: Grade, collection: "grades" },
  { name: "Finance", model: Finance, collection: "finances" },
  { name: "Payment", model: Payment, collection: "payments" },
  { name: "Receipt", model: Receipt, collection: "receipts" },
  { name: "TuitionFee", model: TuitionFee, collection: "tuitionfees" },
  { name: "Notification", model: Notification, collection: "notifications" },
  { name: "Request", model: Request, collection: "requests" },
  { name: "Schedule", model: Schedule, collection: "schedules" },
  { name: "Counter", model: Counter, collection: "counters" },
];

/**
 * Trích xuất schema fields từ Mongoose model
 */
function extractSchemaFields(schema, prefix = "") {
  const fields = [];
  schema.eachPath((pathName, schemaType) => {
    if (pathName === "__v") return;

    const fullPath = prefix ? `${prefix}.${pathName}` : pathName;
    const field = {
      path: fullPath,
      type: getSchemaType(schemaType),
      required: schemaType.isRequired || false,
      unique: schemaType.options?.unique || false,
      default: getDefaultValue(schemaType),
      enum: schemaType.options?.enum || schemaType.enumValues || null,
      ref: schemaType.options?.ref || null,
      index: schemaType.options?.index || schemaType.options?.unique || false,
      select: schemaType.options?.select,
      min: schemaType.options?.min,
      max: schemaType.options?.max,
      sparse: schemaType.options?.sparse || false,
    };
    fields.push(field);
  });
  return fields;
}

function getSchemaType(schemaType) {
  if (schemaType.instance) return schemaType.instance;
  if (schemaType.options?.type) {
    if (Array.isArray(schemaType.options.type)) return "Array";
    return schemaType.options.type.name || String(schemaType.options.type);
  }
  return "Mixed";
}

function getDefaultValue(schemaType) {
  const def = schemaType.options?.default;
  if (def === undefined) return "-";
  if (typeof def === "function") {
    if (def === Date.now) return "Date.now";
    return "Function";
  }
  if (def === "") return '""';
  return JSON.stringify(def);
}

/**
 * Lấy thống kê dữ liệu thực tế từ DB
 */
async function getCollectionStats(model, collectionName) {
  try {
    const count = await model.countDocuments();
    const stats = { count };

    if (count > 0) {
      // Lấy 1 sample document để xem cấu trúc thực tế
      const sample = await model.findOne().lean();
      if (sample) {
        stats.sampleKeys = Object.keys(sample);
      }

      // Lấy thống kê theo từng collection
      const db = mongoose.connection.db;
      try {
        const collStats = await db.command({ collStats: collectionName });
        stats.size = formatBytes(collStats.size || 0);
        stats.avgObjSize = formatBytes(collStats.avgObjSize || 0);
        stats.storageSize = formatBytes(collStats.storageSize || 0);
        stats.nindexes = collStats.nindexes || 0;
      } catch {
        // collStats may not be available on all MongoDB versions
      }
    }
    return stats;
  } catch (err) {
    return { count: 0, error: err.message };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Lấy distinct values cho các enum fields
 */
async function getDistinctValues(model, fieldPath) {
  try {
    return await model.distinct(fieldPath);
  } catch {
    return [];
  }
}

/**
 * Lấy indexes thực tế từ MongoDB
 */
async function getIndexes(collectionName) {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    return await collection.indexes();
  } catch {
    return [];
  }
}

/**
 * Generate markdown content
 */
async function generateMarkdown() {
  const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const dbName = mongoose.connection.db.databaseName;

  let md = `# 📊 DATABASE SCHEMA - English Center Management System\n\n`;
  md += `> **Tự động xuất từ MongoDB database**\n>\n`;
  md += `> **Database:** \`${dbName}\`\n>\n`;
  md += `> **Ngày xuất:** ${now}\n>\n`;
  md += `> **MongoDB URI:** \`${maskConnectionString(mongoose.connection.host)}\`\n\n`;
  md += `---\n\n`;

  // Tổng quan
  md += `## 📋 Tổng Quan Collections\n\n`;
  md += `| # | Collection | Model | Số Documents | Dung Lượng | Indexes |\n`;
  md += `|---|-----------|-------|-------------|------------|----------|\n`;

  const allStats = [];
  for (let i = 0; i < MODELS.length; i++) {
    const { name, model, collection } = MODELS[i];
    const stats = await getCollectionStats(model, collection);
    allStats.push({ ...MODELS[i], stats });
    md += `| ${i + 1} | \`${collection}\` | ${name} | ${stats.count} | ${stats.size || "-"} | ${stats.nindexes || "-"} |\n`;
  }

  // Kiểm tra collections không có model
  const db = mongoose.connection.db;
  const existingCollections = await db.listCollections().toArray();
  const modelCollections = MODELS.map((m) => m.collection);
  const unmappedCollections = existingCollections.filter(
    (c) => !modelCollections.includes(c.name) && !c.name.startsWith("system.")
  );

  if (unmappedCollections.length > 0) {
    md += `\n### ⚠️ Collections không có Model (Legacy/Orphaned)\n\n`;
    md += `| Collection | Số Documents |\n`;
    md += `|-----------|-------------|\n`;
    for (const col of unmappedCollections) {
      const count = await db.collection(col.name).countDocuments();
      md += `| \`${col.name}\` | ${count} |\n`;
    }
  }

  md += `\n---\n\n`;

  // Chi tiết từng collection
  md += `## 📑 Chi Tiết Schema Từng Collection\n\n`;

  for (const { name, model, collection, stats } of allStats) {
    md += `### ${getEmoji(name)} ${name} (\`${collection}\`)\n\n`;
    md += `- **Documents:** ${stats.count}\n`;
    if (stats.size) md += `- **Dung lượng:** ${stats.size}\n`;
    if (stats.avgObjSize) md += `- **Kích thước trung bình/doc:** ${stats.avgObjSize}\n`;
    md += `\n`;

    // Schema fields
    const fields = extractSchemaFields(model.schema);
    md += `#### Schema Fields\n\n`;
    md += `| Field | Type | Required | Unique | Default | Enum Values | Ref |\n`;
    md += `|-------|------|----------|--------|---------|-------------|-----|\n`;

    for (const f of fields) {
      const enumStr = f.enum && Array.isArray(f.enum) && f.enum.length > 0
        ? `\`${f.enum.join("`, `")}\``
        : "-";
      const required = f.required ? "✅" : "-";
      const unique = f.unique ? "✅" : "-";
      const ref = f.ref ? `\`${f.ref}\`` : "-";
      const defaultVal = f.default === "-" ? "-" : `\`${f.default}\`` ;
      const selectNote = f.select === false ? " *(hidden)*" : "";

      md += `| \`${f.path}\`${selectNote} | ${f.type} | ${required} | ${unique} | ${defaultVal} | ${enumStr} | ${ref} |\n`;
    }

    // Indexes
    const indexes = await getIndexes(collection);
    if (indexes.length > 0) {
      md += `\n#### Indexes\n\n`;
      md += `| Tên Index | Fields | Unique | Sparse |\n`;
      md += `|-----------|--------|--------|--------|\n`;
      for (const idx of indexes) {
        const keyStr = Object.entries(idx.key)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        md += `| \`${idx.name}\` | ${keyStr} | ${idx.unique ? "✅" : "-"} | ${idx.sparse ? "✅" : "-"} |\n`;
      }
    }

    // Giá trị thực tế đang có trong DB cho các enum fields
    // Các field nhạy cảm không hiển thị distinct values
    const sensitiveFields = ["password", "refreshToken", "email", "phone", "address"];
    const enumFields = fields.filter(
      (f) => f.enum && Array.isArray(f.enum) && f.enum.length > 0 && !sensitiveFields.includes(f.path)
    );
    if (enumFields.length > 0 && stats.count > 0) {
      md += `\n#### Giá Trị Thực Tế Trong DB\n\n`;
      for (const ef of enumFields) {
        const distinctVals = await getDistinctValues(model, ef.path);
        if (distinctVals.length > 0) {
          md += `- **${ef.path}:** \`${distinctVals.join("`, `")}\`\n`;
        }
      }
    }

    // Sample document
    if (stats.count > 0) {
      md += `\n#### Mẫu Dữ Liệu (1 Document)\n\n`;
      md += `\`\`\`json\n`;
      const sample = await model.findOne().select("-password -refreshToken").lean();
      if (sample) {
        md += JSON.stringify(sample, null, 2);
      }
      md += `\n\`\`\`\n`;
    }

    md += `\n---\n\n`;
  }

  // Relationships diagram 
  md += `## 🔗 Quan Hệ Giữa Các Collections\n\n`;
  md += `\`\`\`\n`;
  md += `Student ──┬── enrolledCourses ──────> Course\n`;
  md += `          ├── attendance ────────────> Attendance\n`;
  md += `          └── financialRecords ──────> Finance\n`;
  md += `\n`;
  md += `Class ────┬── course ───────────────> Course\n`;
  md += `          ├── teacher ──────────────> Staff\n`;
  md += `          └── students[].student ───> Student\n`;
  md += `\n`;
  md += `Grade ────┬── student ──────────────> Student\n`;
  md += `          ├── class ────────────────> Class\n`;
  md += `          ├── course ───────────────> Course\n`;
  md += `          └── gradedBy ─────────────> Staff\n`;
  md += `\n`;
  md += `Attendance ┬── student ─────────────> Student\n`;
  md += `           └── class ───────────────> Class\n`;
  md += `\n`;
  md += `Finance ──┬── student ──────────────> Student\n`;
  md += `          ├── course ───────────────> Course\n`;
  md += `          └── createdBy ────────────> Staff\n`;
  md += `\n`;
  md += `Payment ──┬── student ──────────────> Student\n`;
  md += `          └── class ────────────────> Class\n`;
  md += `\n`;
  md += `Receipt ──┬── student ──────────────> Student\n`;
  md += `          ├── class ────────────────> Class\n`;
  md += `          └── createdBy ────────────> Staff\n`;
  md += `\n`;
  md += `TuitionFee ┬── student ─────────────> Student\n`;
  md += `           └── class ───────────────> Class\n`;
  md += `\n`;
  md += `Request ──┬── student ──────────────> Student\n`;
  md += `          ├── course ───────────────> Course\n`;
  md += `          ├── class ────────────────> Class\n`;
  md += `          ├── targetClass ──────────> Class\n`;
  md += `          ├── assignedToClass ──────> Class\n`;
  md += `          └── processedBy ──────────> Staff\n`;
  md += `\n`;
  md += `Schedule ─┬── class ────────────────> Class\n`;
  md += `          ├── teacher ──────────────> Staff\n`;
  md += `          └── student ──────────────> Student\n`;
  md += `\n`;
  md += `Notification ┬── recipient ─────────> User (Student/Staff)\n`;
  md += `             └── sender ────────────> User (Student/Staff)\n`;
  md += `\n`;
  md += `Staff ────┬── managedClasses ───────> Class\n`;
  md += `          └── teachingClasses ──────> Class\n`;
  md += `\n`;
  md += `Course ───── classes ───────────────> Class\n`;
  md += `\`\`\`\n\n`;

  // Auto-generated codes
  md += `## 🔢 Mã Tự Động (Counter)\n\n`;
  md += `| Đối Tượng | Format | Ví Dụ |\n`;
  md += `|-----------|--------|-------|\n`;
  md += `| Student | \`HV{00000}\` | HV00001, HV00088 |\n`;
  md += `| Course | \`COURSE{0000}\` | COURSE0001 |\n`;
  md += `| Class | \`CLS{N}\` | CLS1, CLS15 |\n`;
  md += `| Request | \`REQ{YYYYMM}{0000}\` | REQ2025110001 |\n`;
  md += `| Finance | \`TXN{YYYYMM}{00000}\` | TXN20251100001 |\n`;
  md += `| Payment | \`PAY{YYYYMM}{0000}\` | PAY2025110001 |\n`;
  md += `| Receipt | \`RCP{YYYYMM}{0000}\` | RCP2025110001 |\n`;
  md += `| TuitionFee | \`TF{YYYYMM}{0000}\` | TF2025110001 |\n`;
  md += `\n`;

  // Counter hiện tại
  try {
    const counters = await Counter.find().lean();
    if (counters.length > 0) {
      md += `### Counter Hiện Tại Trong DB\n\n`;
      md += `| Counter ID | Giá Trị Hiện Tại |\n`;
      md += `|------------|------------------|\n`;
      for (const c of counters) {
        md += `| \`${c._id}\` | ${c.seq} |\n`;
      }
    }
  } catch {
    // ignore
  }

  md += `\n---\n\n`;
  md += `> *File này được tạo tự động bởi script \`server/scripts/exportDatabaseSchema.js\`*\n`;
  md += `> *Chạy lại: \`cd server && node scripts/exportDatabaseSchema.js\`*\n`;

  return md;
}

function maskConnectionString(host) {
  if (host.includes("mongodb.net")) {
    return `***.***.mongodb.net`;
  }
  return host;
}

function getEmoji(modelName) {
  const emojiMap = {
    Student: "👨‍🎓",
    Staff: "👨‍💼",
    Course: "📚",
    Class: "🏫",
    Attendance: "📋",
    Grade: "📝",
    Finance: "💰",
    Payment: "💳",
    Receipt: "🧾",
    TuitionFee: "💵",
    Notification: "🔔",
    Request: "📩",
    Schedule: "📅",
    Counter: "🔢",
  };
  return emojiMap[modelName] || "📄";
}

// ====== MAIN ======
async function main() {
  console.log("🔄 Đang kết nối MongoDB...");

  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/english_center_dev";

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`✅ Đã kết nối: ${mongoose.connection.db.databaseName}`);
  console.log("🔄 Đang trích xuất schema và dữ liệu...\n");

  const markdown = await generateMarkdown();

  const outputPath = path.join(__dirname, "..", "..", "docs", "DATABASE_SCHEMA.md");
  fs.writeFileSync(outputPath, markdown, "utf8");

  console.log(`\n✅ Đã xuất schema ra: ${outputPath}`);
  console.log(`📄 File size: ${(Buffer.byteLength(markdown, "utf8") / 1024).toFixed(1)} KB`);

  await mongoose.disconnect();
  console.log("✅ Đã ngắt kết nối MongoDB");
}

main().catch((err) => {
  console.error("❌ Lỗi:", err);
  mongoose.disconnect();
  process.exit(1);
});
