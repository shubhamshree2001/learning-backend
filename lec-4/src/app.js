import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// limit in json is 1kb while taking input from body 
app.use(express.json({ limit: "1kb" }));

// configuring when data is coming in request url as parameters or query
// extended it used to send objects in objects
app.use(express.urlencoded({ extended: true, limit: "1kb" }));

// it is used to store pdf files 
// public is the folder name where the files are stored
app.use(express.static("public"));

// cookieParser is used to parse the cookies in the request
// that means from my server we can access the cookies from the user browser and set the cookies 
// we can keep secure cookies in user browser
app.use(cookieParser());







// import routes 

import userRoutes from "./routes/user.routes.js";

//rpute declaration
app.use("/api/v1/users", userRoutes);

//http:localhost:8000/api/v1/users/register 

export { app }; 