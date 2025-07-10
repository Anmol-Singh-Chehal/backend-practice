import Express from "express";
import Cors from "cors";
import CookieParser from "cookie-parser";

const app = Express();

app.use(Express.json({ limit: "18kb" }));
app.use(Express.urlencoded({ limit: "18kb", extended: true }));
app.use(CookieParser());
app.use(Express.static("public"));
app.use(Cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

import userRouter from "./routes/user.route";

app.use("/api/v1/user", userRouter);

export default app;