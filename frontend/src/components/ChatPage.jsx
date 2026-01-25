import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { HiPaperAirplane } from "react-icons/hi2";

const getToken = () => { return localStorage.getItem("token") };

const ChatPage = () => {
    const [socket, setSocket] = useState(null);
    const [UserList, setUserList] = useState({ accepted: [], sent: [], interest: [] });
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();
    const [myId, setMyId] = useState("");

    // DECODE TOKEN
    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded:", decoded);
                setMyId(decoded.id);
            } catch (err) {
                console.error("Invalid token");
            }
        }
    }, []);

    // SOCKET CONNECTION
    useEffect(() => {
        // const newSocket = io("http://localhost:5000");
        const newSocket = io("https://investormatch-backend-yn2k.onrender.com");
        console.log("Soccket:", newSocket);
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);
    // LISTEN FOR MESSAGES
    useEffect(() => {
        if (!socket) return;
        const handler = (msg) => {
            if (selectedChat && msg.roomId == selectedChat.requestId) {
                setMessages((prev) => [...prev, msg]);
            }
        };
        socket.on("message-received", handler);
        return () => socket.off("message-received", handler);
    }, [socket, selectedChat]);

    // FETCH HISTORY & JOIN ROOM
    useEffect(() => {
        if (!selectedChat) return;
        socket.emit("join-room", selectedChat.requestId);

        // axios.get(`http://localhost:5000/api/messages/${selectedChat.requestId}`, {
        //     headers: { Authorization: `Bearer ${getToken()}` }
        // })
        axios.get(`https://investormatch-backend-yn2k.onrender.com/api/messages/${selectedChat.requestId}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(res => {
                // ROBUST ERROR HANDLING: Ensure data is an array
                if (Array.isArray(res.data)) {
                    setMessages(res.data);
                } else {
                    console.error("Invalid messages format:", res.data);
                    setMessages([]); // Fallback to empty array
                }
            })
            .catch(err => {
                console.error("Error loading messages", err);
                setMessages([]); // Fallback to empty array
            });
    }, [socket, selectedChat]);

    // SEND MESSAGE
    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const msgData = {
            roomId: selectedChat.requestId,
            senderId: myId,
            text: newMessage
        };

        socket.emit("send-message", msgData);
        setNewMessage("");
    };

    // FETCH USERS
    useEffect(() => {
        const fetchUsers = async () => {
            const token = getToken();
            if (!token) return;
            try {
                // const res = await axios.get("http://localhost:5000/api/chat/users", {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                const res = await axios.get("https://investormatch-backend-yn2k.onrender.com/api/chat/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Ensure we handle the specific "accepted" array if that's what the backend sends
                // Based on previous checks, backend sends { accepted: [...] }
                const users = res.data?.accepted ? res.data : { accepted: [], sent: [], interest: [] };
                setUserList(users);

            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchUsers();
    }, []);

    // AUTO SCROLL
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex h-screen bg-black text-white font-[Jaro]">
            {/* BACKGROUND GRADIENT OVERLAY */}
            <div className="fixed inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] -z-10" />

            {/* LEFT SIDEBAR */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-1/3 bg-black/40 backdrop-blur-xl border-r border-gray-800 p-4 flex flex-col"
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-red-600 tracking-wider">MESSAGES</h2>
                    <p className="text-gray-400 text-sm">Your investor connections</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {UserList.accepted.length === 0 ? (
                        <div className="text-gray-500 text-center mt-10 italic">
                            No connections yet.
                            <br />Start matching to chat!
                        </div>
                    ) : (
                        UserList.accepted.map((chat) => (
                            <motion.div
                                key={chat.requestId}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedChat?.requestId === chat.requestId
                                    ? "bg-red-600/20 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                                    : "bg-gray-900/50 border-gray-800 hover:bg-gray-800 hover:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-lg font-bold">
                                        {chat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-200">{chat.name}</p>
                                        <p className="text-xs text-gray-500">Click to chat</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* RIGHT CHAT AREA */}
            <div className="w-2/3 flex flex-col relative">
                {selectedChat ? (
                    <>
                        {/* CHAT HEADER */}
                        <div className="h-20 border-b border-gray-800 bg-black/20 backdrop-blur-md flex items-center px-6 sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-wide">{selectedChat.name}</h3>
                                <span className="flex items-center gap-2 text-xs text-green-500">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* MESSAGES LIST */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === myId;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className={`max-w-[70%] p-3 rounded-2xl ${isMe
                                            ? "bg-red-600 text-white rounded-br-none shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                                            : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-gray-800">
                            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
                                <input
                                    className="flex-1 bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 
                                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 
                                    transition-all hover:bg-gray-900"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                                    text-white p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]
                                    hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]"
                                >
                                    <HiPaperAirplane className="text-xl" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-gray-500 p-10"
                    >
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                            <HiPaperAirplane className="text-4xl text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No Chat Selected</h3>
                        <p>Select a conversation from the sidebar to start messaging.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
