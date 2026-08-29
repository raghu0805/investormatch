import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import { jwtDecode } from "jwt-decode";
import { HiMiniEye, HiEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { AuthContext } from "../../context/DataContext";

export function Register() {
  const [viewPassword, setViewPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleGoogleSignup = async (response) => {
    try {
      setLoading(true);
      const user = jwtDecode(response.credential);

      const res = await api.post("/auth/google", {
        mode: "signup",
        email: user.email,
        name: user.name,
        picture: user.picture,
      });

      if (res.data.alreadyExists) {
        const userRole = res.data.user?.role || "student";
        login(res.data.token, userRole, res.data.user);
        toast.success(res.data.message || "Welcome back! Logged in with Google");
        navigate(`/${userRole}/dashboard`);
        return;
      }

      if (res.data.signupAllowed) {
        setGoogleData(res.data);
        setShowRoleSelect(true);

        try {
          const apiUrl = import.meta.env.VITE_N8N_email_URL || "https://n8ninvestormatch.tech/webhook/welcome_message";
          axios.post(apiUrl, {
            name: res.data.name,
            email: res.data.email,
          }).catch(e => console.warn("n8n webhook notification:", e.message));
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      if (errMsg === "Already registered" || errMsg?.toLowerCase().includes("already exists") || errMsg?.toLowerCase().includes("already registered")) {
        toast.error("Account already exists. Please log in.");
        navigate("/login");
      } else {
        toast.error(errMsg || "Google signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/register-google", {
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture,
        role: selectedRole,
      });

      const userRole = res.data.user?.role || selectedRole;
      login(res.data.token, userRole, res.data.user);

      toast.success("Account created successfully!");
      setShowRoleSelect(false);
      navigate(`/${userRole}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to complete role registration");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });

      toast.success(res.data.message || "Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Registration failed";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={showRoleSelect ? "opacity-30 pointer-events-none" : ""}>
        <div className="min-h-screen flex items-center justify-center font-[Jaro] bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/60 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/60"
          >
            <h1 className="text-4xl text-center text-red-500 mb-8 tracking-wide font-bold">
              INVESTMATCH REGISTER
            </h1>

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="text-gray-300 text-lg block mb-1">Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>

              <div className="mb-4">
                <label className="text-gray-300 text-lg block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>

              <div className="mb-4">
                <label className="text-gray-300 text-lg block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={viewPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-3 pr-12 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  />
                  <div
                    onClick={() => setViewPassword(!viewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                  >
                    {viewPassword ? <HiEyeSlash className="text-xl" /> : <HiMiniEye className="text-xl" />}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-gray-300 text-lg block mb-1">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                >
                  <option value="student">Student</option>
                  <option value="investor">Investor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all py-3 rounded-xl text-white font-bold text-xl shadow-[0_0_20px_rgba(255,0,0,0.5)] cursor-pointer"
              >
                {loading ? "CREATING ACCOUNT..." : "REGISTER"}
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="px-3 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="flex justify-center my-4">
              <GoogleLogin
                text="signup_with"
                onSuccess={handleGoogleSignup}
                onError={() => toast.error("Google authentication failed. Please try again.")}
              />
            </div>

            <div className="text-center mt-6 text-gray-400 text-base">
              Already have an account?{" "}
              <Link to="/login" className="text-red-500 hover:text-red-400 font-semibold underline underline-offset-4">
                Log in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {showRoleSelect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] p-8 rounded-2xl border border-red-600 w-full max-w-sm shadow-[0_0_40px_rgba(255,0,0,0.6)]"
          >
            <h2 className="text-2xl text-center text-red-500 mb-2 font-bold">
              Select Your Role
            </h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              Choose how you will be using InvestMatch
            </p>

            <button
              onClick={() => handleRoleSelect("investor")}
              disabled={loading}
              className="w-full py-3 mb-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer transition shadow-lg"
            >
              Investor
            </button>

            <button
              onClick={() => handleRoleSelect("student")}
              disabled={loading}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white border border-gray-600 rounded-xl font-bold cursor-pointer transition shadow-lg"
            >
              Student
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
