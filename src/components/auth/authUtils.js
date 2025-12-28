/**
 * Authentication Utilities
 * 
 * Shared utilities, constants, and helper functions for authentication components
 */

// Authentication page configuration
export const AUTH_CONFIG = {
  // Animation durations
  animations: {
    fadeIn: '0.5s ease-out',
    transition: '0.2s ease-in-out',
  },
  
  // Spacing and sizing
  layout: {
    maxWidth: 'max-w-md',
    padding: 'px-4',
    cardPadding: 'p-8',
    spacing: 'space-y-6',
  },
  
  // Typography
  typography: {
    title: 'text-3xl font-bold text-text-primary mb-2',
    subtitle: 'text-text-secondary',
    helpText: 'text-text-tertiary text-xs',
    errorText: 'text-status-error text-sm font-medium',
    successText: 'text-status-success text-sm font-medium',
  },
  
  // Colors and styling
  colors: {
    background: 'bg-gradient-to-b from-slate-900 to-surface-background',
    card: 'bg-surface-primary border border-border-primary rounded-2xl shadow-xl',
    link: 'text-accent hover:text-accent/80 font-medium transition-colors duration-200',
    button: 'w-full',
  },
};

// Common authentication messages
export const AUTH_MESSAGES = {
  loading: {
    signIn: 'Signing in...',
    signUp: 'Creating account...',
    default: 'Loading...',
  },
  
  errors: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    weakPassword: 'Password is too weak',
    networkError: 'Network error. Please check your connection and try again.',
    serverError: 'Something went wrong. Please try again later.',
    authFailed: 'Authentication failed. Please check your credentials.',
  },
  
  success: {
    signUp: 'Account created successfully! Please sign in.',
    signIn: 'Welcome back!',
    passwordReset: 'Password reset email sent.',
  },
  
  help: {
    signInTrouble: 'Having trouble signing in?',
    getHelp: 'Get help',
    contactSupport: 'Please contact support for assistance with your account.',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signUp: 'Sign up',
    signIn: 'Sign in',
  },
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

// Form state helpers
export const createInitialFormState = (fields = []) => {
  const state = {
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    submitError: null,
  };
  
  fields.forEach(field => {
    state.values[field] = '';
    state.errors[field] = null;
    state.touched[field] = false;
  });
  
  return state;
};

export const updateFormField = (formState, fieldName, value) => {
  return {
    ...formState,
    values: {
      ...formState.values,
      [fieldName]: value,
    },
    errors: {
      ...formState.errors,
      [fieldName]: null, // Clear error when user starts typing
    },
  };
};

export const setFormError = (formState, fieldName, error) => {
  return {
    ...formState,
    errors: {
      ...formState.errors,
      [fieldName]: error,
    },
    touched: {
      ...formState.touched,
      [fieldName]: true,
    },
  };
};

export const setFormSubmitting = (formState, isSubmitting, submitError = null) => {
  return {
    ...formState,
    isSubmitting,
    submitError,
  };
};

// Accessibility helpers
export const getAriaDescribedBy = (fieldName, hasError, hasHelp) => {
  const ids = [];
  if (hasError) ids.push(`${fieldName}-error`);
  if (hasHelp) ids.push(`${fieldName}-help`);
  return ids.length > 0 ? ids.join(' ') : undefined;
};

export const getFieldId = (fieldName) => `auth-${fieldName}`;

// Navigation helpers
export const getAuthNavigation = (currentPage) => {
  const navigation = {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to your Synquerra account',
      alternativeText: "Don't have an account?",
      alternativeLink: '/signup',
      alternativeLinkText: 'Sign up',
      submitText: 'Sign in',
      loadingText: 'Signing in...',
    },
    signup: {
      title: 'Create Account',
      subtitle: 'Join Synquerra to get started',
      alternativeText: 'Already have an account?',
      alternativeLink: '/login',
      alternativeLinkText: 'Sign in',
      submitText: 'Create Account',
      loadingText: 'Creating account...',
    },
  };
  
  return navigation[currentPage] || navigation.login;
};