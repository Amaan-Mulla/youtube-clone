import { app } from "./app.js";

import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
import connectDB from "./db/index.js";

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("Error: ", err);
    });
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })  
})
.catch((error) => {
    console.log("MongoDB connection error:", error);
})














/* 
import express from "express";
const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`); // mongodb://127.0.0.1:27017/youtube
        app.on("error", (err) => {
            console.error("Error: ", err);
            throw err;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    }
    catch(error) {
        console.error("Error: ",error)
    }
})()
*/