import { Document } from "mongoose";
import videoModel from "./videoModel";

interface userModel extends Document{
    username: string,
    password: string,
    email: string,
    fullName: string,
    avatar: string,
    coverImage: string,
    watchHistory: videoModel,
    refreshToken: string,
}

export default userModel;