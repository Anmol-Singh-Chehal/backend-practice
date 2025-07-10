import mongoose, { Model, Schema } from "mongoose";
import userModel from "../../types/userModel";

const UserSchema:Schema<userModel> = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required."],
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true,
});

export const User:Model<userModel> = mongoose.model("User", UserSchema);