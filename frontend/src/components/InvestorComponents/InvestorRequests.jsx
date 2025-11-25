import { useEffect, useState } from "react";
import api from "../../utils/api";
import Navbar from "../Navbar";

export default function InvestorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/request/received");
      console.log(res);
      setRequests(res.data.data || []);
    } catch (err) {
      console.log("Error fetching requests:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
    <Navbar/>
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Received Requests</h1>

      {requests.length === 0 && (
        <p className="text-center text-gray-400">No received requests yet.</p>
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
              Requested On: {new Date(req.createdAt).toLocaleString()}
            </p>

            <div className="mt-4 flex gap-4">

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
