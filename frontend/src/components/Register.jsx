import { useState, useState as useStateRegister } from "react";
import { motion as motionRegister } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";


import { HiMiniEye } from "react-icons/hi2";
import { HiEyeSlash } from "react-icons/hi2";


export function Register() {
  const [viewPassword, setViewPassword] = useState(false);
  const [name, setName] = useStateRegister("");
  const [email, setEmail] = useStateRegister("");
  const [password, setPassword] = useStateRegister("");
  const [role, setRole] = useStateRegister("startup");
  const navigate = useNavigate();
  const formData = {
    name,
    email,
    password,
    role
  }

  const handleRegister = async () => {
    console.log({ name, email, password, role });
    await api.post("/auth/signup", formData);
    navigate("/login")
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-[Jaro] bg-cover bg-center ">
      <motionRegister.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-black/40 backdrop-blur-xl p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-700"
      >
        <h1 className="text-4xl text-center text-red-600 mb-8 tracking-wide">REGISTER</h1>

        <div className="mb-6">
          <label className="text-gray-300 text-lg">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-300 text-lg">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-300 text-lg">Password</label>

          <div className="relative mt-2">
            <input
              type={viewPassword?"text":"password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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

        <div className="mb-6">
          <label className="text-gray-300 text-lg">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="startup">Startup</option>
            <option value="investor">Investor</option>
          </select>
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl text-white font-bold text-xl shadow-[0_0_20px_rgba(255,0,0,0.5)]"
        >
          REGISTER
        </button>
      </motionRegister.div>
    </div>
  );
}