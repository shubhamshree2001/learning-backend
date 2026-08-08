// second approach 
//require("dotenv").config({path: "./env"});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";


dotenv.config({path: "./env"});

connectDB().then(() => {
    app.on("error", (error) => {
        console.log("Error in connecting to MongoDB", error);
        throw error;
    });
    
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((error) => {
    console.log("Error in connecting to MongoDB", error);
    throw error;
});












//First approach 


// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";

   
// const connectDB = async () => {}
    /*
const app = express();
// use effis as soon as it will come it will get executed
// adding semi colon to show it is start 
;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
        app.on("error", (error) => {
            console.log("Error in connecting to MongoDB", error);
            throw error;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
})();
*/