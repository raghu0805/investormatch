import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api.js";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/student/me").catch(() => api.get("/startup/me"));
        setProfile(res.data.profile || res.data.data);
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

  const name = profile?.studentName || profile?.startupName || "Your Profile";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
      </div>

      {!profile && (
        <div className="text-center mt-20">
          <p className="text-xl mb-6">
            You haven't created your student profile yet.
          </p>
          <button
            onClick={() => navigate("/student/create")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-lg font-semibold cursor-pointer"
          >
            Create Student Profile
          </button>
        </div>
      )}

      {profile && (
        <div className="grid gap-6 max-w-3xl mx-auto">
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Your Student Profile</h2>

            <p><span className="font-semibold">Student / Project Name:</span> {name}</p>
            <p><span className="font-semibold">Founder / Student Name:</span> {profile.founderName}</p>
            <p><span className="font-semibold">Industry:</span> {profile.industry}</p>
            <p><span className="font-semibold">Location:</span> {profile.location}</p>
            <p><span className="font-semibold">Stage:</span> {profile.stage}</p>
            <p><span className="font-semibold">Funding Needed:</span> ₹{profile.fundingNeeded}</p>

            <button
              onClick={() => navigate("/student/edit")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Find Matching Investors</h2>
            <p className="mb-4">
              View investors matched using industry, funding, location, and stage.
            </p>

            <button
              onClick={() => navigate("/student/matched-investors")}
              className="px-5 py-3 bg-green-600 hover:bg-green-700 text-lg rounded-xl font-semibold cursor-pointer"
            >
              View Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
