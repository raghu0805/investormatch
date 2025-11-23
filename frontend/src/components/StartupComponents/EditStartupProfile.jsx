import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";

export default function EditStartupProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/startup/me");
      setForm(res.data.profile || res.data.data);
    } catch (err) {
      setError("Failed to load profile");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/startup/update", form);
      navigate("/startup/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!form) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Edit Startup Profile
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Input Fields */}
          {[
            "startupName",
            "founderName",
            "industry",
            "location",
            "problemStatement",
            "solution",
            "description",
            "pitchDeckURL",
            "teamSize",
            "fundingNeeded"
          ].map((field) => (
            <input
              key={field}
              type={field === "teamSize" || field === "fundingNeeded" ? "number" : "text"}
              name={field}
              value={form[field] || ""}
              onChange={handleChange}
              placeholder={field}
              className="  w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            />
          ))}

          {/* Stage */}
          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          >
            <option value="idea">Idea</option>
            <option value="prototype">Prototype</option>
            <option value="MVP">MVP</option>
            <option value="Scale">Scale</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Update Profile
          </button>

        </form>
      </div>
    </div>
  );
}
