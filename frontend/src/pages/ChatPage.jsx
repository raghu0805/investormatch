// src/pages/ChatPage.jsx
import { useState, useMemo } from "react";
import UserListColumn from "./UserListColumn";
import ChatWindow from "./ChatWindow";

function generateRoomId(id1, id2) {
  return [id1, id2].sort().join("_");
}

export default function ChatPage() {
  const currentUserId = localStorage.getItem("userId") || "startup123"; // temp

  // 👉 Dummy data – later replace with API data
  const acceptedUsers = [
    { _id: "u1", name: "Prasanna", role: "Investor", subtitle: "Accepted request" },
    { _id: "u2", name: "Irfan", role: "Startup", subtitle: "Accepted request" },
  ];

  const requestSentUsers = [
    { _id: "u3", name: "Akash", role: "Investor", subtitle: "Request sent" },
    { _id: "u4", name: "Vignesh", role: "Startup", subtitle: "Request pending" },
  ];

  const sameInterestUsers = [
    { _id: "u5", name: "Puneethan", role: "Investor", subtitle: "AI, Node.js" },
    { _id: "u6", name: "Arjun", role: "Startup", subtitle: "FinTech, Funding" },
    { _id: "u7", name: "Sanjay", role: "Startup", subtitle: "Web Dev, SaaS" },
  ];

  const [activeUser, setActiveUser] = useState(null);

  const activeRoomId = useMemo(() => {
    if (!activeUser) return null;
    return generateRoomId(currentUserId, activeUser._id);
  }, [currentUserId, activeUser]);

  const handleUserClick = (user) => {
    setActiveUser(user); // 👉 This will make column 1 show chat
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Messages</h1>
        <span className="text-xs text-slate-400">
          Logged in as: <span className="font-medium">{currentUserId}</span>
        </span>
      </header>

      {/* 3-column layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
        {/* Column 1: either Accepted list OR Chat */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col">
          {activeUser && activeRoomId ? (
            <ChatWindow
              key={activeRoomId}
              roomId={activeRoomId}
              currentUserId={currentUserId}
              otherUser={activeUser}
            />
          ) : (
            <UserListColumn
              title="Accepted Users"
              badge="Accepted"
              color="green"
              users={acceptedUsers}
              onUserClick={handleUserClick}
            />
          )}
        </div>

        {/* Column 2: Request-sent users */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl">
          <UserListColumn
            title="Request Sent"
            badge="Sent"
            color="yellow"
            users={requestSentUsers}
            onUserClick={handleUserClick}
          />
        </div>

        {/* Column 3: Same-interest users */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl">
          <UserListColumn
            title="Same Interest"
            badge="Match"
            color="blue"
            users={sameInterestUsers}
            onUserClick={handleUserClick}
          />
        </div>
      </div>
    </div>
  );
}
