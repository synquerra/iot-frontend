import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import * as auth from '../utils/auth';
import * as authResponseParser from '../utils/authResponseParser';
import { UserContextProvider } from '../contexts/UserContext';

// Mock the auth utility
vi.mock('../utils/auth', () => ({
  authenticateUser: vi.fn(),
}));

// Mock the auth response parser
vi.mock('../utils/authResponseParser', () => ({
  persistUserContext: vi.fn(),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render Login with router context and UserContext
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <UserContextProvider>
        <Login />
      </UserContextProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders login form with all required elements', () => {
      renderLogin();
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your Synquerra account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    });

    it('renders help text and support link', () => {
      renderLogin();
      
      expect(screen.getByText('Having trouble signing in?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get help' })).toBeInTheDocument();
    });

    it('has proper form attributes and accessibility', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveFocus(); // autoFocus should result in the element being focused
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('validates email format correctly', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      // Test with valid email - should not show validation error
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'somepassword' } });
      fireEvent.click(submitButton);
      
      // Should call authenticateUser with valid email (mocked to fail for this test)
      auth.authenticateUser.mockRejectedValue(new Error('Network error'));
      
      await waitFor(() => {
        expect(auth.authenticateUser).toHaveBeenCalledWith('valid@example.com', 'somepassword');
      });
    });

    it('clears field errors when user starts typing', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      // Trigger validation errors
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
      
      // Start typing in email field
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
      
      // Start typing in password field
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });

    it('does not submit form with validation errors', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      expect(auth.authenticateUser).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid credentials', async () => {
      const mockParsedContext = {
        uniqueId: '123',
        userType: 'ADMIN',
        imeis: [],
        email: 'john@example.com',
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };
      
      auth.authenticateUser.mockResolvedValue(mockParsedContext);
      authResponseParser.persistUserContext.mockReturnValue(true);
      
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(auth.authenticateUser).toHaveBeenCalledWith('john@example.com', 'password123');
      });
      
      await waitFor(() => {
        expect(authResponseParser.persistUserContext).toHaveBeenCalledWith(mockParsedContext);
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('shows loading state during submission', async () => {
      auth.authenticateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByText('Sign in')).toBeInTheDocument();
      });
    });

    it('displays error message on authentication failure', async () => {
      const errorMessage = 'Invalid credentials';
      auth.authenticateUser.mockRejectedValue(new Error(errorMessage));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('clears previous errors on new submission', async () => {
      auth.authenticateUser.mockRejectedValueOnce(new Error('First error'));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      // First submission with error
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });
      
      // Second submission should clear the error
      const mockParsedContext = {
        uniqueId: '123',
        userType: 'ADMIN',
        imeis: [],
        email: 'john@example.com',
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };
      auth.authenticateUser.mockResolvedValue(mockParsedContext);
      authResponseParser.persistUserContext.mockReturnValue(true);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    it('handles help button click', () => {
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      renderLogin();
      
      const helpButton = screen.getByRole('button', { name: 'Get help' });
      fireEvent.click(helpButton);
      
      expect(alertSpy).toHaveBeenCalledWith('Please contact support for assistance with your account.');
      
      alertSpy.mockRestore();
    });

    it('has working signup link', () => {
      renderLogin();
      
      const signupLink = screen.getByRole('link', { name: 'Sign up' });
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Responsive Behavior', () => {
    it('renders with responsive classes for mobile', () => {
      renderLogin();
      
      const container = screen.getByText('Welcome back').closest('.w-full');
      expect(container).toHaveClass('max-w-md');
      
      const outerContainer = container.parentElement;
      expect(outerContainer).toHaveClass('px-4'); // Mobile padding
      expect(outerContainer).toHaveClass('min-h-screen');
      expect(outerContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('uses large input sizes for better mobile interaction', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      
      // Check that inputs have large size class (h-12 for lg size)
      expect(emailInput).toHaveClass('h-12');
      expect(passwordInput).toHaveClass('h-12');
      expect(submitButton).toHaveClass('w-full'); // Full width button
    });

    it('has proper spacing and layout for different screen sizes', () => {
      renderLogin();
      
      const card = screen.getByText('Welcome back').closest('.bg-surface-primary');
      expect(card).toHaveClass('p-8'); // Adequate padding
      expect(card).toHaveClass('rounded-2xl'); // Rounded corners
      
      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form');
      expect(form).toHaveClass('space-y-6'); // Proper spacing between form elements
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
      
      const emailLabel = screen.getByText('Email address');
      const passwordLabel = screen.getByText('Password');
      
      expect(emailLabel).toHaveAttribute('for', emailInput.id);
      expect(passwordLabel).toHaveAttribute('for', passwordInput.id);
    });

    it('has proper button states and attributes', () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).not.toBeDisabled();
    });

    it('provides proper error announcements', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const emailError = screen.getByText('Email is required');
        const passwordError = screen.getByText('Password is required');
        
        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
      });
    });
  });
});