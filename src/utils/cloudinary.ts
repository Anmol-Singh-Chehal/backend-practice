import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

if(!process.env.CLOUDINARY_DB_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
    throw new Error("CLOUDINARY_DB_NAME or CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET not found.");
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_DB_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

export const uploadOnCloudinary = async (localFilePath:string) => {
    try{
        if(!localFilePath){
            throw new Error("Local file path not provided.");
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        return response;
        
    } catch(error:unknown) {
        console.log("Failed to upload file: ", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}