import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ValidatedInput from './src/components/auth/ValidatedInput.jsx';

// Simple debug test to understand validation behavior
const validationRules = [
  {
    test: (value) => !value || value.length >= 3,
    message: 'Must be at least 3 characters',
    type: 'error'
  }
];

const { container } = render(
  <ValidatedInput
    label="Debug Test"
    validationRules={validationRules}
    validateOnBlur={true}
  />
);

const input = screen.getByLabelText('Debug Test');

// Test with "ab" (should fail)
fireEvent.change(input, { target: { value: 'ab' } });
fireEvent.blur(input);

console.log('After entering "ab" and blur:');
console.log('HTML:', container.innerHTML);
console.log('Error elements:', screen.queryAllByText(/Must be at least 3 characters/i));

// Test validation rule directly
console.log('Rule test for "ab":', validationRules[0].test('ab'));
console.log('Rule test for "":', validationRules[0].test(''));
console.log('Rule test for "abc":', validationRules[0].test('abc'));