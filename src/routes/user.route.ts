import { signIn, signOut, signUp } from "../controllers/user.controller";
import { Router } from "express";
import { multerUpload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/sign-up").post(
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
    signUp
);

router.route("/sign-in").post(signIn);
router.route("/sign-out").post(verifyJWT, signOut);

export default router;