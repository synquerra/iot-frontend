/**
 * Authentication Components Entry Point
 * 
 * Exports all shared authentication components for consistent
 * styling and behavior across login and signup pages
 */

export { AuthLayout } from './AuthLayout.jsx';
export { AuthCard } from './AuthCard.jsx';
export { AuthHeader } from './AuthHeader.jsx';
export { default as ValidatedInput } from './ValidatedInput.jsx';
export { default as PasswordInput } from './PasswordInput.jsx';
export { default as PasswordRequirementsChecklist } from './PasswordRequirementsChecklist.jsx';

// Export utilities and configuration
export * from './authUtils.js';
export * from './passwordRequirements.js';