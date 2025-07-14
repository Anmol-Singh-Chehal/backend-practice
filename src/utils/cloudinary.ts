import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import ApiError from "./ApiError";

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

export const deleteFromCloudinary = async (fileUrl:string) => {
    try{
        if(!fileUrl) throw new ApiError(500, "fileUrl is not provided.");
        const values = fileUrl.split("/");
        const imageId = values[values.length-1].split(".")[0];
        if(!imageId) throw new ApiError(500, "Image id not found.");

        const response = await cloudinary.uploader.destroy(imageId);
        if(!response) return false;
        else return true;
            
    } catch(error:unknown){
        console.log("Failed to delete file: ", error);
        return null;
    }
}