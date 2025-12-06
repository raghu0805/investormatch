import express from "express";
import Request from "../models/Request.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Find accepted requests involving this user
    const requests = await Request.find({
      status: "accepted",
      $or: [
        { startupId: userId },
        { investorId: userId }
      ]
    })
    .populate("startupId")
    .populate("investorId");

    const chatList = await Promise.all(
      requests.map(async (reqObj) => {
        const partner = reqObj.startupId._id.toString() === userId
          ? reqObj.investorId
          : reqObj.startupId;

        // Get latest message
        const lastMsg = await Message.findOne({ roomId: reqObj.roomId })
          .sort({ createdAt: -1 });

        return {
          roomId: reqObj.roomId,
          partnerName: partner.name,
          partnerEmail: partner.email,
          partnerId: partner._id,
          lastMessage: lastMsg?.message || null,
          lastMessageTime: lastMsg?.createdAt || null,
        };
      })
    );

    return res.status(200).json(chatList);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
});
// PUT /api/chats/block/:partnerId
router.put("/block/:partnerId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // the person blocking
    const partnerId = req.params.partnerId;

    const request = await Request.findOne({
      status: "accepted",
      $or: [
        { startupId: userId, investorId: partnerId },
        { startupId: partnerId, investorId: userId }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: "Chat not found." });
    }

    request.blocked = true;
    request.blockedBy = userId;
    await request.save();

    return res.json({ message: "User blocked successfully." });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});
router.put("/unblock/:partnerId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const partnerId = req.params.partnerId;

  const request = await Request.findOne({
    status: "accepted",
    $or: [
      { startupId: userId, investorId: partnerId },
      { startupId: partnerId, investorId: userId }
    ]
  });

  if (!request) return res.status(404).json({ message: "Chat not found." });

  request.blocked = false;
  request.blockedBy = null;
  await request.save();

  return res.json({ message: "User unblocked." });
});


export default router;
