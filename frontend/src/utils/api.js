import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.BACKEND_API_URL || "http://localhost:5000/api").trim();
if (!rawBaseUrl.endsWith('/api') && !rawBaseUrl.endsWith('/api/')) {
  rawBaseUrl = rawBaseUrl.replace(/\/$/, '') + '/api';
}

const API_BASE_URL = rawBaseUrl;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");

console.log("[InvestMatch] Active API URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch Expired/Invalid Tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    if (status === 401 || (status === 403 && errorCode === "INVALID_TOKEN")) {
      // If token expired or invalid, clear cached authentication
      if (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN") {
        console.warn("Session expired or invalid token. Clearing local auth state.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        // If not already on public routes, redirect to login
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/signup" && currentPath !== "/") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;