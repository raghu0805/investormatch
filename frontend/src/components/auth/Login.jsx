import { useContext, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { HiMiniEye, HiEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/DataContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [viewPassword, setViewPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      const user = jwtDecode(response.credential);
      const res = await api.post("/auth/google", {
        mode: "login",
        email: user.email,
        name: user.name,
        picture: user.picture,
      });

      const role = res.data.user.role;
      login(res.data.token, role, res.data.user);

      toast.success(res.data.message || "Login Successful");

      if (role === "investor") {
        navigate("/investor/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error;
      if (errorMessage === "User not registered. Please sign up first." || err.response?.status === 404) {
        toast.error("You don’t have an account yet. Please sign up first.");
        navigate("/signup");
      } else {
        toast.error(errorMessage || "Google login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      
      const role = res.data.user.role;
      login(res.data.token, role, res.data.user);

      toast.success(res.data.message || "Login Successful");

      if (role === "investor") {
        navigate("/investor/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Invalid email or password";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-[Jaro] bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-black/60 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/60"
      >
        <h1 className="text-4xl text-center text-red-500 mb-8 tracking-wide font-bold">
          INVESTMATCH LOGIN
        </h1>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
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

          <div className="mb-6">
            <label className="text-gray-300 text-lg block mb-1">Password</label>
            <div className="relative">
              <input
                type={viewPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all py-3 rounded-xl text-white font-bold text-xl shadow-[0_0_20px_rgba(255,0,0,0.5)] mb-5 cursor-pointer"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <div className="flex justify-center my-4">
          <GoogleLogin
            text="signin_with"
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
          />
        </div>

        <div className="text-center mt-6 text-gray-400 text-base">
          Don't have an account?{" "}
          <Link to="/signup" className="text-red-500 hover:text-red-400 font-semibold underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
