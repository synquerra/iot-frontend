/**
 * Property-Based Tests for Password Security Validation
 * Feature: authentication-redesign, Property 3: Password Security Validation
 * Validates: Requirements 6.2, 6.3, 6.4
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordInput from './PasswordInput';
import { 
  analyzePasswordStrength, 
  checkPasswordRequirements, 
  detectWeakPassword,
  PASSWORD_REQUIREMENTS,
  WEAK_PASSWORD_PATTERNS,
  COMMON_PASSWORDS
} from './passwordRequirements';

describe('Password Security Validation Properties', () => {
  
  // Property 3.1: Real-time password strength feedback
  test('Property 3.1: Real-time strength feedback - for any password input, strength analysis should be consistent and immediate', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (password) => {
          // Test that strength analysis is consistent
          const analysis1 = analyzePasswordStrength(password);
          const analysis2 = analyzePasswordStrength(password);
          
          // Analysis should be deterministic
          expect(analysis1.score).toBe(analysis2.score);
          expect(analysis1.strengthLevel).toBe(analysis2.strengthLevel);
          expect(analysis1.isValid).toBe(analysis2.isValid);
          
          // Score should be between 0 and 100
          expect(analysis1.score).toBeGreaterThanOrEqual(0);
          expect(analysis1.score).toBeLessThanOrEqual(100);
          
          // Strength level should be valid
          const validLevels = ['very-weak', 'weak', 'fair', 'good', 'strong', 'excellent'];
          expect(validLevels).toContain(analysis1.strengthLevel);
          
          // Empty password should have score 0
          if (password === '') {
            expect(analysis1.score).toBe(0);
            expect(analysis1.strengthLevel).toBe('very-weak');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 3.2: Minimum security standards enforcement
  test('Property 3.2: Security standards enforcement - for any password, requirements checking should enforce all minimum standards', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (password) => {
          const requirements = checkPasswordRequirements(password);
          
          // Requirements object should have all expected fields
          expect(requirements).toHaveProperty('isValid');
          expect(requirements).toHaveProperty('requirements');
          expect(requirements).toHaveProperty('errors');
          expect(requirements).toHaveProperty('score');
          
          const reqs = requirements.requirements;
          
          // All requirement fields should be present
          expect(reqs).toHaveProperty('minLength');
          expect(reqs).toHaveProperty('maxLength');
          expect(reqs).toHaveProperty('hasUppercase');
          expect(reqs).toHaveProperty('hasLowercase');
          expect(reqs).toHaveProperty('hasNumbers');
          expect(reqs).toHaveProperty('hasSpecialChars');
          
          // Length requirements should be correctly evaluated
          if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
            expect(reqs.minLength).toBe(true);
          } else {
            expect(reqs.minLength).toBe(false);
          }
          
          if (password.length <= PASSWORD_REQUIREMENTS.maxLength) {
            expect(reqs.maxLength).toBe(true);
          } else {
            expect(reqs.maxLength).toBe(false);
          }
          
          // Character type requirements should be correctly evaluated
          if (password && /[A-Z]/.test(password)) {
            expect(reqs.hasUppercase).toBe(true);
          } else if (password) {
            expect(reqs.hasUppercase).toBe(false);
          }
          
          if (password && /[a-z]/.test(password)) {
            expect(reqs.hasLowercase).toBe(true);
          } else if (password) {
            expect(reqs.hasLowercase).toBe(false);
          }
          
          if (password && /\d/.test(password)) {
            expect(reqs.hasNumbers).toBe(true);
          } else if (password) {
            expect(reqs.hasNumbers).toBe(false);
          }
          
          // isValid should be true only when all requirements are met
          const allRequirementsMet = Object.values(reqs).every(req => req === true);
          expect(requirements.isValid).toBe(allRequirementsMet);
          
          // Errors array should contain messages for unmet requirements
          if (!requirements.isValid) {
            expect(requirements.errors.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 3.3: Weak password detection and warnings
  test('Property 3.3: Weak password detection - for any password, weak pattern detection should provide appropriate warnings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (password) => {
          const weakness = detectWeakPassword(password);
          
          // Weakness object should have all expected fields
          expect(weakness).toHaveProperty('isWeak');
          expect(weakness).toHaveProperty('warnings');
          expect(weakness).toHaveProperty('suggestions');
          expect(weakness).toHaveProperty('severity');
          
          // Severity should be valid
          const validSeverities = ['none', 'low', 'medium', 'high'];
          expect(validSeverities).toContain(weakness.severity);
          
          // Empty password should not be considered weak (handled by requirements)
          if (password === '') {
            expect(weakness.isWeak).toBe(false);
            expect(weakness.severity).toBe('none');
          }
          
          // If weak, should have warnings
          if (weakness.isWeak) {
            expect(weakness.warnings.length).toBeGreaterThan(0);
            expect(weakness.severity).not.toBe('none');
          }
          
          // If not weak, severity should be none
          if (!weakness.isWeak) {
            expect(weakness.severity).toBe('none');
          }
          
          // Common passwords should be detected as weak
          if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
            expect(weakness.isWeak).toBe(true);
            expect(weakness.severity).toBe('high');
          }
          
          // Check specific weak patterns
          WEAK_PASSWORD_PATTERNS.forEach(({ pattern, severity }) => {
            if (pattern.test(password)) {
              expect(weakness.isWeak).toBe(true);
              // Severity should be at least as severe as the pattern
              const severityLevels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 };
              expect(severityLevels[weakness.severity]).toBeGreaterThanOrEqual(severityLevels[severity]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 3.4: Component integration - password input should display security feedback consistently
  test('Property 3.4: Component security feedback integration - for any password input, UI should reflect security analysis', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length >= 3), // Ensure meaningful content
        (password) => {
          const uniqueLabel = `Test Password ${Math.random().toString(36).substr(2, 9)}`;
          const { container, unmount } = render(
            <PasswordInput 
              label={uniqueLabel}
              showStrengthIndicator={true}
              showRequirementsChecklist={true}
              value={password} // Set initial value
              onChange={() => {}} // Provide onChange handler
            />
          );
          
          try {
            const input = container.querySelector('input[type="password"]');
            expect(input).toBeInTheDocument();
            expect(input).toHaveValue(password);
            
            // The PasswordRequirementsChecklist should show when there's a password value
            expect(container.textContent).toContain('Password Requirements:');
            expect(container.textContent).toContain('Password Strength');
            
            // Requirements should be displayed
            expect(container.textContent).toContain('At least 8 characters');
            expect(container.textContent).toContain('One uppercase letter (A-Z)');
            expect(container.textContent).toContain('One lowercase letter (a-z)');
            expect(container.textContent).toContain('One number (0-9)');
            expect(container.textContent).toContain('One special character (!@#$%^&*)');
            
            // Get the analysis for comparison
            const analysis = analyzePasswordStrength(password);
            
            // If password has warnings, they should be displayed
            if (analysis.warnings && analysis.warnings.length > 0) {
              // Check for general warning presence in the container
              expect(container.textContent).toMatch(/avoid|weak|common|pattern|warning/i);
            }
          } finally {
            // Clean up after each test iteration
            unmount();
          }
        }
      ),
      { numRuns: 25 } // Reduced runs for DOM testing with cleanup
    );
  });

  // Property 3.5: Password visibility toggle security
  test('Property 3.5: Password visibility toggle - for any password, visibility toggle should work securely', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2), // Filter out whitespace-only and single chars
        (password) => {
          const uniqueLabel = `Test Password ${Math.random().toString(36).substr(2, 9)}`;
          const { container, unmount } = render(
            <PasswordInput 
              label={uniqueLabel}
              showVisibilityToggle={true}
              value={password} // Set initial value
              onChange={() => {}} // Provide onChange handler
            />
          );
          
          try {
            const input = container.querySelector('input');
            const toggleButton = container.querySelector('button[aria-label*="password"]');
            
            expect(input).toBeInTheDocument();
            expect(toggleButton).toBeInTheDocument();
            expect(input).toHaveValue(password);
            
            // Initially should be password type
            expect(input).toHaveAttribute('type', 'password');
            
            // Toggle to show password
            fireEvent.click(toggleButton);
            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveValue(password);
            
            // Should now have hide password button
            const hideButton = container.querySelector('button[aria-label*="Hide password"]');
            expect(hideButton).toBeInTheDocument();
            
            // Toggle back to hide password
            fireEvent.click(hideButton);
            expect(input).toHaveAttribute('type', 'password');
            expect(input).toHaveValue(password); // Value should be preserved
            
            // Should now have show password button again
            const showButton = container.querySelector('button[aria-label*="Show password"]');
            expect(showButton).toBeInTheDocument();
          } finally {
            // Clean up after each test iteration
            unmount();
          }
        }
      ),
      { numRuns: 25 } // Reduced runs for DOM testing with cleanup
    );
  });

});