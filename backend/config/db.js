import mongoose from 'mongoose';

// Disable Mongoose command buffering when DB is offline so calls don't hang
mongoose.set('bufferCommands', false);

let dbConnected = false;

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/returnguard';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000
    });
    dbConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    dbConnected = false;
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB (${error.message}). Operations will seamlessly use in-memory store.`);
    return false;
  }
};

export const isDBConnected = () => {
  return dbConnected && mongoose.connection.readyState === 1;
};
