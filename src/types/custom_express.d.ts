import { Express } from "express";
import { accessTokenPayloadType } from "./common.type";

declare global {
    namespace Express{
            interface Request{
            user: accessTokenPayloadType,
        }
    }
}