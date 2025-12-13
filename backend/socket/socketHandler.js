// socketHandler.js
import { saveMessageFromSocket } from "../controllers/messageController.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    /* ---------------------------------------------------
       JOIN ROOM
    --------------------------------------------------- */
    socket.on("join-room", (roomId) => {
      if (!roomId) return;
      console.log("🏠 User joined room:", roomId);
      socket.join(roomId);
    });

    /* ---------------------------------------------------
       LEAVE ROOM (IMPORTANT)
    --------------------------------------------------- */
    socket.on("leave-room", (roomId) => {
      if (!roomId) return;
      console.log("🚪 User left room:", roomId);
      socket.leave(roomId);
    });

    /* ---------------------------------------------------
       SEND MESSAGE
    --------------------------------------------------- */ 
    socket.on("send-message", async (data) => {
      try {
        console.log("📥 Incoming message:", data);

        const savedMessage = await saveMessageFromSocket(data);

        if (!savedMessage) {
          console.log("❌ Message not saved");
          return;
        }

        // Emit to everyone in room (including sender)
        io.to(data.roomId).emit("new-message", savedMessage);
      } catch (err) {
        console.error("❌ Socket send-message error:", err);
      }
    });

    /* ---------------------------------------------------
       TYPING INDICATOR
    --------------------------------------------------- */
    socket.on("typing", ({ roomId, senderId }) => {
      socket.to(roomId).emit("typing", { roomId, senderId });
    });

    socket.on("stop-typing", ({ roomId, senderId }) => {
      socket.to(roomId).emit("stop-typing", { roomId, senderId });
    });

    /* ---------------------------------------------------
       DISCONNECT
    --------------------------------------------------- */
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}
 