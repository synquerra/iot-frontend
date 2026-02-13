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
  const [rememberMe, setRememberMe] = useState(false);
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

    // Check if user has saved credentials (Remember Me)
    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeEnabled = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && rememberMeEnabled) {
      setEmail(savedEmail);
      setRememberMe(true);
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

      // Handle Remember Me functionality
      if (rememberMe) {
        // Save email for future logins
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
        
        // Set extended session expiry (30 days)
        const extendedExpiry = new Date();
        extendedExpiry.setDate(extendedExpiry.getDate() + 30);
        localStorage.setItem('sessionExpiry', extendedExpiry.toISOString());
      } else {
        // Clear remembered credentials
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
        
        // Set standard session expiry (1 day)
        const standardExpiry = new Date();
        standardExpiry.setDate(standardExpiry.getDate() + 1);
        localStorage.setItem('sessionExpiry', standardExpiry.toISOString());
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
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border-primary bg-white/10 text-accent 
                    focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 focus:ring-offset-surface-background
                    transition-all duration-200 cursor-pointer
                    checked:bg-accent checked:border-accent
                    hover:border-border-secondary"
                />
                <span className="ml-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                  Stay logged in
                </span>
              </label>
              
              <button
                type="button"
                className="text-sm text-accent hover:text-accent/80 transition-colors duration-200"
                onClick={() => {
                  alert("Please contact support to reset your password.");
                }}
              >
                Forgot password?
              </button>
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