import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { BrowserRouter } from 'react-router-dom';
import { AuthLayout, AuthCard, AuthHeader } from './index.js';
import Login from '../../pages/Login.jsx';
import Signup from '../../pages/Signup.jsx';

// Mock window.matchMedia for tests
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('Authentication Components', () => {
  describe('AuthLayout', () => {
    it('renders children correctly', () => {
      render(
        <AuthLayout title="Test Title" subtitle="Test Subtitle">
          <div data-testid="test-content">Test Content</div>
        </AuthLayout>
      );
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('applies correct background gradient classes', () => {
      const { container } = render(
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      );
      
      const layoutDiv = container.firstChild;
      expect(layoutDiv).toHaveClass('min-h-screen');
      expect(layoutDiv).toHaveClass('flex');
      expect(layoutDiv).toHaveClass('items-center');
      expect(layoutDiv).toHaveClass('justify-center');
      expect(layoutDiv).toHaveClass('bg-gradient-to-b');
      expect(layoutDiv).toHaveClass('from-slate-900');
      expect(layoutDiv).toHaveClass('to-surface-background');
    });

    it('shows help content when provided', () => {
      render(
        <AuthLayout showHelp={true} helpContent="Help text here">
          <div>Content</div>
        </AuthLayout>
      );
      
      expect(screen.getByText('Help text here')).toBeInTheDocument();
    });
  });

  describe('AuthCard', () => {
    it('renders children correctly', () => {
      render(
        <AuthCard>
          <div data-testid="card-content">Card Content</div>
        </AuthCard>
      );
      
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('applies correct styling classes', () => {
      const { container } = render(
        <AuthCard>
          <div>Content</div>
        </AuthCard>
      );
      
      const cardDiv = container.firstChild;
      expect(cardDiv).toHaveClass('bg-surface-primary');
      expect(cardDiv).toHaveClass('border');
      expect(cardDiv).toHaveClass('border-border-primary');
      expect(cardDiv).toHaveClass('rounded-2xl');
      expect(cardDiv).toHaveClass('p-8');
      expect(cardDiv).toHaveClass('shadow-xl');
    });
  });

  describe('AuthHeader', () => {
    it('renders title and subtitle correctly', () => {
      render(
        <AuthHeader 
          title="Welcome Back" 
          subtitle="Sign in to your account" 
        />
      );
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('applies correct heading structure', () => {
      render(
        <AuthHeader 
          title="Test Title" 
          subtitle="Test Subtitle" 
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Test Title');
      expect(title).toHaveClass('text-3xl');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('text-text-primary');
    });

    it('renders without subtitle when not provided', () => {
      render(<AuthHeader title="Only Title" />);
      
      expect(screen.getByText('Only Title')).toBeInTheDocument();
      expect(screen.queryByText('subtitle')).not.toBeInTheDocument();
    });

    it('applies custom titleId when provided', () => {
      render(
        <AuthHeader 
          title="Custom ID Title" 
          titleId="custom-title-id"
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveAttribute('id', 'custom-title-id');
    });
  });

  describe('Component Integration', () => {
    it('works together as a complete auth layout', () => {
      render(
        <AuthLayout>
          <AuthCard>
            <AuthHeader 
              title="Sign In" 
              subtitle="Welcome back to your account" 
            />
            <form data-testid="auth-form">
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit">Sign In</button>
            </form>
          </AuthCard>
        </AuthLayout>
      );
      
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText('Welcome back to your account')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
  });

  // Property-Based Tests
  describe('Property-Based Tests', () => {
    // Feature: authentication-redesign, Property 1: Design System Consistency
    it('Property 1: Design System Consistency - all authentication pages use design system components with consistent styling', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('login', 'signup'),
          (pageType) => {
            // Render the appropriate page component
            const PageComponent = pageType === 'login' ? Login : Signup;
            
            const { container } = render(
              <BrowserRouter>
                <PageComponent />
              </BrowserRouter>
            );

            // Test 1: Check for consistent background gradient classes
            const backgroundElement = container.querySelector('.bg-gradient-to-b');
            expect(backgroundElement).toBeTruthy();
            expect(backgroundElement).toHaveClass('from-slate-900');
            
            // Test 2: Check for consistent layout structure (min-h-screen, flex, items-center, justify-center)
            expect(backgroundElement).toHaveClass('min-h-screen');
            expect(backgroundElement).toHaveClass('flex');
            expect(backgroundElement).toHaveClass('items-center');
            expect(backgroundElement).toHaveClass('justify-center');

            // Test 3: Check for consistent card container styling
            const cardElement = container.querySelector('.rounded-2xl, .rounded-xl');
            expect(cardElement).toBeTruthy();
            
            // Test 4: Check for consistent typography hierarchy (h1 or h2 for main title)
            const titleElement = container.querySelector('h1, h2');
            expect(titleElement).toBeTruthy();
            expect(titleElement).toHaveClass('font-bold');

            // Test 5: Check for consistent spacing and padding
            const containerElement = container.querySelector('.max-w-md');
            expect(containerElement).toBeTruthy();

            // Test 6: Check for consistent form structure
            const formElement = container.querySelector('form');
            expect(formElement).toBeTruthy();

            // Test 7: Check for consistent button styling (should have proper classes)
            const buttonElement = container.querySelector('button[type="submit"]');
            expect(buttonElement).toBeTruthy();
            
            // Test 8: Check for consistent input styling patterns
            const inputElements = container.querySelectorAll('input');
            expect(inputElements.length).toBeGreaterThan(0);
            
            // For login page, verify it uses design system Input components
            if (pageType === 'login') {
              // Login should use design system components with proper classes
              const designSystemInputs = container.querySelectorAll('input.rounded-md');
              expect(designSystemInputs.length).toBeGreaterThan(0);
              
              // Check for design system button classes
              expect(buttonElement).toHaveClass('rounded-md');
            }

            // Test 9: Check for consistent color scheme usage
            const textElements = container.querySelectorAll('[class*="text-"]');
            expect(textElements.length).toBeGreaterThan(0);

            // Test 10: Check for consistent navigation links
            const linkElements = container.querySelectorAll('a, [class*="text-accent"]');
            expect(linkElements.length).toBeGreaterThan(0);

            return true; // Property holds
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});