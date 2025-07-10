import { Document } from "mongoose";
import userModel from "./userModel";

interface videoModel extends Document{
    videoFile: string,
    thumbnail: string,
    title: string,
    description: string,
    duration: number,
    views: number,
    isPublished: boolean,
    owner: userModel,
}

export default videoModel;