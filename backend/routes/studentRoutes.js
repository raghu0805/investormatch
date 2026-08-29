import express from 'express';
import {
  createStudentProfile,
  getMyStudentProfile,
  updateStudentProfile,
  matchInvestors,
  getStudentProfileById
} from "../controllers/studentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createStudentProfile);
router.get("/me", authMiddleware, getMyStudentProfile);
router.put("/update", authMiddleware, updateStudentProfile);
router.get("/match-investors", authMiddleware, matchInvestors);
router.get("/profile/:userId", authMiddleware, getStudentProfileById);

export default router;
