import { ObjectId } from "mongoose"

export interface signInDetails{
    username: string,
    email: string,
    password: string,
}

export interface signUpDetials extends signInDetails{
    fullName: string,
}

export type tokens = {
    accessToken: string,
    refreshToken: string,
}

export type accessTokenPayloadType = {
    _id: ObjectId,
    username: string,
    fullName: string,
    email: string,
}