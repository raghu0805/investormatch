import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";

export default function InvestorFullProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleNavigation = () => {
    if (location.state?.from === "matched") {
      navigate("/student/matched-investors");
    } else {
      navigate("/student/request");
    }
  };

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
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">
        Loading...
      </div>
    );

  if (error || !profile)
    return (
      <div className="text-red-400 text-center mt-10">
        {error || "Investor profile not found"}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6">
          Investor Full Profile
        </h1>

        <div className="space-y-4">
          <p><strong>Name:</strong> {profile.investorName}</p>
          <p><strong>Type:</strong> {profile.investorType?.toUpperCase()}</p>
          <p>
            <strong>Investment Range:</strong> ₹{profile.minimumInvestment} - ₹{profile.maximumInvestment}
          </p>
          <p><strong>Location:</strong> {profile.location}</p>

          <p><strong>Risk Level:</strong> {profile.riskLevel}</p>

          <p>
            <strong>Preferred Industries:</strong>{" "}
            {profile.preferredIndustries?.join(", ")}
          </p>

          <p>
            <strong>Investment Interest:</strong> {profile.investmentInterest}
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
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                {profile.websiteURL}
              </a>
            </p>
          )}
        </div>

        <button
          onClick={handleNavigation}
          className="mt-6 w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 font-semibold cursor-pointer"
        >
          Back
        </button>
      </div>
    </div>
  );
}
