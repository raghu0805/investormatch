import Message from "../models/Message.js";

export const loadMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    return res.json(messages);
  } catch (err) {
    console.error("Load messages error:", err);
    return res.status(500).json({ message: "Failed to load messages" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { roomId, text, senderId } = req.body;

    const msg = await Message.create({
      roomId,
      text,
      senderId,
    });

    return res.status(201).json(msg);
  } catch (err) {
    console.error("Create message error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
