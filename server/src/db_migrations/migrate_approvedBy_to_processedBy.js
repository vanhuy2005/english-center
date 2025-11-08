const mongoose = require("mongoose");

async function migrate() {
  await mongoose.connect("mongodb://localhost:27017/english_center"); // Adjust connection string as needed
  const Request = mongoose.connection.collection("requests");

  // Copy approvedBy to processedBy if processedBy is missing
  await Request.updateMany(
    { approvedBy: { $exists: true }, processedBy: { $exists: false } },
    [
      {
        $set: { processedBy: "$approvedBy" },
      },
      {
        $unset: "approvedBy",
      },
    ]
  );

  // Remove approvedBy field from all documents
  await Request.updateMany(
    { approvedBy: { $exists: true } },
    { $unset: { approvedBy: "" } }
  );

  console.log("Migration completed.");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
