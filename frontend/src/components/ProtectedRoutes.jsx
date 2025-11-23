import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/DataContext';
const ProtectedRoutes = ({ children }) => {
  const { token } = useContext(AuthContext);
  console.log(token);
  return token ? children : <Navigate to="/login" />;
}
export default ProtectedRoutes