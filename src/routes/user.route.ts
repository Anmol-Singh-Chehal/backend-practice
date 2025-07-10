import { registerUser } from "../controllers/user.controller";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);

export default router;