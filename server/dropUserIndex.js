const mongoose = require('mongoose');
require('dotenv').config();

async function dropUserIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testcenter');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Drop the user_1 index
    try {
      await collection.dropIndex('user_1');
      console.log('Successfully dropped user_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index user_1 does not exist');
      } else {
        throw error;
      }
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropUserIndex();
