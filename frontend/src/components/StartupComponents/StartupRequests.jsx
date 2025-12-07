import { useEffect, useState } from "react";
import api from "../../utils/api.js";
import toast from "react-hot-toast";
import Navbar from "../Navbar.jsx";
import {  useNavigate } from "react-router-dom";

export default function StartupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const Navigate=useNavigate();
  const fetchRequests = async () => {
    try {
      const res = await api.get("/request/sent");
      const data = res.data.data;
      // alert(data);
      console.log(data);

      if (!data) {
        setRequests([]);
      } else if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([data]);
      }

    } catch (err) {
      console.log("Error fetching requests:", err);
    }
    setLoading(false);
    console.log(requests)
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
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Sent Requests</h1>

        {requests.length === 0 && (
          <p className="text-center text-gray-400">No requests sent yet.</p>
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
                Sent On: {new Date(req.createdAt).toLocaleString()}
              </p>

              <button
                onClick={() =>
                  Navigate(`/investor/profile/${req.investorId?.userId}`,{state:{from:"request"}})
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
