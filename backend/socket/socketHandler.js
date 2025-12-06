import Message from "../models/Message.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    socket.userId = socket.handshake.query.userId;
    io.emit("online", { userId: socket.userId });
    console.log("New user connected:", socket.id);
    // User joins a chat room
    socket.on("joinRoom", async (roomId) => {
      socket.join(roomId);

      // Mark all messages as seen for this user
      await Message.updateMany(
        { roomId, receiverId: socket.userId, seen: false },
        { $set: { seen: true } }
      );

      // Update seen status in frontend
      io.to(roomId).emit("messagesSeen", { roomId });
    });


    // Handle send message
    socket.on("sendMessage", async (data) => {
      try {
        const { roomId, senderId, receiverId, message } = data;

        // 1. Save message in MongoDB
        const newMessage = await Message.create({
          roomId,
          senderId,
          receiverId,
          message,
        });

         // Check if blocked
  const reqObj = await Request.findOne({
    roomId
  });

  if (reqObj.blocked) {
    // If the sender is the blocked person
    if (reqObj.blockedBy.toString() !== senderId) {
      socket.emit("blockedError", { message: "You cannot send messages to this user." });
      return;
    }
  }
        socket.emit("delivered", newMessage._id);
        // 2. Emit message to both users in the room (real-time)
        io.to(roomId).emit("receiveMessage", newMessage);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

socket.on("typing", ({ roomId, userName }) => {
  socket.to(roomId).emit("showTyping", userName);
});

socket.on("reactMessage", ({ roomId, messageId, emoji, userId }) => {
  socket.to(roomId).emit("reactMessage", { messageId, emoji, userId });
});


// User left
socket.on("disconnect", () => {
      User.updateOne({ _id: socket.userId }, { lastSeen: new Date() });
      console.log("User disconnected:", socket.id);
       io.emit("offline", { userId: socket.userId });
    });
  });
}
