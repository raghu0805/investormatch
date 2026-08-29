import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/DataContext";

export default function ProtectedRoutes({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
