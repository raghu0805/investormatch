import { useState, useState as useStateRegister } from "react";
import { motion as motionRegister } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";



import { HiMiniEye } from "react-icons/hi2";
import { HiEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export function Register() {
  const [viewPassword, setViewPassword] = useState(false);
  const [email, setEmail] = useStateRegister("");
  const [password, setPassword] = useStateRegister("");
  const [role, setRole] = useStateRegister("startup");
  const navigate = useNavigate();
  const [googleData, setGoogleData] = useState(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const handleGoogleSignup = async (response) => {
    try {
      const user = jwtDecode(response.credential);

      const res = await api.post("/auth/google", {
        mode: "signup",
        email: user.email,
        name: user.name,
        picture: user.picture,
      });
      console.log(res);
      console.log(res.data.signupAllowed);

      if (res.data.signupAllowed) {
        setGoogleData(res.data);
        setShowRoleSelect(true);
        try {
          const apiUrl = import.meta.env.VITE_N8N_email_URL || "https://n8ninvestormatch.tech/webhook/welcome_message";
          const res2 = await axios.post(apiUrl, {
            name: res.data.name,
            email: res.data.email,
          });

          console.log("n8n response:", res2.data);
        } catch (err) {
          console.error(err);
        }
      }
    }
    catch (err) {
      if (err.response?.data?.message === "Already registered") {
        toast.error("Account already exists. Please log in.");
        navigate("/login");
        return;
      }

      // Any other error
      toast.error("Google signup failed");
    }

  };
  const handleRoleSelect = async (selectedRole) => {
    try {
      console.log(selectedRole);
      const res = await api.post("/auth/register-google", {
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture,
        role: selectedRole,
      });

      localStorage.setItem("token", res.data.token);
      navigate(`/${selectedRole}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
      console.log(err);

    }
  };

  const formData = {
    email,
    password,
    role
  }

  const handleRegister = async () => {
    try {

      console.log({ email, password, role });
      localStorage.setItem("role", role);
      await api.post("/auth/signup", formData);

      navigate("/login")
    }
    catch (err) {
      toast.error(err.response.data.error)
      setEmail("");
      setPassword("");
    }
  };


  return (
    <>
      {/* BACKGROUND CONTENT */}
      <div className={showRoleSelect ? "opacity-30" : ""}>
        <div className="min-h-screen flex items-center justify-center font-[Jaro] 
        bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]">

          <motionRegister.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/40 backdrop-blur-xl p-10 rounded-2xl shadow-xl 
            w-full max-w-md border border-gray-700">

            <h1 className="text-4xl text-center text-red-600 mb-8 tracking-wide">
              REGISTER
            </h1>

            {/* EMAIL */}
            <div className="mb-6">
              <label className="text-gray-300 text-lg">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl 
                text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-6">
              <label className="text-gray-300 text-lg">Password</label>

              <div className="relative mt-2">
                <input
                  type={viewPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 bg-gray-900 border border-gray-700 rounded-xl 
                  text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />

                <div
                  onClick={() => setViewPassword(!viewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {viewPassword ? (
                    <HiEyeSlash className="text-white text-xl" />
                  ) : (
                    <HiMiniEye className="text-white text-xl" />
                  )}
                </div>
              </div>
            </div>

            {/* ROLE */}
            <div className="mb-6">
              <label className="text-gray-300 text-lg">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl 
                text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="startup">Startup</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl 
              text-white font-bold text-xl shadow-[0_0_20px_rgba(255,0,0,0.5)]"
            >
              REGISTER
            </button>

            {/* GOOGLE LOGIN BUTTON */}
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                text="signup_with"
                onSuccess={handleGoogleSignup}
                onError={() => toast.error("Google Signup Failed")}
              />
            </div>

          </motionRegister.div>
        </div>
      </div>

      {/* 🔥 ROLE SELECTION OVERLAY OUTSIDE BACKGROUND WRAPPER */}
      {showRoleSelect && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm 
        flex justify-center items-center z-50">

          <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-red-600 w-80 
          shadow-[0_0_40px_rgba(255,0,0,0.6)] scale-100">

            <h2 className="text-2xl text-center text-red-500 mb-6">
              Select Your Role
            </h2>

            <button
              onClick={() => handleRoleSelect("investor")}
              className="w-full py-3 mt-3 bg-red-600 hover:bg-red-700 
              text-white rounded-xl font-bold"
            >
              Investor
            </button>

            <button
              onClick={() => handleRoleSelect("startup")}
              className="w-full py-3 mt-3 bg-red-600 hover:bg-red-700 
              text-white rounded-xl font-bold"
            >
              Startup
            </button>

          </div>
        </div>
      )}
    </>
  );

}