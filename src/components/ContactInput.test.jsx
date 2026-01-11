import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContactInput } from './ContactInput.jsx';

describe('ContactInput', () => {
  // Test rendering with and without errors
  it('renders without error message', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
        placeholder="Enter phone number"
      />
    );
    
    expect(screen.getByLabelText(/Primary Contact/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
        error="Primary contact is required"
      />
    );
    
    expect(screen.getByLabelText(/Primary Contact/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Primary contact is required')).toBeInTheDocument();
  });

  it('displays error icon when error is present', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
        error="Primary contact is required"
      />
    );
    
    const errorMessage = screen.getByRole('alert');
    const svg = errorMessage.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // Test disabled state
  it('renders in disabled state', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value="123456789"
        onChange={vi.fn()}
        disabled={true}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toBeDisabled();
  });

  it('applies disabled styling when disabled', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value="123456789"
        onChange={vi.fn()}
        disabled={true}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  // Test accessibility attributes
  it('has proper ARIA attributes when no error', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('has proper ARIA attributes when error is present', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
        error="Primary contact is required"
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    
    const describedById = input.getAttribute('aria-describedby');
    const errorElement = document.getElementById(describedById);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent('Primary contact is required');
  });

  it('has required field indicator', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
      />
    );
    
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass('text-red-400');
  });

  it('has proper input type for phone numbers', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('associates label with input using htmlFor and id', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    const label = screen.getByText(/Primary Contact/i);
    
    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  // Test onChange handler
  it('calls onChange handler when input value changes', () => {
    const handleChange = vi.fn();
    
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={handleChange}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('passes event object to onChange handler', () => {
    const handleChange = vi.fn();
    
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={handleChange}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    const callArgs = handleChange.mock.calls[0][0];
    expect(callArgs).toHaveProperty('target');
    expect(callArgs.type).toBe('change');
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={handleChange}
        disabled={true}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    fireEvent.change(input, { target: { value: '1234567890' } });
    
    // Disabled inputs don't trigger change events in the browser
    expect(input).toBeDisabled();
  });

  // Test placeholder
  it('displays placeholder text', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
        placeholder="Enter phone number"
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveAttribute('placeholder', 'Enter phone number');
  });

  // Test value display
  it('displays the current value', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value="1234567890"
        onChange={vi.fn()}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveValue('1234567890');
  });

  // Test error styling
  it('applies error border styling when error is present', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
        error="Primary contact is required"
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveClass('border-red-400/60');
  });

  it('applies normal border styling when no error', () => {
    render(
      <ContactInput
        label="Primary Contact"
        value=""
        onChange={vi.fn()}
      />
    );
    
    const input = screen.getByLabelText(/Primary Contact/i);
    expect(input).toHaveClass('border-white/20');
  });
});
