import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { createMessage, loadMessages } from '../controllers/messageController.js';

const router=express.Router();
router.post("/",auth,createMessage);
router.get("/:roomId",auth,loadMessages);
export default router;
