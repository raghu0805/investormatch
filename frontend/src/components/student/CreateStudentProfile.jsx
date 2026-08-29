import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function CreateStudentProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentName: "",
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

  const handleChange = (e) => {
    const val = e.target.value;
    if (e.target.name === "studentName") {
      setForm({ ...form, studentName: val, startupName: val });
    } else {
      setForm({ ...form, [e.target.name]: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/student/create", form).catch(() => api.post("/startup/create", form));
      toast.success("Student profile created successfully!");
      navigate("/student/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to create profile");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Student Profile
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="studentName"
            value={form.studentName}
            onChange={handleChange}
            placeholder="Student / Startup / Project Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <input
            type="text"
            name="founderName"
            value={form.founderName}
            onChange={handleChange}
            placeholder="Student Name / Lead Founder"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <input
            type="text"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="Domain / Industry (e.g. EdTech, AI, HealthTech)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location / University City"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <textarea
            name="problemStatement"
            value={form.problemStatement}
            onChange={handleChange}
            placeholder="Problem Statement"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="3"
            required
          ></textarea>

          <textarea
            name="solution"
            value={form.solution}
            onChange={handleChange}
            placeholder="Solution / Project Idea"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="3"
            required
          ></textarea>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short Description (optional)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            rows="2"
          ></textarea>

          <input
            type="text"
            name="pitchDeckURL"
            value={form.pitchDeckURL}
            onChange={handleChange}
            placeholder="Pitch Deck / Project Link (URL)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <input
            type="number"
            name="teamSize"
            value={form.teamSize}
            onChange={handleChange}
            placeholder="Team Size"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
          />

          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          >
            <option value="">Select Project Stage</option>
            <option value="idea">Idea</option>
            <option value="prototype">Prototype</option>
            <option value="MVP">MVP</option>
            <option value="Scale">Scale</option>
          </select>

          <input
            type="number"
            name="fundingNeeded"
            value={form.fundingNeeded}
            onChange={handleChange}
            placeholder="Funding Needed (in ₹)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold cursor-pointer"
          >
            {loading ? "Creating..." : "Create Student Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
