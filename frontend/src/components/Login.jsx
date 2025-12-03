import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

import { HiMiniEye } from "react-icons/hi2";
import { HiEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";
import { AuthContext } from "../context/DataContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


export default function Login() {
  const [viewPassword,setViewPassword]=useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();

  
  const { login } = useContext(AuthContext);
const handleGoogleLogin = async (response) => {
  try {
    console.log(response)
    const user = jwtDecode(response.credential);
    console.log(user);
    const res = await api.post("/auth/google", {
      mode: "login",
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    console.log(res)

    // If login success
    login(res.data.token, res.data.user.role);
    localStorage.setItem("role", res.data.user.role);

    toast.success("Login Successful");

    if (res.data.user.role === "investor") {
      navigate("/investor/dashboard");
    } else {
      navigate("/startup/dashboard");
    }

  } catch (err) {
    // BACKEND SAYS: User not registered
    toast.error("You don’t have an account. Please sign up first.");
    navigate("/signup");
  }
};


  const handleLogin = async () => {
  try {
    const res = await api.post("/auth/login", { email, password });
    console.log(res);
    login(res.data.token,res.data.user.role);               // update token in context
    localStorage.setItem("role", res.data.user.role);  // store role

    toast.success("Login Successful");

    if (res.data.user.role === "investor") {
      navigate("/investor/dashboard");
    } else {
      navigate("/startup/dashboard");
    }

  } catch (err) {
    toast.error("Invalid email or password");
  }
};

  //   const FetchRole = async (userId) => {
  //   try {
  //     const res = await api.get("/auth/fetch",userId);
  //     console.log(res.data.data.role);
  //     localStorage.setItem("role",res.data.data.role);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // // useEffect(() => {
  // //   FetchRole();
  // // }, []);
  return (

<div className="min-h-screen flex items-center justify-center font-[Jaro] 
  bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]">

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="bg-black/40 backdrop-blur-xl p-10 rounded-2xl shadow-xl 
    w-full max-w-md border border-gray-700"
  >
    <h1 className="text-4xl text-center text-red-600 mb-8 tracking-wide">
      LOGIN
    </h1>

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

    <button
      onClick={handleLogin}
      className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl 
      text-white font-bold text-xl shadow-[0_0_20px_rgba(255,0,0,0.5)] mb-4"
    >
      LOGIN
    </button>
<GoogleLogin
  text="signin_with"
  onSuccess={handleGoogleLogin}
  onError={() => toast.error("Google login failed")}
/>

  </motion.div>
</div>

  );
}
