import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); //? Load environment variables from .env file--
//? path is specified to point to the  correct location
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

