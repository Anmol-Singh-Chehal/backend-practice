import { Document } from "mongoose";
import videoTypes from "./video";

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

export { userTypes, userMethods };