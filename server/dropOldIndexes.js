const mongoose = require('mongoose');
require('dotenv').config();

async function dropOldIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testcenter');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop old user index from staffs collection
    try {
      await db.collection('staffs').dropIndex('user_1');
      console.log('✅ Dropped user_1 index from staffs collection');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index user_1 does not exist (already dropped)');
      } else {
        console.error('Error dropping index:', error.message);
      }
    }

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropOldIndexes();
