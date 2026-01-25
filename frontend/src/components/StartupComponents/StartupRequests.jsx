import { useEffect, useState } from "react";
import api from "../../utils/api.js";
import toast from "react-hot-toast";
import Navbar from "../Navbar.jsx";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";

export default function StartupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();
  //SOCKET LOGIC
  useEffect(() => {
    // 1. Connect
    const socket = io("http://localhost:5000");
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
  const [activeTab, setActiveTab] = useState("sent");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "sent") {
        res = await api.get("/request/sent");
      } else {
        res = await api.get("/request/startup/received");
      }

      const data = res.data.data;
      console.log(`Startup Requests (${activeTab}):`, data);

      if (!data) {
        setRequests([]);
      } else if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([data]);
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
      fetchRequests();
      toast.success(`Request ${status} successfully`);
    } catch (err) {
      console.log("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
        Loading your sent requests...
      </div>
    );
  }

  return (
    <>
      {/* <Navbar /> */}

      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Requests</h1>

        {/* TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 p-1 rounded-xl flex gap-2">
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "sent" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Sent (By Me)
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "received" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Received (Investors)
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
              className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-2">
                {req.investorId?.investorName || "Unknown Investor"}
              </h2>

              <p className="text-gray-300">
                <strong>Type:</strong>{" "}
                {req.investorId?.investorType?.toUpperCase() || "N/A"}
              </p>

              <p className="text-gray-300">
                <strong>Location:</strong> {req.investorId?.location || "N/A"}
              </p>

              <p className="text-gray-300">
                <strong>Investment Range:</strong> ₹
                {req.investorId?.minimumInvestment} – ₹
                {req.investorId?.maximumInvestment}
              </p>

              <p className="text-gray-300">
                <strong>Risk Level:</strong> {req.investorId?.riskLevel}
              </p>

              <p className="text-gray-300">
                <strong>Preferred Industries:</strong>{" "}
                {req.investorId?.preferredIndustries?.join(", ") || "N/A"}
              </p>

              <p className="mt-2">
                <strong>Status: </strong>
                {req.status === "accepted" && (
                  <span className="px-3 py-1 rounded-lg bg-green-600 text-white">
                    Accepted
                  </span>
                )}
                {req.status === "pending" && (
                  <span className="px-3 py-1 rounded-lg bg-yellow-600 text-white">
                    Pending
                  </span>
                )}
                {req.status === "rejected" && (
                  <span className="px-3 py-1 rounded-lg bg-red-600 text-white">
                    Rejected
                  </span>
                )}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {activeTab === "sent" ? "Sent On:" : "Received On:"} {new Date(req.createdAt).toLocaleString()}
              </p>

              {/* SHOW ACTION BUTTONS IF RECEIVED */}
              {activeTab === "received" && req.status === "pending" && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => updateStatus(req._id, "accepted")}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold w-full"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(req._id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold w-full"
                  >
                    Reject
                  </button>
                </div>
              )}


              <button
                onClick={() =>
                  Navigate(`/chats`, {
                    state: {
                      selectedChat: {
                        requestId: req._id,
                        name: req.investorId?.investorName || "Unknown Investor",
                      },
                    },
                  })
                }
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
              >
                Message
              </button>

              <button
                onClick={() =>
                  Navigate(`/investor/profile/${req.investorId?.userId}`, { state: { from: "request" } })
                }
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
              >
                View Full Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
