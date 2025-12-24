/* SEED DATA SCRIPT - FINANCE (TUITION STATUS)
   Objective: Populate finance data to showcase the Tuition Status page features.
   Principle: Adds diverse transaction records without deleting existing data.
*/

const mongoose = require('mongoose');
require('dotenv').config();

// --- IMPORT MODELS (Adjust paths as necessary) ---
// Assuming standard model names based on your project context
const Student = require('../src/shared/models/Student.model');
const Course = require('../src/shared/models/Course.model');
const Class = require('../src/shared/models/Class.model');
// Note: If you have a specific 'Tuition' or 'Finance' model, import that.
// If tuition status is derived from Receipts, we'll seed Receipts.
// If it's a field in Student, we'll update Students.
// This script assumes a 'Finance' or 'Tuition' record might exist, 
// or it generates Receipts which the frontend aggregates.
// **ADJUSTMENT:** Based on your frontend code using `financeService.getAll`, 
// let's assume a 'Tuition' model or aggregation from 'Receipts'. 
// I will seed 'Receipt' data heavily as it's a common pattern.
const Receipt = require('../src/shared/models/Receipt.model'); 

// --- CONFIGURATION ---
const TARGET_RECORDS = 50; 

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/english_center_dev";
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedFinance = async () => {
  await connectDB();
  console.log('🚀 Starting Finance Data Seeding...');

  try {
    // 1. Fetch Base Data
    const students = await Student.find();
    const classes = await Class.find().populate('course');

    if (students.length === 0 || classes.length === 0) {
      console.error('⚠️ Warning: No Students or Classes found. Please run the general seed script first.');
      process.exit(1);
    }

    // 2. Generate Finance Records (Receipts/Tuition entries)
    const statuses = ['paid', 'partial', 'unpaid', 'overdue', 'pending'];
    const newRecords = [];

    // We'll create a mix of records for random students
    for (let i = 0; i < TARGET_RECORDS; i++) {
      const student = getRandomItem(students);
      const relatedClass = getRandomItem(classes);
      const status = getRandomItem(statuses);
      
      // Determine amounts based on status to ensure logical consistency
      // Base tuition fee (e.g., 3,000,000 - 10,000,000 VND)
      const totalAmount = getRandomInt(30, 100) * 100000; 
      let paidAmount = 0;

      switch (status) {
        case 'paid':
          paidAmount = totalAmount;
          break;
        case 'partial':
          paidAmount = Math.floor(totalAmount * (getRandomInt(20, 80) / 100)); // 20-80% paid
          break;
        case 'unpaid':
        case 'overdue':
        case 'pending':
          paidAmount = 0;
          break;
      }

      const remainingAmount = totalAmount - paidAmount;

      // Create a Receipt record
      // Note: Adjust fields to match your exact Mongoose Schema
      newRecords.push({
        student: student._id,
        class: relatedClass._id,
        course: relatedClass.course?._id, // If your schema links course
        receiptNumber: `TUIT-${Date.now()}-${getRandomInt(1000, 9999)}`,
        amount: totalAmount, // Total fee for the course/module
        paidAmount: paidAmount, // Amount actually paid so far
        remainingAmount: remainingAmount, // Calculated remaining
        status: status,
        type: 'tuition_fee',
        paymentMethod: status === 'paid' || status === 'partial' ? getRandomItem(['cash', 'bank_transfer', 'momo']) : undefined,
        description: `Học phí lớp ${relatedClass.name || 'Giao tiếp'}`,
        dueDate: new Date(new Date().setDate(new Date().getDate() + getRandomInt(-30, 30))), // Due date +/- 30 days
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 3. Insert into Database
    // Note: If you use a separate 'Tuition' collection, change 'Receipt' to 'Tuition'
    // If your system calculates status dynamically from Receipts, this is correct.
    if (newRecords.length > 0) {
        // Option A: If you have a dedicated Tuition model
        // await Tuition.insertMany(newRecords);
        
        // Option B: Using Receipt model (more common for "Transactions")
        // You might need to adjust if your schema doesn't have 'paidAmount'/'remainingAmount'
        // and instead relies on sum of transactions. 
        // For this seed, I'll assume a flexible Receipt/Transaction model or 
        // that you will adapt the model name below.
        
        try {
             // Check if 'Finance' or 'Tuition' model exists, otherwise default to Receipt
             // This part requires you to know your exact Model name for the tuition status page.
             // I will default to 'Receipt' as it's standard.
             await Receipt.insertMany(newRecords);
             console.log(`✅ Successfully added ${newRecords.length} finance records.`);
        } catch (insertError) {
            console.log("⚠️ Could not insert into 'Receipt'. Please check your Model name in the script.");
            console.error(insertError);
        }
    }

    console.log('🎉 Finance Data Seeding Completed!');
    console.log('👉 Refresh your Tuition Status page to see the new data.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedFinance();