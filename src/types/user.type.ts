import { Document } from "mongoose";
import videoTypes from "./video.type";

interface userTypes extends Document{
    username: string,
    password: string,
    email: string,
    fullName: string,
    avatar: string,
    coverImage: string,
    watchHistory: videoTypes,
    refreshToken: string,
}

interface userMethods{
    isPasswordCorrect(password:string): boolean,
    generateAccessToken(): string | null,
    generateRefreshToken(): string | null,
}

interface updatePasswordTypes{ 
    oldPassword: string, 
    newPassword: string, 
    confirmPassword: string 
}

interface updateUserDetailsTypes{
    fullName: string,
    email: string,
}

interface channelUserProfileTypes{
    fullName: string,
    username: string,
    subscriberCount: number,
    subscribedCount: number,
    isSubscribed: boolean,
    avatar: string,
    coverImage: string,
    email: string,
}

export { 
    userTypes, 
    userMethods, 
    updatePasswordTypes, 
    updateUserDetailsTypes,
    channelUserProfileTypes
};