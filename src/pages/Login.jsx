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
      
      // Persist user context to localStorage
      const persisted = persistUserContext(parsedContext);
      if (!persisted) {
        console.warn("Failed to persist user context to storage");
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