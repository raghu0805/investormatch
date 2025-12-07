import Message from "../models/Message.js";
import ChatStatus from "../models/ChatStatus.js";
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
export const saveMessageFromSocket = async (data) => {
  try {
    const { roomId, text, senderId } = data;

    const msg = await Message.create({
      roomId,
      text,
      senderId,
    });

    return msg;
  } catch (err) {
    console.error("Socket message save error:", err);
    return null;
  }
};
export const updateLastSeen = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    await ChatStatus.findOneAndUpdate({ roomId, userId }, {
      lastSeen: new Date()
    }, { upsert: true });

    return res.json({ success: true });


  } catch (error) {
    console.error("Error updating lastSeen:", err);
    res.status(500).json({ message: "Failed to update seen status" });

  }
}
export const getUnreadCount = async (user1, user2) => {
  const roomId = [user1, user2].sort().join("_");

  const status = await ChatStatus.findOne({ userId: user1, roomId });
  const lastSeen = status?.lastSeen || new Date(0);

  const unread = await Message.countDocuments({
    roomId,
    createdAt: { $gt: lastSeen },
    senderId: user2, // only unread if sent by other user
  });

  return unread;
};
