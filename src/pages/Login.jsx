import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authenticateUser } from "../utils/auth";
import { Input } from "../design-system/components/Input";
import { Button } from "../design-system/components/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
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
      const userData = await authenticateUser(email, password);
      console.log("Login successful:", userData);
      navigate("/"); // Redirect to dashboard
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-surface-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Login Card */}
        <div className="bg-surface-primary border border-border-primary rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back
            </h1>
            <p className="text-text-secondary">
              Sign in to your Synquerra account
            </p>
          </div>

          {/* Global Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-lg">
              <p className="text-status-error text-sm font-medium">
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
              autoFocus
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
        </div>

        {/* Additional Help Text */}
        <div className="mt-6 text-center">
          <p className="text-text-tertiary text-xs">
            Having trouble signing in?{" "}
            <button 
              type="button"
              className="text-accent hover:text-accent/80 underline transition-colors duration-200"
              onClick={() => {
                // This could be expanded to show a help modal or redirect to support
                alert("Please contact support for assistance with your account.");
              }}
            >
              Get help
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}