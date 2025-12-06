import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await api.get("/chats");
        setChats(res.data); // Ensure backend returns proper list
      } catch (error) {
        console.log(error);
      }
    };

    loadChats();
  }, []);

  // ⭐ FILTER CHATS BASED ON SEARCH INPUT
  const filteredChats = chats.filter((c) =>
    c.partnerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Chats</h1>

      {/* ⭐ SEARCH BAR */}
      <input
        className="w-full p-3 mb-4 bg-gray-800 rounded border border-gray-700"
        placeholder="Search chats..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ⭐ CHAT LIST */}
      <div className="space-y-4">
{filteredChats.map((chat) => (
  <div
    key={chat._id}
    onClick={() => navigate(`/chat/${chat.roomId}`)}
    className="bg-gray-800 p-4 rounded-xl flex items-center gap-4 hover:bg-gray-700 transition cursor-pointer"
  >
    <img
      src={`https://ui-avatars.com/api/?name=${chat.partnerName}`}
      className="w-12 h-12 rounded-full"
    />

    <div>
      <h2 className="text-lg font-semibold">{chat.partnerName}</h2>
      <p className="text-gray-400 text-sm">
        {chat.lastMessage || "Start a new chat"}
      </p>
    </div>
  </div>
))}

      </div>
    </div>
  );
}
