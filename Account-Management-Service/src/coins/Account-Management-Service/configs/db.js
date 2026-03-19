import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/account_management');
    console.log('Account Management DB connected');
  } catch (error) {
    console.error('DB connection error:', error);
    process.exit(1);
  }
};