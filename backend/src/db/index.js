import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async() => {
    try{
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`); // mongodb://127.0.0.1:27017/youtube
        console.log(`MongoDB connected: ${connection.connection.host}`); // mongoose.connect returns a connection object, example: { connection: { host: '127.0.0.1' } } 
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;