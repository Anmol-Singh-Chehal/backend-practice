import { getUserChannelProfile, getUserDetials, getUserWatchHistory, refreshTheAccessToken, signIn, signOut, signUp, updateUserAvatar, updateUserCoverImage, updateUserDetails, updateUserPassword } from "../controllers/user.controller";
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
router.route("/refresh-token").post(refreshTheAccessToken);
router.route("/change-password").post(verifyJWT, updateUserPassword);
router.route("/current-user").get(verifyJWT, getUserDetials);
router.route("/update-account").patch(verifyJWT, updateUserDetails);
router.route("/avatar").patch(verifyJWT, multerUpload.single("avatar"), updateUserAvatar);
router.route("/coverImage").patch(verifyJWT, multerUpload.single("coverImage"),updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getUserWatchHistory);

export default router;