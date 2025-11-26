import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import toast from "react-hot-toast";

export default function MatchedInvestors() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId,setUserId]=useState(null);
  // const [startupId, setStartupId] = useState(null);
  // const [investorId, setInvestorId] = useState(null);
  const handleSendRequest = async (investorId) => {
    try {
      console.log(investorId)
      await api.post("/request/send",{investorId});
      toast.success("Request sent successfully");

    }
    catch (err) {
      toast.error(err.response.data.message);
    }
  }

  // const checkAlreadyRequestSent=async()=>{
    
  // }
  const fetchMatches = async () => {
    try {
      const res = await api.get("/startup/match-investors");

      setMatches(res.data.topInvestor ? [res.data.topInvestor] : []);
      console.log(res.data.topInvestor);
      setUserId(res.data.topInvestor.userId)



      const result_startup = await api.get("/startup/me");
      console.log(result_startup.data.profile.userId);
      // setStartupId(result_startup.data.profile.userId);
    } catch (err) {
      console.log("Error fetching matches", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
    // checkAlreadyRequestSent();

  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-10 text-xl">Loading matches...</div>
    );

  return (
    <>
    <Navbar/>
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
          {matches.map((item, index) => {
            const investor = item;

            return (
              <div
                key={index}
                className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">{investor.investorName}</h2>

                </div>

                <p className="text-gray-300">
                  <strong>Type:</strong> {investor.investorType.toUpperCase()}
                </p>

                <p className="text-gray-300">
                  <strong>Location:</strong> {investor.location}
                </p>

                <p className="text-gray-300">
                  <strong>Investment Range:</strong> ₹{investor.minimumInvestment} - ₹
                  {investor.maximumInvestment}
                </p>

                <p className="text-gray-300">
                  <strong>Risk Level:</strong> {investor.riskLevel}
                </p>

                <p className="text-gray-300">
                  <strong>Preferred Industries:</strong>{" "}
                  {investor.preferredIndustries.join(", ")}
                </p>

                {investor.investmentInterest && (
                  <p className="text-gray-300 mt-2">
                    <strong>Interest:</strong> {investor.investmentInterest}
                  </p>
                )}

                {/* Future feature: Full profile */}
                <button
                  onClick={() => alert("Full profile feature coming soon!")}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-semibold"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => handleSendRequest(investor.userId)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-semibold"
                >
                  Send Request
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/startup/dashboard")}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
    </>
  );
}
