import asycHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../lib/models/User.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResonse";

const registerUser = asycHandler( async (req:Request, res:Response) => {
    
    const { username, email, password, fullName } = req.body;
    if([username, email, password, fullName].some((field:string) => field.trim() === "")){
        throw new ApiError(400, "username or email or password or fullName is required.");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if(user){
        throw new ApiError(400, "Another User exists with given username or email.");
    }

    let avatarLocalPath:string = "";
    if(req.files && "avatar" in req.files && req.files.avatar[0].path){
        avatarLocalPath = req.files.avatar[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required");
    }

    let coverImageLocalPath:string = "";
    if(req.files && "coverImage" in req.files && req.files.coverImage[0].path){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarResponse){
        throw new ApiError(500, "Failed to upload avatar image.");
    }
    if(!coverImageResponse){
        throw new ApiError(500, "Failed to upload cover image.");
    }

    const createdUser = await User.create({
        username: username,
        email: email,
        password: password,
        fullName: fullName,
        avatar: avatarResponse.url,
        coverImage: coverImageResponse.url || "",
    });
    const checkUser = await User.findById(createdUser._id).select( "-password -refreshToken" );
    if(!checkUser) throw new ApiError(500, "Failed to register.");

    return res.status(200).json(
        new ApiResponse(201, checkUser, "User successfully registered.")
    );
}); 

export { registerUser };