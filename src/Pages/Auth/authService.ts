import api from "@/lib/axios";
import {
  parseAuthResponse,
  clearPersistedContext,
} from "@/helpers/authResponseParser";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string) {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function isSessionValid() {
  const sessionExpiry = localStorage.getItem("sessionExpiry");
  if (!sessionExpiry) return false;

  const expiryDate = new Date(sessionExpiry);
  const now = new Date();

  return now < expiryDate;
}

export function clearRememberMe() {
  localStorage.removeItem("rememberedEmail");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("sessionExpiry");
}

export function checkAuthAndLogout() {
  const token = localStorage.getItem("accessToken");

  if (!isSessionValid() || !token || isTokenExpired(token)) {
    logoutUser();
    return false;
  }

  return true;
}

export async function authenticateUser(email: string, password: string) {
  const query = `
    mutation {
      signin(input: { email: "${email}", password: "${password}" }) {
        uniqueId
        firstName
        lastName
        email
        imei
        userType
        mobile
        tokens {
          accessToken
          refreshToken
        }
        lastLoginAt
        message
      }
    }
  `;

  try {
    const res = await api.post("/auth/signin-query", { query });
    const data = res.data;

    if (data.status === "success" && data.data?.tokens) {
      const parsedContext = parseAuthResponse(data.data);

      localStorage.setItem("accessToken", parsedContext.tokens.accessToken);
      localStorage.setItem("refreshToken", parsedContext.tokens.refreshToken);
      localStorage.setItem("userEmail", parsedContext.email || "");

      return parsedContext;
    }

    throw new Error(data.error_description || data.message || "Login failed");
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error_description ||
        error.message;
      throw new Error(message);
    }

    throw new Error(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  return !isTokenExpired(token);
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
  sessionStorage.clear();

  clearPersistedContext();

  const rememberMe = localStorage.getItem("rememberMe") === "true";
  if (!rememberMe) {
    clearRememberMe();
  } else {
    localStorage.removeItem("sessionExpiry");
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const API_URL = `${API_BASE_URL}/auth/refresh-token`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (res.ok && data.status === "success" && data.data?.tokens) {
      const newTokens = {
        accessToken: data.data.tokens.accessToken,
        refreshToken: data.data.tokens.refreshToken,
      };

      localStorage.setItem("accessToken", newTokens.accessToken);
      localStorage.setItem("refreshToken", newTokens.refreshToken);

      return newTokens;
    }

    throw new Error(
      data.error_description || data.message || "Token refresh failed",
    );
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}
