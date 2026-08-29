import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";

export default function StudentFullProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleNavigation = () => {
    if (location.state?.from === "matched") {
      navigate("/investor/matched-students");
    } else {
      navigate("/investor/request");
    }
  };

  const fetchStudent = async () => {
    try {
      const res = await api.get(`/student/profile/${id}`).catch(() => api.get(`/startup/profile/${id}`));
      setProfile(res.data.profile);
    } catch (err) {
      setError("Failed to load student profile.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudent();
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
        {error || "Profile not found"}
      </div>
    );

  const name = profile.studentName || profile.startupName;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6">
          Student / Project Full Profile
        </h1>

        <div className="space-y-4">
          <p><strong>Student / Project Name:</strong> {name}</p>
          <p><strong>Founder / Student Name:</strong> {profile.founderName}</p>
          <p><strong>Industry / Domain:</strong> {profile.industry}</p>
          <p><strong>Funding Required:</strong> ₹{profile.fundingNeeded}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <p><strong>Stage:</strong> {profile.stage}</p>

          <p><strong>Problem Statement:</strong> {profile.problemStatement}</p>
          <p><strong>Solution:</strong> {profile.solution}</p>
          {profile.description && <p><strong>Description:</strong> {profile.description}</p>}

          {profile.pitchDeckURL && (
            <p>
              <strong>Pitch Deck / Link:</strong>{" "}
              <a
                href={profile.pitchDeckURL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                {profile.pitchDeckURL}
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
