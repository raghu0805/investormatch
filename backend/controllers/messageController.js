// import Message from "../models/Message.js";
// import ChatStatus from "../models/ChatStatus.js";

// /* --------------------------------------------------------
//    LOAD MESSAGE HISTORY
// --------------------------------------------------------- */
// export const loadMessages = async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     if (!roomId) {
//       return res.status(400).json({ message: "roomId is required" });
//     }

//     const messages = await Message
//       .find({ roomId })
//       .sort({ createdAt: 1 });

//     return res.json(messages);
//   } catch (err) {
//     console.error("Load messages error:", err);
//     return res.status(500).json({ message: "Failed to load messages" });
//   }
// };

// /* --------------------------------------------------------
//    CREATE MESSAGE (HTTP POST)
// --------------------------------------------------------- */
// export const createMessage = async (req, res) => {
//   try {
//     const { roomId, text, senderId } = req.body;

//     if (!roomId || !text?.trim() || !senderId) {
//       return res.status(400).json({ message: "Invalid message data" });
//     }

//     const msg = await Message.create({
//       roomId,
//       text: text.trim(),
//       senderId,
//     });

//     return res.status(201).json(msg);
//   } catch (err) {
//     console.error("Create message error:", err);
//     return res.status(500).json({ message: "Failed to send message" });
//   }
// };

// /* --------------------------------------------------------
//    SAVE MESSAGE FROM SOCKET.IO
// --------------------------------------------------------- */
// export const saveMessageFromSocket = async ({ roomId, text, senderId }) => {
//   try {
//     if (!roomId || !text?.trim() || !senderId) {
//       return null;
//     }

//     const msg = await Message.create({
//       roomId,
//       text: text.trim(),
//       senderId,
//     });

//     return msg;
//   } catch (err) {
//     console.error("Socket message save error:", err);
//     return null;
//   }
// };

// /* --------------------------------------------------------
//    UPDATE LAST SEEN (for unread logic)
// --------------------------------------------------------- */
// export const updateLastSeen = async (req, res) => {
//   try {
//     const { roomId, userId } = req.body;

//     if (!roomId || !userId) {
//       return res.status(400).json({ message: "Invalid data" });
//     }

//     await ChatStatus.findOneAndUpdate(
//       { roomId, userId },
//       { lastSeen: new Date() },
//       { upsert: true, new: true }
//     );

//     return res.json({ success: true });
//   } catch (err) {
//     console.error("Error updating lastSeen:", err);
//     return res.status(500).json({ message: "Failed to update seen status" });
//   }
// };

// /* --------------------------------------------------------
//    GET UNREAD COUNT (used in sidebar)
// --------------------------------------------------------- */
// export const getUnreadCount = async (user1, user2) => {
//   const roomId = [user1, user2].sort().join("_");

//   const status = await ChatStatus.findOne({ userId: user1, roomId });
//   const lastSeen = status?.lastSeen || new Date(0);

//   const unread = await Message.countDocuments({
//     roomId,
//     senderId: user2,
//     createdAt: { $gt: lastSeen },
//   });

//   return unread;
// };
