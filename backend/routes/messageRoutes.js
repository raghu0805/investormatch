import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { LoadChatHistroy,deleteMessage, updateMessage } from "../controllers/messageController.js";

const router=express.Router();

router.get("/:roomId",authMiddleware,LoadChatHistroy);
router.delete("/:roomId",authMiddleware,deleteMessage);
router.put("/react/:id",authMiddleware,updateMessage);


export default router;