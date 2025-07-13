import { accessTokenPayloadType } from "../common.type"

declare global{
    namespace Express{
        export interface Request{
            user: accessTokenPayloadType,
        }
    }
}

export {};