import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../lib/models/User.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResonse";
import { signInDetails, signUpDetials, tokens } from "../types/common.type";
import { ObjectId } from "mongoose";

const generateAccessAndRefreshToken = async (userId:ObjectId):Promise<tokens> => {
    try {
        const user = await User.findById(userId);
        if(!user) throw new ApiError(400, "Unable to find user with id.");
    
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        if(!accessToken || !refreshToken) throw new ApiError(500, "Failed to generate tokens.");
    
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
    
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens.");
    }
}

const signUp = asyncHandler(async (req:Request, res:Response) => {
    
    const { username, email, password, fullName }:signUpDetials = req.body;
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

const signIn = asyncHandler(async (req:Request, res:Response) => {

    const { email, username, password }:signInDetails = req.body;
    if(!email || !username || !password){
        throw new ApiError(400, "All fields are required.");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    if(!user) throw new ApiError(400, "User doesn't exist, Please sign up first.");

    const isPasswordValid = user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(400, "Incorrect password or invalid credentials.");

    const { accessToken, refreshToken }:tokens = await generateAccessAndRefreshToken(user._id as ObjectId);
    const signedInUser = await User.findById(user._id as ObjectId).select( "-password -refreshToken" );
    
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            { user:signedInUser, accessToken, refreshToken }, 
            "User signed in successfully."
        )
    );
});

const signOut = asyncHandler(async (req:Request, res:Response) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User signed out successfully.")
    );
});

export { signUp, signIn, signOut };