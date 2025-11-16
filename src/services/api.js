// src/services/api.js
import axios from "axios";

// 👇 Base URL of your backend (change if needed)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8020/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Optional: Automatically attach token if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global error handler (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
