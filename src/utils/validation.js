/**
 * Email Validation Utilities
 * 
 * Comprehensive email format validation with user-friendly error messages
 * for common email mistakes. Provides both validation functions and
 * validation rules for use with ValidatedInput component.
 */

/**
 * Basic email format validation using RFC 5322 compliant regex
 * This is a simplified but practical regex that catches most common cases
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Common email domain patterns for additional validation
 */
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com'
];

/**
 * Common email mistakes patterns
 */
const COMMON_MISTAKES = {
  missingAt: /^[^@]+$/,
  multipleAt: /@.*@/,
  missingDomain: /^[^@]+@$/,
  missingTLD: /^[^@]+@[^.]+$/,
  invalidTLD: /^[^@]+@[^@]+\.[0-9]+$/,
  spacesInEmail: /\s/,
  consecutiveDots: /\.\./,
  startingDot: /^\./,
  endingDot: /\.$/,
  invalidChars: /[<>()[\]\\,;:\s@"]/
};

/**
 * Validates email format and provides specific error messages
 * @param {string} email - The email address to validate
 * @returns {object} - Validation result with isValid flag and error message
 */
export function validateEmail(email) {
  // Handle empty or null email
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email address is required',
      type: 'required'
    };
  }

  const trimmedEmail = email.trim();

  // Handle empty after trim
  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      error: 'Email address is required',
      type: 'required'
    };
  }

  // Check for common mistakes first (more user-friendly messages)
  if (COMMON_MISTAKES.spacesInEmail.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address cannot contain spaces',
      type: 'format',
      suggestion: 'Remove any spaces from your email address'
    };
  }

  if (COMMON_MISTAKES.missingAt.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address must contain an @ symbol',
      type: 'format',
      suggestion: 'Add @ followed by your email provider (e.g., @gmail.com)'
    };
  }

  if (COMMON_MISTAKES.multipleAt.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address can only contain one @ symbol',
      type: 'format',
      suggestion: 'Remove extra @ symbols from your email address'
    };
  }

  if (COMMON_MISTAKES.missingDomain.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address is missing the domain',
      type: 'format',
      suggestion: 'Add your email provider after @ (e.g., gmail.com)'
    };
  }

  if (COMMON_MISTAKES.missingTLD.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address is missing the domain extension',
      type: 'format',
      suggestion: 'Add a domain extension like .com, .org, or .net'
    };
  }

  if (COMMON_MISTAKES.invalidTLD.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Domain extension cannot be only numbers',
      type: 'format',
      suggestion: 'Use a valid domain extension like .com, .org, or .net'
    };
  }

  if (COMMON_MISTAKES.consecutiveDots.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address cannot have consecutive dots',
      type: 'format',
      suggestion: 'Remove extra dots from your email address'
    };
  }

  if (COMMON_MISTAKES.startingDot.test(trimmedEmail) || COMMON_MISTAKES.endingDot.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Email address cannot start or end with a dot',
      type: 'format',
      suggestion: 'Remove dots from the beginning or end of your email'
    };
  }

  // Check for invalid characters (excluding @ which we handle separately)
  const emailWithoutAt = trimmedEmail.replace('@', '');
  if (COMMON_MISTAKES.invalidChars.test(emailWithoutAt)) {
    return {
      isValid: false,
      error: 'Email address contains invalid characters',
      type: 'format',
      suggestion: 'Use only letters, numbers, dots, hyphens, and underscores'
    };
  }

  // Final RFC 5322 validation
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
      type: 'format',
      suggestion: 'Check the format of your email address (e.g., user@example.com)'
    };
  }

  // Email is valid
  return {
    isValid: true,
    error: null,
    type: 'valid'
  };
}

/**
 * Checks if an email uses a common domain and suggests corrections for typos
 * @param {string} email - The email address to check
 * @returns {object} - Suggestion result
 */
export function suggestEmailCorrection(email) {
  if (!email || typeof email !== 'string') {
    return { hasSuggestion: false };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const atIndex = trimmedEmail.lastIndexOf('@');
  
  if (atIndex === -1) {
    return { hasSuggestion: false };
  }

  const domain = trimmedEmail.substring(atIndex + 1);
  const username = trimmedEmail.substring(0, atIndex);

  // Common domain typos and their corrections
  const domainCorrections = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'hotmai.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com'
  };

  if (domainCorrections[domain]) {
    return {
      hasSuggestion: true,
      suggestedEmail: `${username}@${domainCorrections[domain]}`,
      message: `Did you mean ${username}@${domainCorrections[domain]}?`
    };
  }

  return { hasSuggestion: false };
}

/**
 * Creates validation rules for use with ValidatedInput component
 * @param {object} options - Configuration options for validation rules
 * @returns {array} - Array of validation rule objects
 */
export function createEmailValidationRules(options = {}) {
  const {
    required = true,
    allowSuggestions = true
  } = options;

  const rules = [];

  // Required validation
  if (required) {
    rules.push({
      test: (value) => !!(value && value.trim().length > 0),
      message: 'Email address is required',
      type: 'error'
    });
  }

  // Format validation
  rules.push({
    test: (value) => {
      if (!value || value.trim().length === 0) {
        return true; // Skip format validation if empty (handled by required rule)
      }
      const result = validateEmail(value);
      return result.isValid;
    },
    message: 'Please enter a valid email address',
    type: 'error'
  });

  // Suggestion validation (warning level)
  if (allowSuggestions) {
    rules.push({
      test: (value) => {
        if (!value || value.trim().length === 0) {
          return true; // Skip suggestion if empty
        }
        const suggestion = suggestEmailCorrection(value);
        return !suggestion.hasSuggestion;
      },
      message: 'Check your email address for typos',
      type: 'warning'
    });
  }

  return rules;
}

/**
 * Gets a user-friendly error message for email validation
 * @param {string} email - The email address that failed validation
 * @returns {string} - User-friendly error message with suggestion
 */
export function getEmailErrorMessage(email) {
  const validation = validateEmail(email);
  
  if (validation.isValid) {
    return null;
  }

  let message = validation.error;
  
  if (validation.suggestion) {
    message += `. ${validation.suggestion}`;
  }

  // Check for typo suggestions
  const suggestion = suggestEmailCorrection(email);
  if (suggestion.hasSuggestion) {
    message += ` ${suggestion.message}`;
  }

  return message;
}

/**
 * Validates multiple email addresses
 * @param {array} emails - Array of email addresses to validate
 * @returns {object} - Validation results for all emails
 */
export function validateMultipleEmails(emails) {
  if (!Array.isArray(emails)) {
    return { isValid: false, error: 'Expected array of email addresses' };
  }

  const results = emails.map((email, index) => ({
    index,
    email,
    ...validateEmail(email)
  }));

  const invalidEmails = results.filter(result => !result.isValid);

  return {
    isValid: invalidEmails.length === 0,
    results,
    invalidEmails,
    validCount: results.length - invalidEmails.length,
    invalidCount: invalidEmails.length
  };
}