 import express from "express";
import { signup, login, GoogleLogin, RegisterRole } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google",GoogleLogin);
router.post("/register-google",RegisterRole)
export default router;
