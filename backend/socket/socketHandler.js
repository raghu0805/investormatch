// socketHandler.js
import { loadMessages, saveMessageFromSocket } from "../controllers/messageController.js";
export default function socketHandler(io) {
  io.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);

    // JOIN ROOM
    socket.on("join-room", (roomId) => {

        console.log("🟢 User joined ROOM:", roomId);
  socket.join(roomId);
    });

    // SEND MESSAGE
socket.on("send-message", async (data) => {
  console.log("📥 Received from frontend:", data);

  const saved = await saveMessageFromSocket(data);
  
  if (!saved) {
    console.log("❌ Nothing saved");
    return;
  }

  console.log("📤 Emitting to ROOM:", data.roomId);
  io.to(data.roomId).emit("new-message", saved);
});



    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
