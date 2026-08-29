import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import toast from "react-hot-toast";

export default function EditStudentProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/student/me").catch(() => api.get("/startup/me"));
      const p = res.data.profile || res.data.data;
      if (p) {
        if (!p.studentName && p.startupName) p.studentName = p.startupName;
        setForm(p);
      }
    } catch (err) {
      setError("Failed to load profile");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
    try {
      await api.put("/student/update", form).catch(() => api.put("/startup/update", form));
      toast.success("Student profile updated successfully!");
      navigate("/student/dashboard");
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
          Edit Student Profile
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "studentName", label: "Student / Project Name" },
            { name: "founderName", label: "Student / Founder Name" },
            { name: "industry", label: "Domain / Industry" },
            { name: "location", label: "Location" },
            { name: "problemStatement", label: "Problem Statement" },
            { name: "solution", label: "Solution" },
            { name: "description", label: "Description" },
            { name: "pitchDeckURL", label: "Pitch Deck / Project URL" },
            { name: "teamSize", label: "Team Size" },
            { name: "fundingNeeded", label: "Funding Needed (in ₹)" }
          ].map((field) => (
            <div key={field.name}>
              <label className="text-gray-300 text-sm block mb-1">{field.label}</label>
              <input
                type={field.name === "teamSize" || field.name === "fundingNeeded" ? "number" : "text"}
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                placeholder={field.label}
                className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
              />
            </div>
          ))}

          <div>
            <label className="text-gray-300 text-sm block mb-1">Stage</label>
            <select
              name="stage"
              value={form.stage || "idea"}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
            >
              <option value="idea">Idea</option>
              <option value="prototype">Prototype</option>
              <option value="MVP">MVP</option>
              <option value="Scale">Scale</option>
            </select>
          </div>

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
