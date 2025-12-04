import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import socket from "../socket";
import { useParams } from "react-router-dom";

export default function ChatWindow() {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false)
    const [text, setText] = useState("");
    const bottomRef = useRef(null);

    // Load old messages + join room
    useEffect(() => {
        socket.emit("joinRoom", roomId);

        api.get(`/messages/${roomId}`).then((res) => {
            setMessages(res.data);
        });

        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });


        socket.on("messagesSeen", () => {
            setMessages((prev) =>
                prev.map((msg) => ({ ...msg, seen: true }))
            );
        });
        socket.on("showTyping", () => {
            setTyping(true);
            setTimeout(() => setTyping(false), 2000);
        });
        socket.on("online", ({ userId }) => {
            setOnlineUsers((prev) => [...prev, userId]);
        });

        socket.on("offline", ({ userId }) => {
            setOnlineUsers((prev) => prev.filter(id => id !== userId));
        });




        return () => {
            socket.off("receiveMessage");
        };
    }, [roomId]);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMsg = () => {
        if (!text.trim()) return;

        socket.emit("sendMessage", {
            roomId,
            senderId: localStorage.getItem("userId"),
            receiverId: "TO_BE_CALCULATED",
            message: text,
        });

        setText("");
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Chat Header */}
            <div className="p-4 bg-gray-800 text-lg font-semibold shadow">
                Chat Room
            </div>
            <div className="text-sm text-green-400">
                {onlineUsers.includes(receiverId) ? "Online" : "Offline"}
            </div>


            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* Typing indicator */}
                {typing && (
                    <div className="text-gray-400 text-sm mb-2">
                        typing...
                    </div>
                )}
                {messages.map((m) => (
                    <div
                        key={m._id}
                        className={`max-w-xs p-3 rounded-lg ${m.senderId === localStorage.getItem("userId")
                            ? "bg-red-600 ml-auto"
                            : "bg-gray-700"
                            }`}
                    >
                        <p>{m.message}</p>
                        <span className="text-xs text-gray-300 block mt-1">
                            {new Date(m.createdAt).toLocaleTimeString()}
                        </span>
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {/* Send Box */}
            <div className="p-4 flex bg-gray-800">
                <input
                    className="flex-1 p-2 bg-gray-700 text-white rounded"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        socket.emit("typing", { roomId });
                    }}


                />

                <button
                    onClick={sendMsg}
                    className="ml-2 px-4 bg-red-600 hover:bg-red-700 rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
