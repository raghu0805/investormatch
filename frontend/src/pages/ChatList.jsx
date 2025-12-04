import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/requests/accepted").then((res) => {
      setChats(res.data); // contains list of users you can chat with
    });
  }, []);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Chats</h1>

      <div className="space-y-4">
        {chats.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/chat/${user.roomId}`)}
            className="p-4 bg-gray-800 rounded-lg shadow hover:bg-gray-700 cursor-pointer transition"
          >
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
