import React from 'react';
import { 
  checkPasswordRequirements, 
  detectWeakPassword, 
  getStrengthDisplay,
  analyzePasswordStrength 
} from './passwordRequirements';

/**
 * PasswordRequirementsChecklist Component
 * 
 * Displays a visual checklist of password requirements with real-time updates
 * Shows requirement status, warnings, and suggestions for improvement
 */

// Individual requirement item component
const RequirementItem = ({ met, text, type = 'requirement' }) => {
  const getIcon = () => {
    if (type === 'warning') {
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-amber-500"
        >
          <path
            d="M6 1L11 10H1L6 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 4V6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 8H6.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return (
      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors duration-200 ${
        met ? 'bg-green-500' : 'bg-gray-300'
      }`}>
        {met && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M1 4L3 6L7 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    );
  };

  const getTextColor = () => {
    if (type === 'warning') {
      return 'text-amber-600';
    }
    return met ? 'text-green-600' : 'text-text-tertiary';
  };

  return (
    <div className="flex items-center space-x-2">
      {getIcon()}
      <span className={`text-xs transition-colors duration-200 ${getTextColor()}`}>
        {text}
      </span>
    </div>
  );
};

// Strength indicator bar component
const StrengthBar = ({ score, strengthLevel }) => {
  const display = getStrengthDisplay(strengthLevel);
  const percentage = Math.max(score, 5); // Minimum 5% for visual feedback

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          Password Strength
        </span>
        <span className={`text-xs font-medium ${display.color}`}>
          {display.text}
        </span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${display.bgColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {display.description && (
        <p className="text-xs text-text-tertiary">
          {display.description}
        </p>
      )}
    </div>
  );
};

// Main PasswordRequirementsChecklist component
const PasswordRequirementsChecklist = ({ 
  password = '', 
  showStrengthBar = true,
  showWarnings = true,
  showSuggestions = true,
  compact = false 
}) => {
  const analysis = analyzePasswordStrength(password);
  const weaknessCheck = detectWeakPassword(password);

  if (!password && compact) {
    return null;
  }

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Strength bar */}
      {showStrengthBar && password && (
        <StrengthBar 
          score={analysis.score} 
          strengthLevel={analysis.strengthLevel}
        />
      )}

      {/* Requirements checklist */}
      <div className="space-y-2">
        <p className={`font-medium text-text-secondary ${compact ? 'text-xs' : 'text-sm'}`}>
          Password Requirements:
        </p>
        
        <div className="space-y-1.5">
          <RequirementItem
            met={analysis.requirements.minLength}
            text="At least 8 characters"
          />
          <RequirementItem
            met={analysis.requirements.hasUppercase}
            text="One uppercase letter (A-Z)"
          />
          <RequirementItem
            met={analysis.requirements.hasLowercase}
            text="One lowercase letter (a-z)"
          />
          <RequirementItem
            met={analysis.requirements.hasNumbers}
            text="One number (0-9)"
          />
          <RequirementItem
            met={analysis.requirements.hasSpecialChars}
            text="One special character (!@#$%^&*)"
          />
        </div>
      </div>

      {/* Warnings */}
      {showWarnings && weaknessCheck.warnings.length > 0 && (
        <div className="space-y-2">
          <p className={`font-medium text-amber-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            Security Warnings:
          </p>
          <div className="space-y-1">
            {weaknessCheck.warnings.map((warning, index) => (
              <RequirementItem
                key={index}
                met={false}
                text={warning}
                type="warning"
              />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && weaknessCheck.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className={`font-medium text-text-secondary ${compact ? 'text-xs' : 'text-sm'}`}>
            Suggestions:
          </p>
          <div className="space-y-1">
            {weaknessCheck.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className={`text-text-tertiary ${compact ? 'text-xs' : 'text-sm'}`}>
                  {suggestion}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors (if any) */}
      {analysis.errors.length > 0 && (
        <div className="space-y-2">
          <p className={`font-medium text-red-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            Required:
          </p>
          <div className="space-y-1">
            {analysis.errors.map((error, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span className={`text-red-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordRequirementsChecklist;