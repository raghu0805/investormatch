import { useEffect, useState } from "react";
import socket from "./socket";
import api from "../utils/api";

export default function ChatPage({ roomId, senderId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const sendMessage = (text) => {
  const msg = {
    roomId,
    senderId,
    receiverId,
    message: text,
  };

  socket.emit("sendMessage", msg); // Real-time
};


  useEffect(() => {
    // 1️⃣ Join the room
    socket.emit("joinRoom", roomId);

    // 2️⃣ Load old messages
    api.get(`/messages/${roomId}`).then((res) => {
      setMessages(res.data);
    });

    // 3️⃣ Receive real-time messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId]);

return (
  <div className="p-4">

    <div className="messages-container">
      {messages.map((m) => (
        <div key={m._id} className={m.senderId === senderId ? "my-msg" : "their-msg"}>
          {m.message}
        </div>
      ))}
    </div>

    <div className="flex mt-4">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 p-2 bg-gray-800 text-white rounded"
      />

      <button
        onClick={() => {
          sendMessage(text);
          setText("");
        }}
        className="ml-2 bg-red-600 px-4 rounded"
      >
        Send
      </button>
    </div>

  </div>
);
}
