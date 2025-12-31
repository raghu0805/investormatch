import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../Navbar";

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

const fetchProfile = async () => {
  setLoading(true); 

  try {
    const res = await api.get("/investor/me");
    setProfile(res.data.investorProfile || res.data.data);
  } catch (err) {
    if (err.response?.status === 404) {
      setProfile(null); 
    }
  } finally {
    setLoading(false); 
  }
};

  

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10 text-xl">Loading...</div>;

  return (
<>
  {/* <Navbar /> */}

  <div className="min-h-screen bg-gray-900 text-white p-6">
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
      </div>

      {/* If no investor profile exists */}
      {!profile && (
        <div className="text-center mt-20 bg-gray-800 p-8 rounded-2xl shadow-2xl">
          <p className="text-xl mb-6">
            You haven't created your investor profile yet.
          </p>

          <button
            onClick={() => navigate("/investor/create-profile")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold"
          >
            Create Investor Profile
          </button>
        </div>
      )}

      {/* If investor profile exists */}
      {profile && (
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">

          <h2 className="text-2xl font-semibold mb-6">Your Investor Profile</h2>

          <div className="space-y-4 text-lg">
            <p><strong>Name:</strong> {profile.investorName}</p>
            <p><strong>Investor Type:</strong> {profile.investorType?.toUpperCase()}</p>
            <p><strong>Location:</strong> {profile.location}</p>
            <p><strong>Investment Range:</strong> ₹{profile.minimumInvestment} - ₹{profile.maximumInvestment}</p>
            <p><strong>Risk Level:</strong> {profile.riskLevel}</p>
            <p>
              <strong>Preferred Industries:</strong>{" "}
              {profile.preferredIndustries?.join(", ")}
            </p>
            <p><strong>Investment Interest:</strong> {profile.investmentInterest}</p>

            {profile.description && (
              <p><strong>Description:</strong> {profile.description}</p>
            )}

            {profile.websiteURL && (
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={profile.websiteURL}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  {profile.websiteURL}
                </a>
              </p>
            )}
          </div>

          <button
            onClick={() => navigate("/investor/edit-profile")}
            className="mt-6 w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 text-white font-semibold"
          >
            Edit Profile
          </button>
                  <button
          onClick={() => navigate("/messages")}
          className="
            fixed bottom-6 right-6 
            bg-emerald-600 hover:bg-emerald-500 
            text-white rounded-full shadow-lg shadow-emerald-800/40 
            w-14 h-14 flex items-center justify-center 
            text-2xl font-bold 
            transition transform hover:scale-110
          "
        >
          💬
        </button>
        </div>
      )}

    </div>
  </div>
</>

  );
}
