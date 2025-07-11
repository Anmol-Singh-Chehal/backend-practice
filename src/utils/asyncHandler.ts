import { Request, Response, NextFunction } from "express";

const asyncHandler = (fun:Function) => async (req:Request, res:Response, next:NextFunction) => {
    return Promise.resolve(fun(req, res, next)).catch((error:unknown) => {
        if(error instanceof Error){
            next(error);
        }
    });
}

// const asycHandler = (fun:Function) => async (req:Request, res:Response, next:NextFunction) => {
//     try{
//         await fun(req, res, next);
//     } catch(error:unknown) {
//         if(error instanceof Error && "code" in error && typeof error.code === "number"){
//             res.status(error.code);
//         }

//         if(error instanceof Error){
//             res.json({
//                 success: false,
//                 message: error.message,
//             });
//         }
//     }
// }

export default asyncHandler;