import mongoose, { CallbackWithoutResultAndOptionalError, Model, ObjectId, Schema } from "mongoose";
import { userTypes, userMethods } from "../../types/user.type";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { StringValue } from "ms";
import { accessTokenPayloadType } from "../../types/common.type";

type userMethodModel = Model<userTypes, {}, userMethods>;

const UserSchema:Schema<userTypes, userMethodModel> = new Schema({
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
        type: String,
    }
}, {
    timestamps: true,
});

UserSchema.pre("save", async function(next: CallbackWithoutResultAndOptionalError){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
});

UserSchema.methods.isPasswordCorrect = async function(password:string){
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function(){
    const secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY as StringValue;
    const payload:accessTokenPayloadType = {
        _id: this._id,
        username: this.username,
        fullName: this.fullName,
        email: this.email,
    }

    if(!secret || !expiry){
        console.log("ACCESS_TOKEN_SECRET & ACCESS_TOKEN_EXPIRY not found.");
        return null;
    }

    return jwt.sign(payload, secret, { expiresIn:expiry });
}

UserSchema.methods.generateRefreshToken = function(){
    const secret = process.env.REFRESH_TOKEN_SECRET as Secret;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY as StringValue;
    const payload:{ _id:ObjectId } = {
        _id: this._id,
    };

    if(!secret || !expiry){
        console.log("REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRY not found.");
        return null;
    }

    return jwt.sign(payload, secret, { expiresIn:expiry });
}

export const User = mongoose.model<userTypes, userMethodModel>("User", UserSchema);