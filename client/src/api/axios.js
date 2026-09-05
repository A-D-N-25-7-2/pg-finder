import axios from "axios";
import toast from "react-hot-toast";

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.endsWith("/api/v1")
    ? configuredApiUrl
    : `${configuredApiUrl}/api/v1`
  : "/api/v1";

const API = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach JWT ─────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — global error handling ─────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong";

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      toast.error("Access denied. You don't have permission.");
    } else if (status === 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default API;
