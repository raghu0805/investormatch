import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function CreateInvestorProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    investorName: "",
    investorType: "",
    location: "",
    minimumInvestment: "",
    maximumInvestment: "",
    riskLevel: "",
    preferredIndustries: "",
    investmentInterest: "",
    description: "",
    websiteURL: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      preferredIndustries: form.preferredIndustries.split(",").map(i => i.trim())
    };

    try {
      await api.post("/investor/create", payload);
      navigate("/investor/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to create profile");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Investor Profile
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="investorName"
            value={form.investorName}
            onChange={handleChange}
            placeholder="Investor/Company Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <select
            name="investorType"
            value={form.investorType}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          >
            <option value="">Select Investor Type</option>
            <option value="angel">Angel Investor</option>
            <option value="vc">Venture Capital</option>
            <option value="hni">High Net-worth Individual (HNI)</option>
          </select>

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <input
            type="number"
            name="minimumInvestment"
            value={form.minimumInvestment}
            onChange={handleChange}
            placeholder="Minimum Investment (in ₹)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <input
            type="number"
            name="maximumInvestment"
            value={form.maximumInvestment}
            onChange={handleChange}
            placeholder="Maximum Investment (in ₹)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <select
            name="riskLevel"
            value={form.riskLevel}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          >
            <option value="">Select Risk Level</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>

          <input
            type="text"
            name="preferredIndustries"
            value={form.preferredIndustries}
            onChange={handleChange}
            placeholder="Preferred Industries (comma separated, e.g. FinTech, AI)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <textarea
            name="investmentInterest"
            value={form.investmentInterest}
            onChange={handleChange}
            placeholder="Investment Interest (e.g. seed stage student projects)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="3"
            required
          ></textarea>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description (optional)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="2"
          ></textarea>

          <input
            type="text"
            name="websiteURL"
            value={form.websiteURL}
            onChange={handleChange}
            placeholder="Website URL (optional)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold cursor-pointer"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
