import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authenticateUser } from "../utils/auth";
import { persistUserContext } from "../utils/authResponseParser";
import { useUserContext } from "../contexts/UserContext";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthHeader } from "../components/auth/AuthHeader";
import { Input } from "../design-system/components/Input";
import { Button } from "../design-system/components/Button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserContext } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Handle success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Pre-fill email if provided
      if (location.state.email) {
        setEmail(location.state.email);
      }
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear success message
    setFieldErrors({}); // Clear field errors

    // Validate fields
    const newFieldErrors = {};
    if (!email) {
      newFieldErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newFieldErrors.password = "Password is required";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Authenticate and get parsed user context
      const parsedContext = await authenticateUser(email, password);
      console.log("Login successful:", parsedContext);
      
      // Store parsed user context in UserContext
      setUserContext(parsedContext);
      
      // Persist user context based on "Remember me" preference
      if (rememberMe) {
        // Use localStorage for persistent login (24 hours)
        const persisted = persistUserContext(parsedContext);
        if (!persisted) {
          console.warn("Failed to persist user context to storage");
        }
        // Store tokens in localStorage (already done in authenticateUser)
        console.log("User will stay logged in (Remember me enabled)");
      } else {
        // Use sessionStorage for session-only login
        // Move tokens to sessionStorage instead of localStorage
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userEmail = localStorage.getItem("userEmail");
        
        if (accessToken) sessionStorage.setItem("accessToken", accessToken);
        if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
        if (userEmail) sessionStorage.setItem("userEmail", userEmail);
        
        // Clear from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        
        // Store user context in sessionStorage
        sessionStorage.setItem("user_context_session", JSON.stringify(parsedContext));
        
        console.log("User will be logged out when browser closes (Remember me disabled)");
      }
      
      navigate("/"); // Redirect to dashboard
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      showHelp={true}
      helpContent={
        <span>
          Having trouble signing in?{" "}
          <button 
            type="button"
            className="text-accent hover:text-accent/80 underline transition-colors duration-200"
            onClick={() => {
              alert("Please contact support for assistance with your account.");
            }}
          >
            Get help
          </button>
        </span>
      }
    >
      <AuthCard>
        <AuthHeader 
          title="Welcome back"
          subtitle="Sign in to your Synquerra account"
        />

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                {success}
              </p>
            </div>
          )}

          {/* Global Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear field error when user starts typing
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              error={fieldErrors.email}
              size="lg"
              autoComplete="email"
              autoFocus={!email} // Only autofocus if email is not pre-filled
            />

            {/* Password Field */}
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear field error when user starts typing
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              error={fieldErrors.password}
              size="lg"
              autoComplete="current-password"
              autoFocus={!!email} // Autofocus password if email is pre-filled
            />

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-2 cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-sm">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="text-accent hover:text-accent/80 font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}