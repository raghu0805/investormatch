import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {sendRequest,getSentRequests,getReceivedRequests,updateRequestStatus, checkingAlreadySent} from "../controllers/requestController.js";
const router = express.Router();
// Startup sends request
router.post("/send", authMiddleware, sendRequest);

// Startup views their own sent requests
router.get("/sent", authMiddleware, getSentRequests);



router.get("/check_request",authMiddleware,checkingAlreadySent);



// Investor views their own received requests
router.get("/received", authMiddleware, getReceivedRequests);

// Investor accepts or rejects
router.put("/update", authMiddleware, updateRequestStatus);


export default router;