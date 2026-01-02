import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import {matchStartup,createInvestorProfile, getInvestorProfileById, getMyInvestorProfile, updateInvestorProfile} from '../controllers/investorController.js';

const router=express.Router();

router.post("/create",authMiddleware,createInvestorProfile);
router.get("/me",authMiddleware,getMyInvestorProfile);
router.put("/update",authMiddleware,updateInvestorProfile);
router.get("/match-startups",authMiddleware,matchStartup);


router.get("/profile/:userId", authMiddleware, getInvestorProfileById);

export default router;