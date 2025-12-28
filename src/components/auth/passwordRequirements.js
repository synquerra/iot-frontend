/**
 * Password Requirements System
 * 
 * Defines minimum security standards, provides requirement checking,
 * and includes weak password detection with warnings.
 */

// Minimum security standards configuration
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  allowedSpecialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// Common weak password patterns to detect and warn against
export const WEAK_PASSWORD_PATTERNS = [
  {
    pattern: /^password/i,
    message: 'Avoid using "password" as your password',
    severity: 'high'
  },
  {
    pattern: /^123456/,
    message: 'Avoid sequential numbers like "123456"',
    severity: 'high'
  },
  {
    pattern: /^qwerty/i,
    message: 'Avoid keyboard patterns like "qwerty"',
    severity: 'high'
  },
  {
    pattern: /^admin/i,
    message: 'Avoid common words like "admin"',
    severity: 'medium'
  },
  {
    pattern: /^letmein/i,
    message: 'Avoid common phrases like "letmein"',
    severity: 'medium'
  },
  {
    pattern: /^welcome/i,
    message: 'Avoid common words like "welcome"',
    severity: 'medium'
  },
  {
    pattern: /^(.)\1{2,}/,
    message: 'Avoid repeating the same character multiple times',
    severity: 'medium'
  },
  {
    pattern: /^(abc|def|ghi|jkl|mno|pqr|stu|vwx|yz)/i,
    message: 'Avoid alphabetical sequences',
    severity: 'low'
  }
];

// Dictionary of common passwords (subset for demonstration)
export const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty',
  'abc123', 'password1', 'admin', 'letmein', 'welcome',
  'monkey', 'dragon', 'master', 'shadow', 'superman',
  'michael', 'football', 'baseball', 'liverpool', 'jordan'
];

/**
 * Check if password meets minimum security standards
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with requirements status
 */
export const checkPasswordRequirements = (password) => {
  if (!password) {
    return {
      isValid: false,
      requirements: {
        minLength: false,
        maxLength: true,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSpecialChars: false
      },
      errors: ['Password is required'],
      score: 0
    };
  }

  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    maxLength: password.length <= PASSWORD_REQUIREMENTS.maxLength,
    hasUppercase: PASSWORD_REQUIREMENTS.requireUppercase ? /[A-Z]/.test(password) : true,
    hasLowercase: PASSWORD_REQUIREMENTS.requireLowercase ? /[a-z]/.test(password) : true,
    hasNumbers: PASSWORD_REQUIREMENTS.requireNumbers ? /\d/.test(password) : true,
    hasSpecialChars: PASSWORD_REQUIREMENTS.requireSpecialChars ? 
      new RegExp(`[${PASSWORD_REQUIREMENTS.allowedSpecialChars.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}]`).test(password) : true
  };

  const errors = [];
  
  if (!requirements.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  
  if (!requirements.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }
  
  if (!requirements.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!requirements.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!requirements.hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  if (!requirements.hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  }

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const totalRequirements = Object.keys(requirements).length;
  const score = Math.round((metRequirements / totalRequirements) * 100);

  return {
    isValid: errors.length === 0,
    requirements,
    errors,
    score
  };
};

/**
 * Detect weak password patterns and provide warnings
 * @param {string} password - The password to analyze
 * @returns {Object} Analysis result with warnings and suggestions
 */
export const detectWeakPassword = (password) => {
  if (!password) {
    return {
      isWeak: false,
      warnings: [],
      suggestions: [],
      severity: 'none'
    };
  }

  const warnings = [];
  const suggestions = [];
  let maxSeverity = 'none';

  // Check against common password patterns
  WEAK_PASSWORD_PATTERNS.forEach(({ pattern, message, severity }) => {
    if (pattern.test(password)) {
      warnings.push(message);
      
      // Update max severity
      if (severity === 'high' || (severity === 'medium' && maxSeverity !== 'high')) {
        maxSeverity = severity;
      } else if (severity === 'low' && maxSeverity === 'none') {
        maxSeverity = severity;
      }
    }
  });

  // Check against common passwords dictionary
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    warnings.push('This is a commonly used password');
    maxSeverity = 'high';
  }

  // Check for personal information patterns (basic detection)
  if (/^(name|email|phone|address|birthday)/i.test(password)) {
    warnings.push('Avoid using personal information in passwords');
    maxSeverity = 'medium';
  }

  // Check for date patterns
  if (/\\d{4}/.test(password) && /19|20/.test(password)) {
    warnings.push('Avoid using years or dates in passwords');
    maxSeverity = 'low';
  }

  // Generate suggestions based on detected issues
  if (warnings.length > 0) {
    suggestions.push('Use a unique combination of characters');
    suggestions.push('Consider using a passphrase with multiple words');
    suggestions.push('Add numbers and special characters in unexpected places');
    
    if (maxSeverity === 'high') {
      suggestions.push('Completely avoid common passwords and patterns');
    }
  }

  return {
    isWeak: warnings.length > 0,
    warnings,
    suggestions,
    severity: maxSeverity
  };
};

