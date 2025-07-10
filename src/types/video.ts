import { Document } from "mongoose";
import { userTypes } from "./user";

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