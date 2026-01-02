import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import toast from "react-hot-toast";

export default function MatchedInvestors() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(false);
  
  const handleSendRequest = async (investorId) => {
    try {
      // alert(investorId);
      await api.post("/request/send-startup-request", { investorId });
      setRequestStatus(!requestStatus);
      toast.success("Request sent successfully");
    } catch (err) {
      toast.error("message:",err.response?.data?.message || "Failed to send request")
      console.log("message:",err.response?.data?.message);
    }
  };

  const fetchMatches = async () => {
  try {
    const res = await api.get("/startup/match-investors");

    // setMatches(res.data.topInvestor ? [res.data.topInvestor] : []);
    setMatches(res.data.matches || []);


    if (res.data.matches) {
      const investorId = res.data.matches._id;

      const investor_data = await api.get(
        `/request/check_request/from-startup?investorId=${investorId}`
      );
      console.log(investor_data)

      setRequestStatus(investor_data.data.exists === true);
    }

  } catch (err) {
          setRequestStatus(!requestStatus);
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
      {/* <Navbar /> */}
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
                <p><strong>Match:</strong> {(investor.similarity * 100).toFixed(0)}%</p>


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
                  onClick={() => navigate(`/investor/profile/${investor.userId}`,{state:{from:"matched"}})}
                  className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold"
                >
                  View Full Profile
                </button>


                {/* Send Request */}
<button
  disabled={requestStatus === true}
  onClick={() => handleSendRequest(investor._id)}
  className={`mt-4 w-full py-2 rounded-lg text-white font-semibold 
    ${requestStatus === true 
      ? "bg-gray-500 cursor-not-allowed" 
      : "bg-green-600 hover:bg-green-700"}
  `}
>
  {requestStatus === true ? "Request Already Sent" : "Send Request"}
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
