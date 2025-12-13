// src/components/ChatWindow.jsx
import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import socket from "../socket";

export default function ChatWindow({
  roomId,
  currentUserId,
  otherUser,
  forceReload,
}) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ---------------------------------------------------
     1) JOIN ROOM + LOAD MISSED MESSAGES (IMPORTANT FIX)
  --------------------------------------------------- */
  useEffect(() => {
    if (!roomId) return;

    socket.emit("join-room", roomId);

    const loadMessages = async () => {
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Load messages error:", err);
      }
    };

    loadMessages();
  }, [roomId, forceReload]);

  /* ---------------------------------------------------
     2) REAL-TIME MESSAGE RECEIVE (SOCKET ONLY)
  --------------------------------------------------- */
  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.roomId !== roomId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [roomId]);

  /* ---------------------------------------------------
     3) AUTO SCROLL
  --------------------------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------------------------------
     4) TYPING INDICATOR
  --------------------------------------------------- */
  useEffect(() => {
    const handleTyping = ({ roomId: rId, senderId }) => {
      if (rId !== roomId || senderId === currentUserId) return;

      setIsOtherTyping(true);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsOtherTyping(false);
      }, 3000);
    };

    const handleStopTyping = ({ roomId: rId, senderId }) => {
      if (rId === roomId && senderId !== currentUserId) {
        setIsOtherTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [roomId, currentUserId]);

  /* ---------------------------------------------------
     5) SEND MESSAGE
  --------------------------------------------------- */
  const send = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      roomId,
      text,
      senderId: currentUserId,
    });

    socket.emit("stop-typing", { roomId, senderId: currentUserId });
    setText("");
  };

  /* ---------------------------------------------------
     6) HANDLE TYPING
  --------------------------------------------------- */
  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (!val.trim()) {
      socket.emit("stop-typing", { roomId, senderId: currentUserId });
    } else {
      socket.emit("typing", { roomId, senderId: currentUserId });
    }
  };

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex gap-3 items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full flex items-center justify-center font-semibold">
          {otherUser.name
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-semibold">{otherUser.name}</p>
          <p className="text-xs text-slate-500">
            {isOtherTyping ? "Typing…" : "Online"}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-950">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={i}
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
                <div className="text-[9px] text-slate-300 mt-1 flex justify-end">
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/80 flex gap-2">
        <input
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
          placeholder={`Message ${otherUser.name.split(" ")[0]}…`}
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button
          onClick={send}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
