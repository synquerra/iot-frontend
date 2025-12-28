import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthHeader } from "../components/auth/AuthHeader";
import ValidatedInput from "../components/auth/ValidatedInput";
import PasswordInput from "../components/auth/PasswordInput";
import { Button } from "../design-system/components/Button";
import { validateEmail, validatePassword, AUTH_MESSAGES, getAuthNavigation } from "../components/auth/authUtils";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();

  // Get navigation configuration for signup page
  const navigation = getAuthNavigation('signup');

  // Email validation rules
  const emailValidationRules = [
    {
      test: (value) => value.trim().length > 0,
      message: AUTH_MESSAGES.errors.required,
      type: 'error'
    },
    {
      test: (value) => validateEmail(value),
      message: AUTH_MESSAGES.errors.invalidEmail,
      type: 'error'
    }
  ];

  // Password confirmation validation rules
  const confirmPasswordValidationRules = [
    {
      test: (value) => value.trim().length > 0,
      message: "Please confirm your password",
      type: 'error'
    },
    {
      test: (value) => value === formData.password,
      message: "Passwords do not match",
      type: 'error'
    }
  ];

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark form as touched when user starts typing
    if (!formTouched) {
      setFormTouched(true);
    }
    
    // Clear global error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Comprehensive form validation
  const validateForm = () => {
    const errors = [];

    // Email validation
    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!validateEmail(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.push("Password is required");
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        errors.push("Password must be at least 8 characters long");
      }
    }

    // Password confirmation validation
    if (!formData.confirmPassword.trim()) {
      errors.push("Please confirm your password");
    } else if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    return errors;
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return validateForm().length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Prevent submission if form is invalid
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]); // Show first error
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success state
      setSuccess(true);
      
      // Navigate to login after a brief delay to show success
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: AUTH_MESSAGES.success.signUp,
            email: formData.email 
          }
        });
      }, 2000);
      
    } catch (error) {
      setError(error.message || AUTH_MESSAGES.errors.serverError);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHelp = () => {
    // This could be expanded to show a help modal or redirect to support
    alert(AUTH_MESSAGES.help.contactSupport);
  };

  // Success state content
  if (success) {
    return (
      <AuthLayout
        title="Account Created!"
        subtitle="Welcome to Synquerra"
      >
        <AuthCard>
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-status-success"
                >
                  <path
                    d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm-2 20l-6-6 1.414-1.414L14 19.172l8.586-8.586L24 12l-10 10z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Account Created Successfully!
              </h1>
              <p className="text-text-secondary mb-4">
                Your Synquerra account has been created. You'll be redirected to sign in shortly.
              </p>
              <div className="text-sm text-text-tertiary">
                Redirecting to login page...
              </div>
            </div>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/login", { 
                state: { 
                  message: AUTH_MESSAGES.success.signUp,
                  email: formData.email 
                }
              })}
              className="w-full"
            >
              Continue to Sign In
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={navigation.title}
      subtitle={navigation.subtitle}
      showHelp={true}
      helpContent={
        <span>
          Need help getting started?{" "}
          <button 
            type="button"
            className="text-accent hover:text-accent/80 underline transition-colors duration-200"
            onClick={handleGetHelp}
          >
            Contact support
          </button>
          {" or "}
          <Link 
            to="/help" 
            className="text-accent hover:text-accent/80 underline transition-colors duration-200"
          >
            view our guide
          </Link>
        </span>
      }
    >
      <AuthCard>
        <AuthHeader 
          title={navigation.title}
          subtitle={navigation.subtitle}
        />

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-lg">
            <p className="text-status-error text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          {/* Email Field */}
          <ValidatedInput
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange('email')}
            validationRules={emailValidationRules}
            validateOnBlur={true}
            validateOnChange={false}
            size="lg"
            autoComplete="email"
            autoFocus
          />

          {/* Password Field */}
          <PasswordInput
            label="Password"
            placeholder="Create a secure password"
            value={formData.password}
            onChange={handleInputChange('password')}
            showStrengthIndicator={true}
            showVisibilityToggle={true}
            showRequirementsChecklist={true}
            enforceMinimumStandards={true}
            allowWeakPasswords={false}
            size="lg"
            autoComplete="new-password"
          />

          {/* Confirm Password Field */}
          <ValidatedInput
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            validationRules={confirmPasswordValidationRules}
            validateOnBlur={true}
            validateOnChange={true}
            size="lg"
            autoComplete="new-password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading || (formTouched && !isFormValid())}
            className="w-full"
          >
            {loading ? navigation.loadingText : navigation.submitText}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-sm">
            {navigation.alternativeText}{" "}
            <Link 
              to={navigation.alternativeLink}
              className="text-accent hover:text-accent/80 font-medium transition-colors duration-200"
            >
              {navigation.alternativeLinkText}
            </Link>
          </p>
        </div>
      </AuthCard>

      {/* Additional Help Text - Matching Login Page */}
      <div className="mt-6 text-center">
        <p className="text-text-tertiary text-xs">
          By creating an account, you agree to our{" "}
          <Link 
            to="/terms" 
            className="text-accent hover:text-accent/80 underline transition-colors duration-200"
          >
            Terms of Service
          </Link>
          {" and "}
          <Link 
            to="/privacy" 
            className="text-accent hover:text-accent/80 underline transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
