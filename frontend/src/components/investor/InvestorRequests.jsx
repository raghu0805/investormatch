import { useEffect, useState } from "react";
import api, { SOCKET_URL } from "../../utils/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const GmailIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45,16.2l-5,2.75V37c0,1.1-0.9,2-2,2h-7V22.667L45,16.2z"/>
    <path fill="#34A853" d="M3,16.2l5,2.75V37c0,1.1,0.9,2,2,2h7V22.667L3,16.2z"/>
    <path fill="#EA4335" d="M45,11.5v4.7L24,28.8L3,16.2v-4.7c0-2.32,2.65-3.64,4.5-2.25L24,18l16.5-8.75C42.35,7.86,45,9.18,45,11.5z"/>
    <path fill="#FBBC05" d="M37,18.95V37h4c1.1,0,2-0.9,2-2V16.2L37,18.95z"/>
    <path fill="#C5221F" d="M11,18.95V37H7c-1.1,0-2-0.9-2-2V16.2L11,18.95z"/>
  </svg>
);

const handleGmailConnect = (email, recipientName, projectName) => {
  if (!email) {
    toast.error("Contact email not available");
    return;
  }
  const subject = `InvestMatch Connection: Discussion regarding ${projectName || "Project"}`;
  const body = `Hi ${recipientName || "Founder"},\n\nGreat connecting with you on InvestMatch! Our connection request has been accepted.\n\nI would like to schedule a time to discuss ${projectName || "your project"} further. Please let me know your availability for a quick call or meeting.\n\nBest regards,`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, "_blank");
};

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
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5
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
          const founderName = student?.founderName || "Founder";
          const studentEmail = student?.contactEmail || student?.userId?.email || student?.email;

          return (
            <div
              key={req._id}
              className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Student / Project: {studentName}
                  </h2>

                  <p className="mt-1 text-gray-300">
                    Founder / Student: {founderName}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {activeTab === "received" ? "Requested On:" : "Sent On:"} {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Right side Contact Info when Accepted */}
                {req.status === "accepted" && (
                  <div className="bg-gray-900/90 border border-green-500/50 p-4 rounded-xl flex flex-col items-start md:items-end gap-2 shadow-xl w-full md:w-auto">
                    <span className="text-xs uppercase tracking-wider text-green-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Connected Contact
                    </span>
                    {studentEmail ? (
                      <>
                        <span className="text-sm text-gray-200 font-mono bg-gray-800 px-3 py-1 rounded-md border border-gray-700">
                          {studentEmail}
                        </span>
                        <button
                          onClick={() => handleGmailConnect(studentEmail, founderName, studentName)}
                          title="Compose Email via Gmail"
                          className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-600 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all cursor-pointer shadow-md hover:border-red-500 hover:scale-105 mt-1"
                        >
                          <GmailIcon className="w-5 h-5" />
                          <span>Connect via Gmail</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Email not specified</span>
                    )}
                  </div>
                )}
              </div>

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
                ${req.status === "accepted" ? "text-green-400 font-semibold" : ""} 
                ${req.status === "rejected" ? "text-red-400 font-semibold" : ""} 
                ${req.status === "pending" ? "text-yellow-400 font-semibold" : ""}
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
