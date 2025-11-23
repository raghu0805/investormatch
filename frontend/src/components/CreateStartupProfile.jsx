import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function CreateStartupProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    startupName: "",
    founderName: "",
    industry: "",
    location: "",
    problemStatement: "",
    solution: "",
    description: "",
    pitchDeckURL: "",
    teamSize: "",
    stage: "",
    fundingNeeded: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/startup/create", form);
      navigate("/startup/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create profile");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Startup Profile
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Startup Name */}
          <input
            type="text"
            name="startupName"
            value={form.startupName}
            onChange={handleChange}
            placeholder="Startup Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          {/* Founder Name */}
          <input
            type="text"
            name="founderName"
            value={form.founderName}
            onChange={handleChange}
            placeholder="Founder Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          {/* Industry */}
          <input
            type="text"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="Industry (e.g. FinTech, HealthTech)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          {/* Location */}
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          {/* Problem Statement */}
          <textarea
            name="problemStatement"
            value={form.problemStatement}
            onChange={handleChange}
            placeholder="Problem Statement"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="3"
            required
          ></textarea>

          {/* Solution */}
          <textarea
            name="solution"
            value={form.solution}
            onChange={handleChange}
            placeholder="Solution"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="3"
            required
          ></textarea>

          {/* Description */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short Description (optional)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="2"
          ></textarea>

          {/* Pitch Deck URL */}
          <input
            type="text"
            name="pitchDeckURL"
            value={form.pitchDeckURL}
            onChange={handleChange}
            placeholder="Pitch Deck URL"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          {/* Team Size */}
          <input
            type="number"
            name="teamSize"
            value={form.teamSize}
            onChange={handleChange}
            placeholder="Team Size"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          {/* Stage */}
          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          >
            <option value="">Select Stage</option>
            <option value="idea">Idea</option>
            <option value="prototype">Prototype</option>
            <option value="MVP">MVP</option>
            <option value="Scale">Scale</option>
          </select>

          {/* Funding Needed */}
          <input
            type="number"
            name="fundingNeeded"
            value={form.fundingNeeded}
            onChange={handleChange}
            placeholder="Funding Needed"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
