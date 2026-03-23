import axios from "axios";
import { toast } from "sonner";

const baseUrl: string = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${baseUrl}`, // ✅ use env variable properly
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token to all requests
// axios.ts or api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // FIXED
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => {
    if (response.data?.note) {
      toast(response.data.note, { id: response.data.note });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken"); // ✅ match key
      localStorage.removeItem("auth_user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default api;
