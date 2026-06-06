import mongoose from "mongoose";
import dotenv from "dotenv";
import TeamMember from "./models/TeamMember.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const result = await TeamMember.deleteMany({ name: /^Prince Kumar$/i });
    console.log("Deleted count:", result.deletedCount);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

run();
