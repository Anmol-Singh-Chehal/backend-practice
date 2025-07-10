import asycHandler from "../utils/asyncHandler";
import { Request, Response } from "express";

const registerUser = asycHandler( async (req:Request, res:Response) => {
    res.status(200).json({
        success: true,
    });
}); 

export { registerUser };