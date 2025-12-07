import express from "express";
import Message from "../models/Message.js";
import auth from "../middleware/authMiddleware.js";
import { createMessage, loadMessages, saveMessageFromSocket, updateLastSeen } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:roomId", auth, loadMessages);
router.post("/", auth, createMessage);
router.post("/update-last-seen",auth,updateLastSeen)

export default router;
