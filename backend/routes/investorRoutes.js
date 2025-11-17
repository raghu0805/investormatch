import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import {createInvestorProfile, getMyInvestorProfile, updateInvestorProfile} from '../controllers/investorController.js';

const router=express.Router();

router.post("/create",authMiddleware,createInvestorProfile);
router.get("/me",authMiddleware,getMyInvestorProfile);
router.put("/update",authMiddleware,updateInvestorProfile);

export default router;