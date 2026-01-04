import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";

export default function StartupFullProfile() {
  const { id } = useParams(); // userId of startup
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleNavigation=async()=>{
    if(location.state?.from==="matched"){
      navigate("/startup/matched-investors")
    }
    else{
      navigate("/startup/request")
    }
  }
  const fetchStartup = async () => {
    try {
      const res = await api.get(`/startup/profile/${id}`);
      setProfile(res.data.profile);
    } catch (err) {
      setError("Failed to load startup profile.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStartup();
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
      {/* <Navbar /> */}

      <div className="min-h-screen bg-gray-900 text-white p-6">
        
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl">

          <h1 className="text-3xl font-bold mb-6">
            Startup Full Profile
          </h1>

          <div className="space-y-4">
            <p><strong>Name:</strong> {profile.startupName}</p>
            <p><strong>Type:</strong> {profile.industry}</p>
            <p>
              <strong>Funding Required:</strong>
              ₹{profile.fundingNeeded}
            </p>
            <p><strong>Location:</strong> {profile.location}</p>

            <p><strong>Problem Statement:</strong> {profile.problemStatement}</p>

            <p>
              <strong>Solution:</strong>
              {profile.solution}
            </p>


            {profile.pitchDeckURL && (
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={profile.pitchDeckURL}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  {profile.pitchDeckURL}
                </a>
              </p>
            )}
          </div>

          <button
            onClick={() => handleNavigation()}
            className="mt-6 w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back 
          </button>
        </div>

      </div>
    </>
  );
}
