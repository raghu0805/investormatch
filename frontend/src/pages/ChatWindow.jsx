// src/components/ChatWindow.jsx
import { useEffect, useState } from "react";
import api from "../utils/api";
import socket from "../socket";

export default function ChatWindow({ roomId, currentUserId, otherUser }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  // 1️⃣ Load previous messages when room changes
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    loadHistory();
  }, [roomId]);

  // 2️⃣ Receive realtime messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [roomId]);

  // 3️⃣ Sending message
  const send = async () => {
    if (!text.trim()) return;

    const data = {
      roomId,
      text,
      senderId: currentUserId,
    };

    // Save to DB
    await api.post("/messages", data);

    // Notify realtime listeners
    socket.emit("send-message", data);

    setText("");
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center font-semibold text-sm">
          {otherUser.name
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-semibold">{otherUser.name}</p>
          <p className="text-xs text-slate-500">Chat Room</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-950">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500 text-center mt-4">
            No messages yet. Say hi 👋
          </p>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs ${
                  isMe
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-100 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT BAR */}
      <div className="px-3 py-3 border-t border-slate-800 bg-slate-900/80 flex gap-2">
        <input
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder={`Message ${otherUser.name.split(" ")[0]}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button
          onClick={send}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
