import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected successfully to host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error in connecting to it is failed to connect to MongoDB");
        console.log("Error in connecting to MongoDB", error);
        process.exit(1);
    }
};

export default connectDB;

// node js give us access to process
//the current application which is running is running in a proccess 
// so this process is a reference to current running process