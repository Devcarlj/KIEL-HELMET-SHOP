import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

async function connectDB() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is missing from environment variables");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connect DB")
    } catch (error) {
        console.log("MongoDB connection error", error)
        process.exit(1)
    }
}

export default connectDB;
