import { useEffect, useState } from "react";
import api from "../../utils/api.js";

export default function StartupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/request/sent");
      console.log(res);
      setRequests([res.data.data] || []);
    } catch (err) {
      console.log("Error fetching requests:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
        Loading your sent requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Sent Requests</h1>

      {/* If no requests */}
      {requests.length === 0 && (
        <p className="text-center text-gray-400">No requests sent yet.</p>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700"
          >
            <h2 className="text-xl font-semibold">
              Investor: {req.investorId?.investorName || "Unknown Investor"}
            </h2>

            <p className="mt-2">
              <strong>Status:</strong>{" "}
              <span
                className={
                  req.status === "accepted"
                    ? "text-green-400"
                    : req.status === "rejected"
                    ? "text-red-400"
                    : "text-yellow-400"
                }
              >
                {req.status.toUpperCase()}
              </span>
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Sent On: {new Date(req.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
