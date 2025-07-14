import asyncHandler from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../lib/models/User.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResonse";
import { accessTokenPayloadType, signInDetails, signUpDetials, tokens } from "../types/common.type";
import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { updatePasswordTypes, updateUserDetailsTypes, userTypes } from "../types/user.type";

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

    const { email, username, password } = req.body as signInDetails;

    if(!email && !username && !password){
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
    if(!("user" in req)) throw new ApiError(500, "User doesn't exists in req.");
    
    const userDetails = req.user as accessTokenPayloadType;
    const user = await User.findByIdAndUpdate(
        userDetails._id,
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

const refreshTheAccessToken = asyncHandler(async (req:Request, res:Response) => {

    try {
        const oldRefreshToken:string = req.cookies.refreshToken || req.body.refreshToken;
        if(!oldRefreshToken) throw new ApiError(400, "Unauthorized access.");

        if(!process.env.REFRESH_TOKEN_SECRET) throw new ApiError(500, "REFRESH_TOKEN_SECRET not found.");
        const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(!(typeof decodedToken === "object" && "_id" in decodedToken)) throw new ApiError(400, "Invalid refresh token.");

        const user = await User.findById(decodedToken._id) as userTypes;
        if(!user) throw new ApiError(400, "Unable to find user, unauthorized access.");

        if(oldRefreshToken !== user.refreshToken) throw new ApiError(400, "Unautorized access and Invalid refresh token.");
        
        const { accessToken, refreshToken }:tokens = await generateAccessAndRefreshToken(user._id as ObjectId);
        if(!(accessToken && refreshToken)) throw new ApiError(500, "Unable to generate access and refresh tokens.");

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed successfully."),
        );

    } catch (error:unknown) {
        if(error instanceof Error){
            throw new ApiError(400, error.message);
        } else {
            throw new ApiError(400, "Invalid access.");
        }
    }

});

const updateUserPassword = asyncHandler(async (req:Request, res:Response) => {
    const { 
        oldPassword, 
        newPassword, 
        confirmPassword 
    } = req.body as updatePasswordTypes;

    if(!oldPassword && !newPassword && !confirmPassword) throw new ApiError(400, "All fields are required.");
    if(newPassword !== confirmPassword) throw new ApiError(400, "Confirmed password doesn't match with new password.");
    
    const user = await User.findById(req.user._id);
    if(!user) throw new ApiError(400, "Invalid access.");
    
    const isPasswordValid = user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid) throw new ApiError(400, "Old password is incorrect.");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Password updated successfully."),
    );
}); 

const getUserDetials = asyncHandler(async (req:Request, res:Response) => {

    return res.status(200)
    .json(
        new ApiResponse(200, req.user, "User details fetched successfully."),
    );
});

const updateUserDetails = asyncHandler(async (req:Request, res:Response) => {

    const {
        fullName,
        email,
    } = req.body as updateUserDetailsTypes;
    if(!fullName && !email) throw new ApiError(400, "All fields are required.");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName:fullName, email:email } },
        { new: true },
    ).select( "-password -refreshToken" );
    if(!user) throw new ApiError(400, "Invalid access, user not found.");

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Details updated successfully."),
    );
});

const updateUserAvatar = asyncHandler(async (req:Request, res:Response) => {

    const avatarLocalPath  = req.file?.path as string;
    if(!avatarLocalPath) throw new ApiError(400, "Avatar image is missing.");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar) throw new ApiError(500, "Failed to upload avatar image on cloudinary.");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: false },
    ).select( "-password -refreshToken" );
    if(!user) throw new ApiError(400, "Invalid access, failed to found user.");

    const isDeletedFromCloudinary = await deleteFromCloudinary(user.avatar);
    if(!isDeletedFromCloudinary) throw new ApiError(500, "Failed to delete old avatar image.");

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully."),
    );
});

const updateUserCoverImage = asyncHandler(async (req:Request, res:Response) => {
    
    const coverImageLocalPath  = req.file?.path as string;
    if(!coverImageLocalPath) throw new ApiError(400, "Cover image is missing.");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage) throw new ApiError(500, "Failed to cover image file on cloudinary.");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: coverImage.url } },
        { new: false },
    ).select( "-password -refreshToken" );
    if(!user) throw new ApiError(400, "Invalid access, failed to found user.");

    const isDeletedFromCloudinary = await deleteFromCloudinary(user.coverImage);
    if(!isDeletedFromCloudinary) throw new ApiError(500, "Failed to delete old cover image.");

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully."),
    );
});

export { 
    signUp, 
    signIn, 
    signOut, 
    refreshTheAccessToken, 
    updateUserPassword,
    getUserDetials,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
};