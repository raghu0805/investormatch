import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/investor/me");
      setProfile(res.data.investorProfile || res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        return navigate("/investor/create-profile");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10 text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl">

        <h1 className="text-3xl font-bold mb-6">Investor Dashboard</h1>

        <div className="space-y-4 text-lg">
          <p><strong>Name:</strong> {profile.investorName}</p>
          <p><strong>Investor Type:</strong> {profile.investorType.toUpperCase()}</p>
          <p><strong>Location:</strong> {profile.location}</p>

          <p>
            <strong>Investment Range:</strong> ₹{profile.minimumInvestment} - ₹{profile.maximumInvestment}
          </p>

          <p><strong>Risk Level:</strong> {profile.riskLevel}</p>

          <p>
            <strong>Preferred Industries:</strong>{" "}
            {profile.preferredIndustries.join(", ")}
          </p>

          <p><strong>Investment Interest:</strong> {profile.investmentInterest}</p>

          {profile.description && (
            <p><strong>Description:</strong> {profile.description}</p>
          )}

          {profile.websiteURL && (
            <p>
              <strong>Website:</strong>{" "}
              <a href={profile.websiteURL} target="_blank" className="text-blue-400 underline">
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

      </div>
    </div>
  );
}
