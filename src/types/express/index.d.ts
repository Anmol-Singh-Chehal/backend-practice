// import { accessTokenPayloadType } from "../common.type"

// declare global{
//     namespace Express{
//         export interface Request{
//             user: accessTokenPayloadType,
//         }
//     }
// }

// export {};

import { accessTokenPayloadType } from "../types/common.type";

declare module "express-serve-static-core" {
  interface Request {
    user: accessTokenPayloadType;
  }
}