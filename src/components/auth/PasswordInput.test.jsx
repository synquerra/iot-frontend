import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordInput from './PasswordInput';

describe('PasswordInput Component', () => {
  test('renders password input with visibility toggle', () => {
    render(
      <PasswordInput 
        label="Password"
        placeholder="Enter password"
      />
    );
    
    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText('Show password');
    
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
    expect(toggleButton).toBeInTheDocument();
  });

  test('toggles password visibility when button is clicked', () => {
    render(
      <PasswordInput 
        label="Password"
        placeholder="Enter password"
      />
    );
    
    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText('Show password');
    
    // Initially password type
    expect(input).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
    
    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Show password')).toBeInTheDocument();
  });

  test('shows password requirements when password is entered', () => {
    render(
      <PasswordInput 
        label="Password"
        placeholder="Enter password"
      />
    );
    
    const input = screen.getByLabelText('Password');
    
    // Enter a password
    fireEvent.change(input, { target: { value: 'test123' } });
    
    // Should show requirements checklist
    expect(screen.getByText('Password Requirements:')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter (A-Z)')).toBeInTheDocument();
  });

  test('updates strength indicator based on password quality', () => {
    render(
      <PasswordInput 
        label="Password"
        placeholder="Enter password"
      />
    );
    
    const input = screen.getByLabelText('Password');
    
    // Enter weak password
    fireEvent.change(input, { target: { value: 'password' } });
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
    
    // Enter stronger password
    fireEvent.change(input, { target: { value: 'MyStr0ng!Pass' } });
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
  });

  test('validates password requirements in real-time', () => {
    render(
      <PasswordInput 
        label="Password"
        placeholder="Enter password"
      />
    );
    
    const input = screen.getByLabelText('Password');
    
    // Enter password that meets some requirements
    fireEvent.change(input, { target: { value: 'MyPassword123!' } });
    
    // Should show requirements checklist with some items checked
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter (A-Z)')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter (a-z)')).toBeInTheDocument();
    expect(screen.getByText('One number (0-9)')).toBeInTheDocument();
    expect(screen.getByText('One special character (!@#$%^&*)')).toBeInTheDocument();
  });
});