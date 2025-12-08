// socketHandler.js
import { saveMessageFromSocket } from "../controllers/messageController.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    /* ---------------------------------------------------
       JOIN ROOM
    ----------------------------------------------------- */
    socket.on("join-room", (roomId) => {
      console.log("🏠 User joined room:", roomId);
      socket.join(roomId);
    });

    /* ---------------------------------------------------
       SEND MESSAGE (NO TICKS)
    ----------------------------------------------------- */
    socket.on("send-message", async (data) => {
      console.log("📥 Incoming message:", data);

      const saved = await saveMessageFromSocket(data);

      if (!saved) {
        console.log("❌ Message not saved");
        return;
      }

      // Broadcast saved message
      io.to(data.roomId).emit("new-message", saved);
    });

    /* ---------------------------------------------------
       TYPING INDICATOR ONLY
    ----------------------------------------------------- */
    socket.on("typing", ({ roomId, senderId }) => {
      socket.to(roomId).emit("typing", { roomId, senderId });
    });

    socket.on("stop-typing", ({ roomId, senderId }) => {
      socket.to(roomId).emit("stop-typing", { roomId, senderId });
    });

    /* ---------------------------------------------------
       REMOVE delivered / seen / ticks
       (No ack-delivered, no messages-seen)
    ----------------------------------------------------- */

    /* ---------------------------------------------------
       DISCONNECT
    ----------------------------------------------------- */
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}
