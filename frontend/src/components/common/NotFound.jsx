import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      {/* Floating red glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
        className="absolute w-[500px] h-[500px] bg-red-700 rounded-full blur-3xl top-[-150px] left-[-100px]"
      ></motion.div>

      {/* 404 Animated Number */}
      <motion.h1
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-8xl font-extrabold text-red-500 drop-shadow-lg z-10"
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-gray-300 text-xl mt-4 text-center z-10"
      >
        Oops! The page you're looking for doesn't exist.
      </motion.p>

      {/* Back Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        onClick={() => navigate("/")}
        className="mt-8 bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-semibold text-white 
                   transition transform hover:scale-105 shadow-xl shadow-red-900/40 z-10 cursor-pointer"
      >
        Go Back Home
      </motion.button>
    </div>
  );
}
