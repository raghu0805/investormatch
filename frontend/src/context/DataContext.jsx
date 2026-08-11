import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (e) {
    return false;
  }
};

const DataContext = ({ children }) => {
  const initialToken = localStorage.getItem("token");
  const initialRole = localStorage.getItem("role");
  const initialUserId = localStorage.getItem("userId");

  const [token, setToken] = useState(isTokenValid(initialToken) ? initialToken : null);
  const [role, setRole] = useState(isTokenValid(initialToken) ? initialRole : null);
  const [userId, setUserId] = useState(isTokenValid(initialToken) ? initialUserId : null);
  const [user, setUser] = useState(null);

  // Clean stale tokens on initial mount if expired
  useEffect(() => {
    if (initialToken && !isTokenValid(initialToken)) {
      console.warn("Expired token detected on startup. Clearing auth state.");
      logout();
    }
  }, []);

  const login = (newToken, newRole, userData = null) => {
    setToken(newToken);
    setRole(newRole);

    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);

    let extractedUserId = null;
    if (userData && (userData.id || userData._id)) {
      extractedUserId = userData.id || userData._id;
      setUser(userData);
      localStorage.setItem("userId", extractedUserId);
    } else {
      try {
        const decoded = jwtDecode(newToken);
        extractedUserId = decoded.id;
        localStorage.setItem("userId", extractedUserId);
      } catch (e) {
        console.error("Error decoding token in login context:", e);
      }
    }
    setUserId(extractedUserId);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, user, login, logout, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
};

export default DataContext;
