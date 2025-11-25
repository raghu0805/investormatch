import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/DataContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const role=localStorage.getItem("role")

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">

      {/* Left Side - Brand */}
      <div 
        className="text-xl font-bold tracking-wide cursor-pointer" 
        onClick={() => navigate(`/${role}/dashboard`)}
      >
        InvestMatch
      </div>

      {/* Right Side - Links */}
      <div className="flex items-center space-x-6">

        <NavLink
          to={`/${role}/dashboard`}
          className={({ isActive }) =>
            `hover:text-blue-400 transition ${
              isActive ? "text-blue-400 font-semibold" : ""
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to={`/${role}/request`}
          className={({ isActive }) =>
            `hover:text-blue-400 transition ${
              isActive ? "text-blue-400 font-semibold" : ""
            }`
          }
        >
          Requests
        </NavLink>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
