import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, checkAuthAndLogout } from "../utils/auth";
import useSessionTimeout from "../hooks/useSessionTimeout";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  
  // Check if user is on login or signup page
  const isPublicPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Only enable session timeout on protected pages
  if (!isPublicPage) {
    useSessionTimeout();
  }
  
  useEffect(() => {
    checkAuthAndLogout(); // auto logout if JWT expired
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
