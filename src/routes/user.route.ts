import { registerUser } from "../controllers/user.controller";
import { Router } from "express";
import { multerUpload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/register").post(
    multerUpload.fields([
        {
            "name": "avatar",
            maxCount: 1,
        },
        {
            "name": "coverImage",
            "maxCount": 1,
        }
    ]),
    registerUser
);

export default router;