import express from "express";
import { signup, login, GoogleLogin, RegisterRole, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", GoogleLogin);
router.post("/register-google", RegisterRole);
router.get("/me", authMiddleware, getMe);

export default router;
