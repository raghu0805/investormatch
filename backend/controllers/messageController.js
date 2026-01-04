import Message from "../models/Message.js";
//1. Load the previous messages
export const loadMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const message = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(message);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ message: "Error loading messages" });
  }
}


// 2. Create Message (HTTP Fallback)
export const createMessage = async (req, res) => {
  try {
    const { roomId, text, senderId } = req.body;
    const msg = await Message.create({ roomId, text, senderId });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: "Error sending message" });
  }
};


// 3. Socket Helper (We will use this later in Phase 3)
export const saveMessageFromSocket = async ({ roomId, text, senderId }) => {
  try {
    return await Message.create({ roomId, text, senderId });
  } catch (err) {
    console.error("Socket save error:", err);
    return null;
  }
};