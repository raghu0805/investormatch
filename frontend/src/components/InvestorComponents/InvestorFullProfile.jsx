import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";

export default function InvestorFullProfile() {
  const { id } = useParams(); // userId of investor
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvestor = async () => {
    try {
      const res = await api.get(`/investor/profile/${id}`);
      setProfile(res.data.profile);
    } catch (err) {
      setError("Failed to load investor profile.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestor();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;

  if (error)
    return (
      <div className="text-red-400 text-center mt-10">
        {error}
      </div>
    );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-900 text-white p-6">
        
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl">

          <h1 className="text-3xl font-bold mb-6">
            Investor Full Profile
          </h1>

          <div className="space-y-4">
            <p><strong>Name:</strong> {profile.investorName}</p>
            <p><strong>Type:</strong> {profile.investorType.toUpperCase()}</p>
            <p>
              <strong>Investment Range:</strong>
              ₹{profile.minimumInvestment} - ₹{profile.maximumInvestment}
            </p>

            <p><strong>Location:</strong> {profile.location}</p>

            <p><strong>Risk Level:</strong> {profile.riskLevel}</p>

            <p>
              <strong>Preferred Industries:</strong>{" "}
              {profile.preferredIndustries.join(", ")}
            </p>

            <p>
              <strong>Investment Interest:</strong>
              {profile.investmentInterest}
            </p>

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
            onClick={() => navigate("/startup/matched-investors")}
            className="mt-6 w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Matches
          </button>

        </div>

      </div>
    </>
  );
}
