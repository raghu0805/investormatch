import { useEffect, useMemo, useState } from "react";
import ChatWindow from "./ChatWindow";
import api from "../utils/api";
import socket from "../socket";

/* ---------------------------------------------------
   UTILS
--------------------------------------------------- */
function generateRoomId(id1, id2) {
  if (!id1 || !id2) return null;
  return [id1, id2].sort().join("_");
}

export default function MessagesPage() {
  const currentUserId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("accepted");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [sentUsers, setSentUsers] = useState([]);
  const [interestUsers, setInterestUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔑 Used ONLY to reload chat history when reopening chat
  const [forceReload, setForceReload] = useState(Date.now());

  /* ---------------------------------------------------
     DERIVED DATA
  --------------------------------------------------- */
  const usersByTab = useMemo(() => {
    if (activeTab === "accepted") return acceptedUsers;
    if (activeTab === "sent") return sentUsers;
    return interestUsers;
  }, [activeTab, acceptedUsers, sentUsers, interestUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return usersByTab;
    const q = search.toLowerCase();
    return usersByTab.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.subtitle?.toLowerCase().includes(q)
    );
  }, [search, usersByTab]);

  const activeRoomId = useMemo(() => {
    if (!selectedUser) return null;
    return generateRoomId(currentUserId, selectedUser._id);
  }, [currentUserId, selectedUser]);

  /* ---------------------------------------------------
     LOAD CHAT USERS (ON PAGE LOAD)
  --------------------------------------------------- */
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/chat/users");

        setAcceptedUsers(res.data.accepted || []);
        setSentUsers(res.data.sent || []);
        setInterestUsers(res.data.interest || []);
      } catch (err) {
        console.error("Error loading chat users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, []);

  /* ---------------------------------------------------
     CLICK USER → OPEN CHAT + RESET UNREAD
  --------------------------------------------------- */
  const handleUserClick = async (user) => {
    setSelectedUser(user);

    const roomId = generateRoomId(currentUserId, user._id);

    // update last seen (backend unread logic)
    await api.post("/messages/update-last-seen", {
      roomId,
      userId: currentUserId,
    });

    // reset unread locally (UI)
    const resetUnread = (setList) => {
      setList((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, unread: 0 } : u
        )
      );
    };

    resetUnread(setAcceptedUsers);
    resetUnread(setSentUsers);
    resetUnread(setInterestUsers);

    // 🔑 force ChatWindow to reload history
    setForceReload(Date.now());
  };

  /* ---------------------------------------------------
     🔥 REAL-TIME SIDEBAR UPDATE (Socket)
     (This does NOT load messages — only sidebar info)
  --------------------------------------------------- */
  useEffect(() => {
    const handleNewMessage = (msg) => {
      const { roomId, text, createdAt } = msg;

      const otherId = roomId
        .split("_")
        .find((id) => id !== currentUserId);

      const updateList = (setList) => {
        setList((prev) =>
          prev.map((u) =>
            u._id === otherId
              ? {
                  ...u,
                  lastMessage: text,
                  lastMessageTime: createdAt,
                  unread:
                    selectedUser?._id === otherId
                      ? 0
                      : (u.unread || 0) + 1,
                }
              : u
          )
        );
      };

      updateList(setAcceptedUsers);
      updateList(setSentUsers);
      updateList(setInterestUsers);
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [currentUserId, selectedUser]);

  /* ---------------------------------------------------
     UI HELPERS
  --------------------------------------------------- */
  const tabClasses = (tab) =>
    "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-medium cursor-pointer transition " +
    (activeTab === tab
      ? "bg-emerald-500 text-slate-950"
      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700");

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */
  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex">
      {/* LEFT */}
      <aside className="w-16 md:w-20 border-r border-slate-800 flex flex-col items-center py-4 gap-6">
        <div className="text-xs font-semibold text-slate-400">Chats</div>

        <div className="flex flex-col gap-3">
          <div className={tabClasses("accepted")} onClick={() => setActiveTab("accepted")}>✓</div>
          <div className={tabClasses("sent")} onClick={() => setActiveTab("sent")}>→</div>
          <div className={tabClasses("interest")} onClick={() => setActiveTab("interest")}>✦</div>
        </div>
      </aside>

      {/* MIDDLE */}
      <section className="w-72 md:w-80 border-r border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex justify-between">
          <h2 className="text-sm font-semibold">
            {activeTab === "accepted"
              ? "Accepted"
              : activeTab === "sent"
              ? "Requests Sent"
              : "Same Interest"}
          </h2>
          <span className="text-[11px] text-slate-500">{filteredUsers.length} users</span>
        </div>

        <div className="px-3 py-2 border-b border-slate-800">
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="px-4 py-4 text-xs text-slate-500">Loading…</p>}
          {error && <p className="px-4 py-4 text-xs text-rose-400">{error}</p>}

          {!loading &&
            !error &&
            filteredUsers.map((user) => {
              const isActive = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className={
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition " +
                    (isActive ? "bg-slate-800" : "hover:bg-slate-900")
                  }
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{user.name}</p>
                      <span className="text-[10px] text-slate-500">
                        {user.lastMessageTime &&
                          new Date(user.lastMessageTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-400 truncate">
                        {user.lastMessage || user.subtitle}
                      </p>

                      {user.unread > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                          {user.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      {/* RIGHT */}
      <main className="flex-1 flex flex-col">
        {selectedUser && activeRoomId ? (
          <ChatWindow
            roomId={activeRoomId}
            currentUserId={currentUserId}
            otherUser={selectedUser}
            forceReload={forceReload}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a user to start chat
          </div>
        )}
      </main>
    </div>
  );
}
