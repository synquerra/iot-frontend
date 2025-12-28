import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ValidatedInput from './ValidatedInput.jsx';
import { createEmailValidationRules } from '../../utils/validation.js';

describe('ValidatedInput', () => {
  it('renders without validation rules', () => {
    render(
      <ValidatedInput
        label="Test Input"
        placeholder="Enter text"
      />
    );
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('shows error state when validation fails on blur', async () => {
    const validationRules = [
      {
        test: (value) => value.length >= 3,
        message: 'Must be at least 3 characters',
        type: 'error'
      }
    ];

    render(
      <ValidatedInput
        label="Test Input"
        validationRules={validationRules}
        validateOnBlur={true}
      />
    );
    
    const input = screen.getByLabelText('Test Input');
    
    // Enter invalid value and blur
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('shows success state when validation passes', async () => {
    const validationRules = [
      {
        test: (value) => value.length >= 3,
        message: 'Must be at least 3 characters',
        type: 'error'
      }
    ];

    render(
      <ValidatedInput
        label="Test Input"
        validationRules={validationRules}
        validateOnBlur={true}
      />
    );
    
    const input = screen.getByLabelText('Test Input');
    
    // Enter valid value and blur
    fireEvent.change(input, { target: { value: 'valid input' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText('Valid input')).toBeInTheDocument();
    });
  });

  it('validates on change when enabled', async () => {
    const validationRules = [
      {
        test: (value) => value.length >= 3,
        message: 'Must be at least 3 characters',
        type: 'error'
      }
    ];

    render(
      <ValidatedInput
        label="Test Input"
        validationRules={validationRules}
        validateOnChange={true}
        validateOnBlur={true}
      />
    );
    
    const input = screen.getByLabelText('Test Input');
    
    // First blur to mark as touched
    fireEvent.blur(input);
    
    // Then change value
    fireEvent.change(input, { target: { value: 'ab' } });
    
    await waitFor(() => {
      expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('works with email validation rules', async () => {
    const emailRules = createEmailValidationRules();

    render(
      <ValidatedInput
        label="Email"
        type="email"
        validationRules={emailRules}
        validateOnBlur={true}
      />
    );
    
    const input = screen.getByLabelText('Email');
    
    // Enter invalid email and blur
    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText('Email address must contain an @ symbol')).toBeInTheDocument();
    });
    
    // Enter valid email
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.getByText('Valid input')).toBeInTheDocument();
    });
  });

  it('calls onChange and onBlur handlers', () => {
    const handleChange = vi.fn();
    const handleBlur = vi.fn();

    render(
      <ValidatedInput
        label="Test Input"
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByLabelText('Test Input');
    
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });
});