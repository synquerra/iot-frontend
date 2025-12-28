import { describe, it, expect } from 'vitest';
import { 
  validateEmail, 
  suggestEmailCorrection, 
  createEmailValidationRules,
  getEmailErrorMessage,
  validateMultipleEmails
} from './validation.js';

describe('Email Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user_name@example-domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        'invalid@',
        '@domain.com',
        'user@',
        'user@domain',
        'user..name@domain.com',
        'user name@domain.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    it('provides specific error messages for common mistakes', () => {
      const testCases = [
        {
          email: 'user name@domain.com',
          expectedError: 'Email address cannot contain spaces'
        },
        {
          email: 'userdomain.com',
          expectedError: 'Email address must contain an @ symbol'
        },
        {
          email: 'user@@domain.com',
          expectedError: 'Email address can only contain one @ symbol'
        },
        {
          email: 'user@',
          expectedError: 'Email address is missing the domain'
        },
        {
          email: 'user@domain',
          expectedError: 'Email address is missing the domain extension'
        }
      ];

      testCases.forEach(({ email, expectedError }) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(expectedError);
      });
    });
  });

  describe('suggestEmailCorrection', () => {
    it('suggests corrections for common typos', () => {
      const testCases = [
        {
          email: 'user@gmai.com',
          expected: 'user@gmail.com'
        },
        {
          email: 'user@yahooo.com',
          expected: 'user@yahoo.com'
        },
        {
          email: 'user@hotmai.com',
          expected: 'user@hotmail.com'
        }
      ];

      testCases.forEach(({ email, expected }) => {
        const result = suggestEmailCorrection(email);
        expect(result.hasSuggestion).toBe(true);
        expect(result.suggestedEmail).toBe(expected);
      });
    });

    it('returns no suggestion for correct domains', () => {
      const result = suggestEmailCorrection('user@gmail.com');
      expect(result.hasSuggestion).toBe(false);
    });
  });

  describe('createEmailValidationRules', () => {
    it('creates validation rules with default options', () => {
      const rules = createEmailValidationRules();
      expect(rules).toHaveLength(3); // required, format, suggestion
      
      // Test required rule
      expect(rules[0].test('')).toBe(false);
      expect(rules[0].test('   ')).toBe(false); // whitespace only
      expect(rules[0].test('test@example.com')).toBe(true);
      expect(rules[0].type).toBe('error');
      
      // Test format rule
      expect(rules[1].test('invalid')).toBe(false);
      expect(rules[1].test('test@example.com')).toBe(true);
      expect(rules[1].type).toBe('error');
    });

    it('creates validation rules without required when disabled', () => {
      const rules = createEmailValidationRules({ required: false });
      expect(rules).toHaveLength(2); // format, suggestion only
    });

    it('creates validation rules without suggestions when disabled', () => {
      const rules = createEmailValidationRules({ allowSuggestions: false });
      expect(rules).toHaveLength(2); // required, format only
    });
  });

  describe('getEmailErrorMessage', () => {
    it('returns null for valid emails', () => {
      const message = getEmailErrorMessage('test@example.com');
      expect(message).toBeNull();
    });

    it('returns error message with suggestion for invalid emails', () => {
      // Test with clearly invalid email
      const message = getEmailErrorMessage('invalid-email');
      expect(message).toContain('Email address must contain an @ symbol');
      
      // Test with typo that should get suggestion
      const messageWithTypo = getEmailErrorMessage('user@gmai.com');
      // This is actually valid format, so should return null
      expect(messageWithTypo).toBeNull();
    });
  });

  describe('validateMultipleEmails', () => {
    it('validates array of emails', () => {
      const emails = ['test@example.com', 'invalid', 'user@domain.org'];
      const result = validateMultipleEmails(emails);
      
      expect(result.isValid).toBe(false);
      expect(result.validCount).toBe(2);
      expect(result.invalidCount).toBe(1);
      expect(result.invalidEmails).toHaveLength(1);
      expect(result.invalidEmails[0].email).toBe('invalid');
    });

    it('handles empty array', () => {
      const result = validateMultipleEmails([]);
      expect(result.isValid).toBe(true);
      expect(result.validCount).toBe(0);
      expect(result.invalidCount).toBe(0);
    });

    it('handles non-array input', () => {
      const result = validateMultipleEmails('not-an-array');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Expected array of email addresses');
    });
  });
});