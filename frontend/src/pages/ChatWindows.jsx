// src/components/ChatWindow.jsx
import { useEffect, useState } from "react";
import socket from "../socket";

export default function ChatWindows({ roomId, currentUserId, otherUser }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log("Joining room:", roomId);
    socket.emit("join-room", roomId);

    socket.on("new-message", (msg) => {
      // Only add if same room
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("new-message");
    };
  }, [roomId]);

  const send = () => {
    if (!text.trim()) return;

    const data = {
      roomId,
      text,
      senderId: currentUserId,
      receiverId: otherUser._id,
    };

    console.log("Sending:", data);
    socket.emit("send-message", data);

    // Optimistic UI
    setMessages((prev) => [...prev, data]);
    setText("");
  };
  if (!otherUser) {
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Loading chat...
    </div>
  );
}


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-xs font-semibold">
          {otherUser.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold">{otherUser.name}</p>
          <p className="text-[11px] text-slate-500">
            Chat room: <span className="font-mono">{roomId}</span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500">
            No messages yet. Say hi to {otherUser.name.split(" ")[0]} 👋
          </p>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={index}
              className={
                "flex " + (isMe ? "justify-end" : "justify-start")
              }
            >
              <div
                className={
                  "max-w-[70%] px-3 py-2 rounded-2xl text-xs " +
                  (isMe
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-100 rounded-bl-sm")
                }
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-slate-800 flex gap-2">
        <input
          className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-500 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
