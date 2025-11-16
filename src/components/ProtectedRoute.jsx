import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, checkAuthAndLogout } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  useEffect(() => {
    checkAuthAndLogout(); // auto logout if expired
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
