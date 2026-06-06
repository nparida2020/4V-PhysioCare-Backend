import mongoose from "mongoose";
import dotenv from "dotenv";


const connectDB = async () => {
  try {
    // Check if the URI exists before attempting to connect
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    const opts = {
      bufferCommands: false, // Turn off buffering for clearer error tracing
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`🔴 Database connection error: ${error.message}`);
    process.exit(1); // Stop the server if the initial connection fails
  }
};

// Monitor ongoing connection events
mongoose.connection.on('error', err => console.error(`❌ Connection error: ${err}`));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected!'));

export default connectDB;
