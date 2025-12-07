import { useEffect, useMemo, useState } from "react";
import ChatWindow from "./ChatWindow";
import api from "../utils/api";

function generateRoomId(id1, id2) {
  return [id1, id2].sort().join("_");
}

export default function MessagesPage() {
  const currentUserId = localStorage.getItem("userId") || "startup123";

  const [activeTab, setActiveTab] = useState("accepted"); // accepted | sent | interest
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [sentUsers, setSentUsers] = useState([]);
  const [interestUsers, setInterestUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Pick correct user list based on active tab */
  const usersByTab = useMemo(() => {
    if (activeTab === "accepted") return acceptedUsers;
    if (activeTab === "sent") return sentUsers;
    return interestUsers;
  }, [activeTab, acceptedUsers, sentUsers, interestUsers]);

  /** Search filter */
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

  /** Compute roomId when a user is selected */
  const activeRoomId = useMemo(() => {
    if (!selectedUser) return null;
    return generateRoomId(currentUserId, selectedUser._id);
  }, [currentUserId, selectedUser]);

  /** Handle user click from list */
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  /** Sidebar tab button style */
  const tabClasses = (tab) =>
    "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-medium cursor-pointer transition " +
    (activeTab === tab
      ? "bg-emerald-500 text-slate-950"
      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700");

  /** Fetch chat users from backend */
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        setError(null);

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

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex">
      {/* LEFT: sidebar tabs */}
      <aside className="w-16 md:w-20 border-r border-slate-800 flex flex-col items-center py-4 gap-6">
        <div className="text-xs font-semibold tracking-wide text-slate-400">
          Chats
        </div>

        <div className="flex flex-col gap-3">
          <div
            className={tabClasses("accepted")}
            title="Accepted users"
            onClick={() => setActiveTab("accepted")}
          >
            ✓
          </div>

          <div
            className={tabClasses("sent")}
            title="Requests sent"
            onClick={() => setActiveTab("sent")}
          >
            →
          </div>

          <div
            className={tabClasses("interest")}
            title="Same interest"
            onClick={() => setActiveTab("interest")}
          >
            ✦
          </div>
        </div>

        <div className="mt-auto text-[10px] text-slate-500">{currentUserId}</div>
      </aside>

      {/* MIDDLE: chat list */}
      <section className="w-72 md:w-80 border-r border-slate-800 flex flex-col">
        {/* header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {activeTab === "accepted"
              ? "Accepted"
              : activeTab === "sent"
              ? "Requests Sent"
              : "Same Interest"}
          </h2>

          <span className="text-[11px] text-slate-500">
            {filteredUsers.length} users
          </span>
        </div>

        {/* search box */}
        <div className="px-3 py-2 border-b border-slate-800">
          <input
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* user list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-4 py-4 text-xs text-slate-500">Loading users…</p>
          )}

          {error && (
            <p className="px-4 py-4 text-xs text-rose-400">{error}</p>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <p className="px-4 py-4 text-xs text-slate-500">
              No users in this category.
            </p>
          )}

          {!loading &&
            !error &&
            filteredUsers.map((user) => {
              const initials =
                user.name
                  ?.split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?";

              const isActive = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className={
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition " +
                    (isActive ? "bg-slate-800/90" : "hover:bg-slate-900/70")
                  }
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-[11px] font-semibold">
                    {initials}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{user.name}</p>
                      <span className="text-[10px] text-slate-500">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {user.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      {/* RIGHT: chat window */}
      <main className="flex-1 flex flex-col">
        {selectedUser && activeRoomId ? (
          <ChatWindow
            roomId={activeRoomId}
            currentUserId={currentUserId}
            otherUser={selectedUser}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium mb-1">
              Select a user to start chat
            </p>
            <p className="text-xs text-slate-500">
              Choose from accepted, sent, or same-interest users.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
