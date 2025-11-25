import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../../utils/api.js";
import { AuthContext } from "../../context/DataContext";


export default function StartupDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Fetch startup profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/startup/me");
        setProfile(res.data.profile || res.data.data);
        console.log(res.data.profile,res.data.profile._id);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white text-xl font-semibold">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-6 py-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Startup Dashboard</h1>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>

      {/* If no startup profile */}
      {!profile && (
        <div className="text-center mt-20">
          <p className="text-xl mb-6">You haven't created your startup profile yet.</p>
          <button
            onClick={() => navigate("/startup/create")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-lg font-semibold"
          >
            Create Startup Profile
          </button>
        </div>
      )}

      {/* If profile exists */}
      {profile && (
        <div className="grid gap-6 max-w-3xl mx-auto">

          {/* Profile Card */}
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Your Startup Profile</h2>

            <p><span className="font-semibold">Startup Name:</span> {profile.startupName}</p>
            <p><span className="font-semibold">Founder:</span> {profile.founderName}</p>
            <p><span className="font-semibold">Industry:</span> {profile.industry}</p>
            <p><span className="font-semibold">Location:</span> {profile.location}</p>
            <p><span className="font-semibold">Stage:</span> {profile.stage}</p>
            <p><span className="font-semibold">Funding Needed:</span> ₹{profile.fundingNeeded}</p>

            <button
              onClick={() => navigate("/startup/edit")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Edit Profile
            </button>
          </div>

          {/* Match Investors */}
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Find Matching Investors</h2>
            <p className="mb-4">View investors matched using industry, funding, location, and stage.</p>

            <button
              onClick={() => navigate("/startup/matched-investors")}
              className="px-5 py-3 bg-green-600 hover:bg-green-700 text-lg rounded-xl font-semibold"
            >
              View Matches
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
