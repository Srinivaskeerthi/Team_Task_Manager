import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');
    // Drop all indexes on users collection (keeps _id)
    try {
      await mongoose.connection.collection('users').dropIndexes();
      console.log('✅ Dropped all user indexes');
    } catch(e) { console.log('No indexes to drop or already clean:', e.message); }
    // Also drop the whole flowsphere DB collections to start fresh
    await mongoose.connection.collection('users').drop().catch(() => {});
    await mongoose.connection.collection('projects').drop().catch(() => {});
    await mongoose.connection.collection('tasks').drop().catch(() => {});
    await mongoose.connection.collection('activities').drop().catch(() => {});
    await mongoose.connection.collection('notifications').drop().catch(() => {});
    await mongoose.connection.collection('comments').drop().catch(() => {});
    console.log('✅ Cleaned all collections');
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
};
fix();
