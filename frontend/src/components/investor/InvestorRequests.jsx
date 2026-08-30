import { useEffect, useState } from "react";
import api, { SOCKET_URL } from "../../utils/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function InvestorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");

  const fetchRequests = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      let res;
      if (activeTab === "received") {
        res = await api.get("/request/received");
      } else {
        res = await api.get("/request/investor/sent");
      }

      const data = res.data.data;
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (showLoading) setRequests([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(true);
  }, [activeTab]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    socket.on("requestStatusUpdated", ({ requestId, status }) => {
      setRequests(prev =>
        prev.map(req => req._id === requestId ? { ...req, status } : req)
      );
    });

    return () => socket.disconnect();
  }, []);

  const updateStatus = async (requestId, status) => {
    setRequests(prev =>
      prev.map(req => req._id === requestId ? { ...req, status } : req)
    );

    try {
      await api.put("/request/update", { requestId, status });
      toast.success(`Request ${status} successfully`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
      fetchRequests(false);
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Requests</h1>

      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 p-1 rounded-xl flex gap-2">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "received" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Received (Students)
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "sent" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
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
        {requests.map((req) => {
          const student = req.studentId || req.startupId;
          const studentName = student?.studentName || student?.startupName || "Unknown Student";
          return (
            <div
              key={req._id}
              className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700"
            >
              <h2 className="text-xl font-semibold">
                Student / Project: {studentName}
              </h2>

              <p className="mt-1 text-gray-300">
                Founder / Student: {student?.founderName || "N/A"}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {activeTab === "received" ? "Requested On:" : "Sent On:"} {new Date(req.createdAt).toLocaleString()}
              </p>

              {activeTab === "received" && req.status === "pending" && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => updateStatus(req._id, "accepted")}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => updateStatus(req._id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}

              <p className="mt-3 text-gray-400">
                Current Status:
                <span className={`ml-2 
                ${req.status === "accepted" ? "text-green-400" : ""} 
                ${req.status === "rejected" ? "text-red-400" : ""} 
                ${req.status === "pending" ? "text-yellow-400" : ""}
              `}>
                  {req.status?.toUpperCase()}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