/**
 * Generate password strength score and feedback
 * @param {string} password - The password to analyze
 * @returns {Object} Comprehensive password analysis
 */
export const analyzePasswordStrength = (password) => {
  const requirementsCheck = checkPasswordRequirements(password);
  const weaknessCheck = detectWeakPassword(password);
  
  let finalScore = requirementsCheck.score;
  
  // Reduce score based on weakness severity
  if (weaknessCheck.isWeak) {
    switch (weaknessCheck.severity) {
      case 'high':
        finalScore = Math.min(finalScore, 20);
        break;
      case 'medium':
        finalScore = Math.min(finalScore, 50);
        break;
      case 'low':
        finalScore = Math.min(finalScore, 70);
        break;
    }
  }

  // Bonus points for length beyond minimum
  if (password && password.length > PASSWORD_REQUIREMENTS.minLength) {
    const lengthBonus = Math.min((password.length - PASSWORD_REQUIREMENTS.minLength) * 2, 10);
    finalScore = Math.min(finalScore + lengthBonus, 100);
  }

  // Determine strength level
  let strengthLevel = 'very-weak';
  if (finalScore >= 80) {
    strengthLevel = 'excellent';
  } else if (finalScore >= 60) {
    strengthLevel = 'strong';
  } else if (finalScore >= 40) {
    strengthLevel = 'good';
  } else if (finalScore >= 20) {
    strengthLevel = 'fair';
  } else if (finalScore > 0) {
    strengthLevel = 'weak';
  }

  return {
    score: finalScore,
    strengthLevel,
    requirements: requirementsCheck.requirements,
    errors: requirementsCheck.errors,
    warnings: weaknessCheck.warnings,
    suggestions: weaknessCheck.suggestions,
    isValid: requirementsCheck.isValid && !weaknessCheck.isWeak,
    meetsMinimumStandards: requirementsCheck.isValid
  };
};

/**
 * Get user-friendly strength description
 * @param {string} strengthLevel - The strength level from analyzePasswordStrength
 * @returns {Object} Display information for the strength level
 */
export const getStrengthDisplay = (strengthLevel) => {
  const displays = {
    'very-weak': {
      text: 'Very Weak',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      description: 'This password is easily guessable'
    },
    'weak': {
      text: 'Weak',
      color: 'text-red-500',
      bgColor: 'bg-red-400',
      description: 'This password needs improvement'
    },
    'fair': {
      text: 'Fair',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      description: 'This password is acceptable but could be stronger'
    },
    'good': {
      text: 'Good',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      description: 'This password is reasonably secure'
    },
    'strong': {
      text: 'Strong',
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      description: 'This password is secure'
    },
    'excellent': {
      text: 'Excellent',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      description: 'This password is very secure'
    }
  };

  return displays[strengthLevel] || displays['very-weak'];
};

/**
 * Create validation rules for use with ValidatedInput component
 * @param {Object} options - Configuration options for validation rules
 * @returns {Array} Array of validation rules
 */
export const createPasswordValidationRules = (options = {}) => {
  const {
    enforceMinimumStandards = true,
    allowWeakPasswords = false,
    customRequirements = []
  } = options;

  const rules = [];

  if (enforceMinimumStandards) {
    // Minimum length rule
    rules.push({
      test: (password) => !password || password.length >= PASSWORD_REQUIREMENTS.minLength,
      message: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
      type: 'error'
    });

    // Maximum length rule
    rules.push({
      test: (password) => !password || password.length <= PASSWORD_REQUIREMENTS.maxLength,
      message: `Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`,
      type: 'error'
    });

    // Character type requirements
    if (PASSWORD_REQUIREMENTS.requireUppercase) {
      rules.push({
        test: (password) => !password || /[A-Z]/.test(password),
        message: 'Password must contain at least one uppercase letter',
        type: 'error'
      });
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase) {
      rules.push({
        test: (password) => !password || /[a-z]/.test(password),
        message: 'Password must contain at least one lowercase letter',
        type: 'error'
      });
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers) {
      rules.push({
        test: (password) => !password || /\d/.test(password),
        message: 'Password must contain at least one number',
        type: 'error'
      });
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
      rules.push({
        test: (password) => {
          if (!password) return true;
          const specialCharRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.allowedSpecialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
          return specialCharRegex.test(password);
        },
        message: 'Password must contain at least one special character',
        type: 'error'
      });
    }
  }

  // Weak password detection (as warnings unless disabled)
  if (!allowWeakPasswords) {
    rules.push({
      test: (password) => {
        if (!password) return true;
        const analysis = detectWeakPassword(password);
        return !analysis.isWeak || analysis.severity !== 'high';
      },
      message: 'This password is too weak - avoid common patterns',
      type: 'warning'
    });
  }

  // Add custom requirements
  rules.push(...customRequirements);

  return rules;
};