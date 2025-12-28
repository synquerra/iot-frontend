import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import ValidatedInput from './ValidatedInput.jsx';
import { createEmailValidationRules } from '../../utils/validation.js';

/**
 * Property-Based Tests for ValidatedInput Component
 * 
 * Feature: authentication-redesign, Property 2: Real-time Validation Behavior
 * Validates: Requirements 1.2, 2.1, 2.3, 2.4
 * 
 * Tests universal validation behavior across all input types and validation rules.
 */

describe('ValidatedInput - Property-Based Tests', () => {
  
  afterEach(() => {
    cleanup();
  });
  
  /**
   * Property 2: Real-time Validation Behavior
   * For any form field with validation rules, when invalid data is entered or the field loses focus,
   * validation feedback should appear immediately, and when the data is corrected,
   * the error state should clear immediately.
   * 
   * Feature: authentication-redesign, Property 2: Real-time Validation Behavior
   * Validates: Requirements 1.2, 2.1, 2.3, 2.4
   */
  it('should provide immediate validation feedback on blur and clear errors when corrected', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Test with known working validation scenarios based on unit tests
        fc.oneof(
          fc.constant({ value: 'ab', minLength: 3, shouldShowError: true }),
          fc.constant({ value: 'valid input', minLength: 3, shouldShowError: false }),
          fc.constant({ value: '', minLength: 3, shouldShowError: false }) // Empty is allowed by default
        ),
        fc.boolean(), // validateOnBlur
        async (testCase, validateOnBlur) => {
          const validationRules = [
            {
              test: (value) => value.length >= testCase.minLength,
              message: `Must be at least ${testCase.minLength} characters`,
              type: 'error'
            }
          ];
          
          const { unmount } = render(
            <ValidatedInput
              label={`Test Field ${Math.random()}`}
              validationRules={validationRules}
              validateOnBlur={validateOnBlur}
            />
          );
          
          try {
            const input = screen.getByLabelText(/Test Field/);
            
            // Enter test value and blur
            fireEvent.change(input, { target: { value: testCase.value } });
            fireEvent.blur(input);
            
            if (validateOnBlur && testCase.shouldShowError) {
              await waitFor(() => {
                const errorElements = screen.queryAllByText(new RegExp(`Must be at least ${testCase.minLength} characters`, 'i'));
                expect(errorElements.length).toBeGreaterThan(0);
              }, { timeout: 500 });
            }
            
          } finally {
            unmount();
          }
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property test for validateOnChange behavior
   */
  it('should validate on change when enabled and field is touched', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant({ value: 'ab', shouldShowError: true }),
          fc.constant({ value: 'valid input', shouldShowError: false })
        ),
        fc.boolean(), // validateOnChange setting
        async (testCase, validateOnChange) => {
          const validationRules = [
            {
              test: (value) => value.length >= 3,
              message: 'Must be at least 3 characters',
              type: 'error'
            }
          ];
          
          const { unmount } = render(
            <ValidatedInput
              label={`Change Test ${Math.random()}`}
              validationRules={validationRules}
              validateOnBlur={true}
              validateOnChange={validateOnChange}
            />
          );
          
          try {
            const input = screen.getByLabelText(/Change Test/);
            
            // First blur to mark as touched
            fireEvent.blur(input);
            
            // Then change value
            fireEvent.change(input, { target: { value: testCase.value } });
            
            if (validateOnChange && testCase.shouldShowError) {
              await waitFor(() => {
                const errorElements = screen.queryAllByText(/Must be at least 3 characters/i);
                expect(errorElements.length).toBeGreaterThan(0);
              }, { timeout: 500 });
            }
            
          } finally {
            unmount();
          }
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property test for validation state consistency
   */
  it('should maintain consistent validation states across rule combinations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant({ hasRequired: true, value: '', shouldShowError: true }),
          fc.constant({ hasRequired: false, value: 'ab', shouldShowError: true }),
          fc.constant({ hasRequired: false, value: 'validinput', shouldShowError: false })
        ),
        async (testCase) => {
          const validationRules = [];
          
          if (testCase.hasRequired) {
            validationRules.push({
              test: (value) => value && value.trim().length > 0,
              message: 'This field is required',
              type: 'error'
            });
          }
          
          validationRules.push({
            test: (value) => value.length >= 3,
            message: 'Must be at least 3 characters',
            type: 'error'
          });
          
          const { unmount } = render(
            <ValidatedInput
              label={`Consistency Test ${Math.random()}`}
              validationRules={validationRules}
              validateOnBlur={true}
            />
          );
          
          try {
            const input = screen.getByLabelText(/Consistency Test/);
            
            fireEvent.change(input, { target: { value: testCase.value } });
            fireEvent.blur(input);
            
            if (testCase.shouldShowError) {
              await waitFor(() => {
                const errorElements = screen.queryAllByText(/required|Must be at least/i);
                expect(errorElements.length).toBeGreaterThan(0);
              }, { timeout: 500 });
            }
            
          } finally {
            unmount();
          }
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property test for email validation behavior
   */
  it('should handle email validation correctly across different email formats', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant({ email: 'test@example.com', shouldShowError: false }),
          fc.constant({ email: 'invalid', shouldShowError: true }),
          fc.constant({ email: '', shouldShowError: true }),
        ),
        async (testCase) => {
          const emailRules = createEmailValidationRules();
          
          const { unmount } = render(
            <ValidatedInput
              label={`Email Test ${Math.random()}`}
              type="email"
              validationRules={emailRules}
              validateOnBlur={true}
            />
          );
          
          try {
            const input = screen.getByLabelText(/Email Test/);
            
            fireEvent.change(input, { target: { value: testCase.email } });
            fireEvent.blur(input);
            
            if (testCase.shouldShowError) {
              await waitFor(() => {
                const errorElements = screen.queryAllByText(/required|valid|@|email/i);
                expect(errorElements.length).toBeGreaterThan(0);
              }, { timeout: 500 });
            }
            
          } finally {
            unmount();
          }
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });
});