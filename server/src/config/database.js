const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/english_center_dev";

  if (!process.env.MONGODB_URI) {
    console.warn(
      "⚠️  MONGODB_URI not set in .env — falling back to local MongoDB:",
      uri
    );
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Disable transactions for standalone MongoDB
    mongoose.set('autoCreate', false);
    mongoose.set('autoIndex', false);
    
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;
