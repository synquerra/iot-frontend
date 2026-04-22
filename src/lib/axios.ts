import axios from "axios";
import { toast } from "sonner";

const baseUrl: string = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${baseUrl}`,
  timeout: 30000, // Set timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    if (response.data?.note) {
      toast(response.data.note, { id: response.data.note });
    }
    return response;
  },
  (error) => {
    // 1. Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth_user");
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // 2. Handle Network Errors or Timeouts (No response from server)
    if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // Modify error message to "Internal Server Error" as requested
      error.message = "Internal Server Error";
      return Promise.reject(error);
    }

    // 3. Handle Other Server Errors (5xx, etc)
    if (error.response?.status >= 500) {
      error.message = "Internal Server Error";
    }

    return Promise.reject(error);
  },
);

export default api;
