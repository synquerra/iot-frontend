// src/utils/auth.js

import { parseAuthResponse, persistUserContext, clearPersistedContext } from './authResponseParser';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

/**
 * 🔹 Decode a JWT token without verifying it.
 * Only used client-side to read `exp`.
 */
export function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * 🔹 Check if token is expired.
 */
export function isTokenExpired(token) {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * 🔹 Auto logout user if token expired.
 */
export function checkAuthAndLogout() {
  const token = localStorage.getItem("accessToken");
  if (!token || isTokenExpired(token)) {
    logoutUser();
    window.location.href = "/login";
    return false;
  }
  return true;
}

/**
 * 🔹 Login via GraphQL (FastAPI backend)
 * Returns parsed user context including userType and IMEIs for device filtering
 */
export async function authenticateUser(email, password) {
  const API_URL = `${API_BASE_URL}/auth/signin-query`;

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

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();

  if (res.ok && data.status === "success" && data.data?.tokens) {
    // Parse the auth response to extract user context
    const parsedContext = parseAuthResponse(data.data);

    // ✅ Store tokens
    localStorage.setItem("accessToken", parsedContext.tokens.accessToken);
    localStorage.setItem("refreshToken", parsedContext.tokens.refreshToken);
    localStorage.setItem("userEmail", parsedContext.email || "");

    // Return parsed context for use by caller
    return parsedContext;
  } else {
    throw new Error(data.error_description || data.message || "Login failed");
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
