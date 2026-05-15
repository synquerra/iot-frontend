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
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user_context");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("sessionExpiry");
      sessionStorage.clear();
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // Extract message from response if available
    const responseData = error.response?.data;
    const errorMessage = responseData?.message || responseData?.error_description || responseData?.error || error.message;

    // 2. Handle Network Errors or Timeouts
    if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      error.message = errorMessage || "Connectivity Issue";
      return Promise.reject(error);
    }

    // 3. Handle Validation Errors (422 - Pydantic/FastAPI)
    if (error.response?.status === 422 && responseData?.detail) {
      const details = responseData.detail;
      if (Array.isArray(details)) {
        const messages = details.map(d => {
          const field = d.loc[d.loc.length - 1];
          return `${field}: ${d.msg}`;
        }).join(", ");
        error.message = messages;
      } else {
        error.message = errorMessage;
      }
    } else {
      error.message = errorMessage;
    }

    return Promise.reject(error);
  },
);

export default api;
