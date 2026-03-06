// src/utils/auth.js

import { parseAuthResponse, clearPersistedContext } from '@/helpers/authResponseParser';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

/**
 * 🔹 Decode a JWT token without verifying it.
 * Only used client-side to read `exp`.
 */
export function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 🔹 Check if token is expired.
 */
export function isTokenExpired(token: string) {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * 🔹 Check if session has expired based on Remember Me setting
 * Returns true if session is still valid, false if expired
 */
export function isSessionValid() {
  const sessionExpiry = localStorage.getItem('sessionExpiry');

  if (!sessionExpiry) {
    return false;
  }

  const expiryDate = new Date(sessionExpiry);
  const now = new Date();

  return now < expiryDate;
}

/**
 * 🔹 Clear Remember Me data
 */
export function clearRememberMe() {
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('sessionExpiry');
}

/**
 * 🔹 Auto logout user if token expired.
 */
export function checkAuthAndLogout() {
  const token = localStorage.getItem("accessToken");

  // Check if session is still valid based on Remember Me setting
  if (!isSessionValid()) {
    logoutUser();

    return false;
  }

  if (!token || isTokenExpired(token)) {
    logoutUser();

    return false;
  }
  return true;
}

/**
 * 🔹 Login via GraphQL (FastAPI backend)
 * Returns parsed user context including userType and IMEIs for device filtering
 */
import api from "@/lib/axios";


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
    console.log(res);

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
      throw error.response?.data?.message ?? error.message;
    }

    throw error instanceof Error
      ? error.message
      : "Something went wrong";
  }
}

/**
 * 🔹 Return whether the user is currently authenticated
 */
export function isAuthenticated() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * 🔹 Logout the user
 * Clears all authentication state and persisted user context
 */
export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
  sessionStorage.clear();

  // Clear persisted user context
  clearPersistedContext();

  // Clear Remember Me data (but keep email if Remember Me was enabled)
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  if (!rememberMe) {
    clearRememberMe();
  } else {
    // Only clear session expiry, keep email saved
    localStorage.removeItem('sessionExpiry');
  }
}

/**
 * 🔹 Refresh access token using refresh token
 * Preserves user context (userType and IMEIs) during token refresh
 * @returns {Object} - New tokens { accessToken, refreshToken }
 * @throws {Error} - If refresh fails
 */
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

      // ✅ Update tokens in localStorage
      localStorage.setItem("accessToken", newTokens.accessToken);
      localStorage.setItem("refreshToken", newTokens.refreshToken);

      return newTokens;
    } else {
      throw new Error(data.error_description || data.message || "Token refresh failed");
    }
  } catch (error) {
    // If refresh fails, clear everything and force re-login
    console.error("Token refresh failed:", error);
    throw error;
  }
}


/**
 * 🔹 Get user details by IMEI
 * Fetches the parent/user information who is associated with the given IMEI
 */
export async function getUserByIMEI(imei: string) {
  const query = `
    query {
      userByImei(imei: "${imei}") {
        uniqueId
        firstName
        lastName
        email
        mobile
        userType
      }
    }
  `;

  try {
    const res = await api.post("/auth/user-by-imei-query", { query });

    const data = res.data;

    if (data.status === "success" && data.data?.userByImei) {
      return data.data.userByImei;
    }

    throw new Error(data.error_description || data.message);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.message ?? error.message;
    }

    throw error instanceof Error
      ? error.message
      : "Something went wrong";
  }
}
