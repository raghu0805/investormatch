import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import NewsFeedSection from "./NewsFeedSection";
import { useContext } from "react";
import { AuthContext } from "../context/DataContext";

export default function LandingPage() {
  const navigate = useNavigate();
      const { token, role } = useContext(AuthContext);

  
    // useEffect(() => {
    //   if (token && role) {
    //     navigate(`/${role}/dashboard`);
    //   }
    // }, [token, role, navigate]);
  
  return (
    <>
    {token&&role?<><Navbar/></>:""}
    <div className="relative min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* 🟥 BACKGROUND GLOW EFFECT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1 }}
        className="absolute w-[600px] h-[600px] bg-red-700 rounded-full blur-3xl top-[-150px] left-[-150px] z-0"
      ></motion.div>

      {/* 🖼️ BACKGROUND LOGO IMAGE */}
{/* 🖼️ BACKGROUND LOGO WITH SMOOTH LEFT–RIGHT FLOAT ANIMATION */}
{/* 🖼️ ULTRA-PREMIUM BACKGROUND LOGO ANIMATION */}
<motion.img
  src="/invest.png"
  alt="logo"
  className="absolute w-[800px] select-none pointer-events-none opacity-10 z-0"

  initial={{ opacity: 0, scale: 1, rotate: 0, x: -20 }}

  animate={{
    opacity: 0.08,                // smooth watermark
    x: [ -40, 40, -40 ],          // left → right → left floating
    rotate: [0, 5, -5, 0],        // gentle rotation
    scale: [1, 1.05, 1],          // zoom in/out breathing
  }}

  transition={{
    duration: 7,                 // slow and smooth
    repeat: Infinity,             // loop forever
    repeatType: "loop",
    ease: "easeInOut",
  }}
/>




      {/* 🔥 MAIN CONTENT */}
      <div className="relative z-[10] flex flex-col items-center">

        {/* Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold mb-4 text-center"
        >
          <span className="text-red-500">InvestMatch</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-gray-300 text-lg max-w-xl text-center mb-10 leading-relaxed"
        >
          Connect <span className="text-white font-semibold">Startups</span> with  
          <span className="text-white font-semibold"> Investors</span> using 
          intelligent matching powered by structured scoring.
        </motion.p>

        {/* Buttons */}
        {!(token&& role)?<>     <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex space-x-6"
        >
          <button
            onClick={() => navigate("/login")}
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-105 shadow-xl shadow-red-900/40"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="bg-gray-800 border border-red-600 hover:bg-red-700 hover:border-red-700 px-8 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-105"
          >
            Register
          </button>
        </motion.div></>:<></>}
   

        {/* Floating Scroll Text */}
        {/* <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 text-gray-400 text-sm tracking-widest"
        >
          SCROLL TO BEGIN ↓
        </motion.div> */}


      </div>
    </div>
        <NewsFeedSection/>
    </>
  );
}
