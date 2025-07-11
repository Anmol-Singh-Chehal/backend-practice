import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { User } from "../lib/models/User.model";
import { ObjectId } from "mongoose";

const verifyJWT = async (req:Request, res:Response, next:NextFunction) => {
    // get accessToken from cookies or get accessToken from authorization header and remove bearer
    // if there is not token api-error
    // decode token
    // find user by decoded token ._id but select -password and -refreshToken
    // if not found then api-error
    // req.user = user;
    // next()

    try {
        const token = req.cookies.accessToken || req.header("authorization")?.replace("Bearer ", "");
        if(!token) throw new ApiError(400, "Unauthorized access.");
        
        if(!process.env.ACCESS_TOKEN_SECRET) throw new ApiError(500, "ACCESS_TOKEN_SECRET not found.");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        if(!(typeof decodedToken === "object" && "_id" in decodedToken)) throw new ApiError(400, "_id not found unauthorized access.");
        const user = await User.findById(decodedToken._id as ObjectId);
    
        if(!user) throw new ApiError(400, "Unauthorized access.");
        
        req.user = user;
        next();
        
    } catch (error) {
        throw new ApiError(400, "Invalid access token.");
    }
}