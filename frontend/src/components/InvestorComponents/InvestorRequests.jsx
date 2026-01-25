import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../Navbar";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";

export default function InvestorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //SOCKET LOGIC
  useEffect(() => {
    // 1. Connect
    const socket = io("http://localhost:5000"); // Use your backend URL
    // const socket = io("https://investormatch-backend-yn2k.onrender.com");

    // Use your backend URL
    // 2. Get User ID from token
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const myUserId = decoded.id; // Ensure this matches your token structure
      // 3. Join User Room
      socket.emit("join-user-room", myUserId);
      // 4. Listen for updates
      socket.on("request-status-updated", (data) => {
        console.log("Status updated real-time:", data);
        fetchRequests(); // Refetch data to update UI
      });
    }    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  const [activeTab, setActiveTab] = useState("received");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === "received") {
        res = await api.get("/request/received");
      } else {
        res = await api.get("/request/investor/sent");
      }

      console.log(`Requests (${activeTab}):`, res);
      const data = res.data.data;
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.log("Error fetching requests:", err);
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const updateStatus = async (requestId, status) => {
    try {
      await api.put("/request/update", { requestId, status });
      fetchRequests(); // refresh list
    } catch (err) {
      console.log("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
        Loading requests...
      </div>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Requests</h1>

        {/* TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 p-1 rounded-xl flex gap-2">
            <button
              onClick={() => setActiveTab("received")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "received" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Received (Startups)
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "sent" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Sent (By Me)
            </button>
          </div>
        </div>

        {requests.length === 0 && (
          <p className="text-center text-gray-400">No {activeTab} requests found.</p>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700"
            >
              <h2 className="text-xl font-semibold">
                Startup: {req.startupId?.startupName || "Unknown Startup"}
              </h2>

              <p className="mt-1 text-gray-300">
                Founder: {req.startupId?.founderName}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {activeTab === "received" ? "Requested On:" : "Sent On:"} {new Date(req.createdAt).toLocaleString()}
              </p>

              <div className="mt-4 flex gap-4">

                {/* ONLY SHOW ACCEPT/REJECT IF RECEIVED */}
                {activeTab === "received" && (
                  <>
                    <button
                      onClick={() => updateStatus(req._id, "accepted")}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateStatus(req._id, "rejected")}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate("/chats", {
                    state: {
                      selectedChat: {
                        requestId: req._id,
                        name: req.startupId?.startupName || "Unknown Startup",
                      }
                    }
                  })}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Message
                </button>
              </div>

              <p className="mt-3 text-gray-400">
                Current Status:
                <span className={`ml-2 
                ${req.status === "accepted" ? "text-green-400" : ""} 
                ${req.status === "rejected" ? "text-red-400" : ""} 
                ${req.status === "pending" ? "text-yellow-400" : ""}
              `}>
                  {req.status.toUpperCase()}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
