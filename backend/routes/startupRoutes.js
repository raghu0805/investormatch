import express from 'express';
import { createStartupProfile, getMyStartupProfile, updateStartupProfile } from "../controllers/startupController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router=express.Router();
router.post("/create",authMiddleware,createStartupProfile);
router.get("/me",authMiddleware,getMyStartupProfile,updateStartupProfile);
router.put("/update",authMiddleware,updateStartupProfile);

export default router;