import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function MatchedInvestors() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSendRequest = async (investorId) => {
    try {
      await api.post("/request/send-student-request", { investorId }).catch(() => api.post("/request/send-startup-request", { investorId }));

      setMatches(prevMatches =>
        prevMatches.map(investor =>
          investor._id === investorId
            ? { ...investor, requestStatus: 'pending' }
            : investor
        )
      );

      toast.success("Request sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await api.get("/student/match-investors").catch(() => api.get("/startup/match-investors"));
      setMatches(Array.isArray(res.data.matches) ? res.data.matches : []);
    } catch (err) {
      console.error("Error fetching matches", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">
        Loading matches...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Matched Investors
        </h1>

        {matches.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-lg">
            No matching investors found.
          </p>
        )}

        <div className="space-y-6">
          {matches.map((investor, index) => (
            <div
              key={index}
              className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600"
            >
              <h2 className="text-xl font-bold mb-3">{investor.investorName}</h2>
              <p><strong>Match Score:</strong> {(investor.similarity * 100).toFixed(0)}%</p>
              <p><strong>Type:</strong> {investor.investorType?.toUpperCase()}</p>
              <p><strong>Location:</strong> {investor.location}</p>
              <p>
                <strong>Investment Range:</strong> ₹{investor.minimumInvestment} - ₹
                {investor.maximumInvestment}
              </p>
              <p><strong>Risk Level:</strong> {investor.riskLevel}</p>
              <p>
                <strong>Preferred Industries:</strong>{" "}
                {investor.preferredIndustries?.join(", ")}
              </p>

              {investor.investmentInterest && (
                <p className="mt-2">
                  <strong>Interest:</strong> {investor.investmentInterest}
                </p>
              )}

              <button
                onClick={() => navigate(`/investor/profile/${investor.userId}`, { state: { from: "matched" } })}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold cursor-pointer"
              >
                View Full Profile
              </button>

              <button
                disabled={!!investor.requestStatus}
                onClick={() => handleSendRequest(investor._id)}
                className={`mt-4 w-full py-2 rounded-lg text-white font-semibold cursor-pointer
                  ${investor.requestStatus
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"}
                `}
              >
                {investor.requestStatus === "pending" ? "Request Sent" :
                  investor.requestStatus === "accepted" ? "Accepted" :
                  investor.requestStatus === "rejected" ? "Rejected" : "Send Request"}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
