import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendStudentRequest,
  sendStartupRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  checkingAlreadySent,
  sendInvestorRequest,
  checkingInvestorAlreadySent,
  getInvestorSentRequests,
  getStudentReceivedRequests,
  getStartupReceivedRequests
} from "../controllers/requestController.js";

const router = express.Router();

// Student sends request
router.post("/send-student-request", authMiddleware, sendStudentRequest);
router.post("/send-startup-request", authMiddleware, sendStartupRequest);

// Student views their own sent requests
router.get("/sent", authMiddleware, getSentRequests);

router.get("/check_request/from-student", authMiddleware, checkingAlreadySent);
router.get("/check_request/from-startup", authMiddleware, checkingAlreadySent);

router.get("/check_request/from-investor", authMiddleware, checkingInvestorAlreadySent);

// investor sends request
router.post("/send-investor-request", authMiddleware, sendInvestorRequest);

// Investor views their own received requests
router.get("/received", authMiddleware, getReceivedRequests);

// Investor accepts or rejects
router.put("/update", authMiddleware, updateRequestStatus);

// Bidirectional Routes
router.get("/investor/sent", authMiddleware, getInvestorSentRequests);
router.get("/student/received", authMiddleware, getStudentReceivedRequests);
router.get("/startup/received", authMiddleware, getStartupReceivedRequests);

export default router;