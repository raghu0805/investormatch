import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import toast from "react-hot-toast";

export default function MatchedInvestors() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSendRequest = async (investorId) => {
    try {
      await api.post("/request/send", { investorId });
      toast.success("Request sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await api.get("/startup/match-investors");

      // res.data.topInvestor = a single investor
      setMatches(res.data.topInvestor ? [res.data.topInvestor] : []);
    } catch (err) {
      console.log("Error fetching matches", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-10 text-xl">Loading matches...</div>
    );

  return (
    <>
      <Navbar />
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

                <p><strong>Type:</strong> {investor.investorType.toUpperCase()}</p>
                <p><strong>Location:</strong> {investor.location}</p>
                <p>
                  <strong>Investment Range:</strong> ₹{investor.minimumInvestment} - ₹
                  {investor.maximumInvestment}
                </p>

                <p><strong>Risk Level:</strong> {investor.riskLevel}</p>

                <p>
                  <strong>Preferred Industries:</strong>{" "}
                  {investor.preferredIndustries.join(", ")}
                </p>

                {investor.investmentInterest && (
                  <p className="mt-2">
                    <strong>Interest:</strong> {investor.investmentInterest}
                  </p>
                )}

                {/* Correct View Profile Button */}
    
       <button
  onClick={() => navigate(`/investor/profile/${investor.userId}`)}
  className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold"
>
  View Full Profile
</button>


                {/* Send Request */}
                <button
                  onClick={() => handleSendRequest(investor.userId)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-semibold"
                >
                  Send Request
                </button>

              </div>
            ))}
          </div>

<div className="flex justify-center mt-8">
  <button
    onClick={() => navigate("/startup/dashboard")}
    className="bg-red-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold"
  >
    Back to Dashboard
  </button>
</div>

        </div>
      </div>
    </>
  );
}
