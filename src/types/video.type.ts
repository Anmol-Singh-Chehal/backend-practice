import { Document } from "mongoose";
import { userTypes } from "./user.type";

interface videoTypes extends Document{
    videoFile: string,
    thumbnail: string,
    title: string,
    description: string,
    duration: number,
    views: number,
    isPublished: boolean,
    owner: userTypes,
}

export default videoTypes;