import { Router } from "express";
import Message from "../models/Message.js";
import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const router=express.Router();
router.post("/upload", upload.single("file"), (req, res) => {
  const filePath = `http://localhost:5000/${req.file.path}`;
  res.json({ url: filePath });
});

const LoadChatHistroy=async(req,res)=>{
try{
    const messages=(await Message.find({roomId:req.params.roomId})).sort({createdAt:1,})
    return res.status(200).json(messages)
}
catch(err){
    return res.staus(500).json({messages:"Server error"})
}
}
const deleteMessage= async (req, res) => {
  await Message.deleteMany({ roomId: req.params.roomId });
  return res.json({ message: "Chat deleted permanently" });
}
const updateMessage= async (req, res) => {
  await Message.updateOne(
    { _id: req.params.id },
    {
      $push: {
        reactions: {
          emoji: req.body.emoji,
          userId: req.userId, // from auth middleware
        },
      },
    }
  );

  res.json({ success: true });
}
export {LoadChatHistroy,deleteMessage,updateMessage};