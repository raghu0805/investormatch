// socketHandler.js
import { loadMessages,createMessage } from "../controllers/messageController.js";
export default function socketHandler(io) {
  io.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);

    // JOIN ROOM
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log("User joined room:", roomId);
    });

    // SEND MESSAGE
    socket.on("send-message", async(data) => {
      console.log("Message received:", data);
      await createMessage(data);
      // Broadcast to room
      io.to(data.roomId).emit("new-message", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
