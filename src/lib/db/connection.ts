import mongoose from "mongoose";
import { DB_NAME } from "../../constants";

const connectDB = async () => {
    try{
        if(!process.env.MONGODB_URI){
            throw new Error("MONGODB_URI is not found.");
        }
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Database connection successfull.");
    } catch(error:unknown){
        console.log("Failed to connect with database:", error);
        process.exit(1);
    }
}

export default connectDB;