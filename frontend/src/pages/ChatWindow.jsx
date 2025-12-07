// src/components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import api from "../utils/api";
import socket from "../socket";

export default function ChatWindow({ roomId, currentUserId, otherUser }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // 1️⃣ Load previous messages + update lastSeen
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data);

        await api.post("/messages/update-last-seen", {
          roomId,
          userId: currentUserId,
        });
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    load();
  }, [roomId, currentUserId]);

  // 2️⃣ Join room when roomId changes
  useEffect(() => {
    console.log("🔵 Joining room:", roomId);
    socket.emit("join-room", roomId);

    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

  // 3️⃣ Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Receive realtime messages (only once)
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

  // 5️⃣ Send message
  const send = async () => {
    if (!text.trim()) return;

    const data = {
      roomId,
      text,
      senderId: currentUserId,
    };

    // // Save to DB
    // await api.post("/messages", data);

    // Send realtime
    socket.emit("send-message", data);
    setText("");
  };

  // 6️⃣ Format time
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 bg-slate-950">
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

                <div className="text-[9px] text-slate-300 mt-1 text-right">
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
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
