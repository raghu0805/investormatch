import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function EditInvestorProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/investor/me");
      const data = res.data.investorProfile || res.data.data;

      if (data.preferredIndustries && Array.isArray(data.preferredIndustries)) {
        data.preferredIndustries = data.preferredIndustries.join(", ");
      }

      setForm(data);
    } catch (err) {
      setError("Failed to load investor profile");
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
    setError("");

    try {
      const payload = {
        ...form,
        preferredIndustries: typeof form.preferredIndustries === "string" 
          ? form.preferredIndustries.split(",").map((i) => i.trim())
          : form.preferredIndustries,
      };

      await api.put("/investor/update", payload);
      navigate("/investor/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to update profile");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!form) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Edit Investor Profile
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="investorName"
            value={form.investorName || ""}
            onChange={handleChange}
            placeholder="Investor/Company Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <select
            name="investorType"
            value={form.investorType || ""}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          >
            <option value="angel">Angel Investor</option>
            <option value="vc">Venture Capital</option>
            <option value="hni">High Net-worth Individual (HNI)</option>
          </select>

          <input
            type="text"
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <input
            type="number"
            name="minimumInvestment"
            value={form.minimumInvestment || ""}
            onChange={handleChange}
            placeholder="Minimum Investment"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <input
            type="number"
            name="maximumInvestment"
            value={form.maximumInvestment || ""}
            onChange={handleChange}
            placeholder="Maximum Investment"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <select
            name="riskLevel"
            value={form.riskLevel || ""}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>

          <input
            type="text"
            name="preferredIndustries"
            value={form.preferredIndustries || ""}
            onChange={handleChange}
            placeholder="Preferred Industries (comma separated)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <textarea
            name="investmentInterest"
            value={form.investmentInterest || ""}
            onChange={handleChange}
            placeholder="Investment Interest"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="3"
          ></textarea>

          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="2"
          ></textarea>

          <input
            type="text"
            name="websiteURL"
            value={form.websiteURL || ""}
            onChange={handleChange}
            placeholder="Website URL"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold cursor-pointer"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
