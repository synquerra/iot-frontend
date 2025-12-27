/**
 * Accessible Wrapper Component Tests
 * Basic functionality tests for accessibility components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccessibleWrapper, AccessibleText, AccessibleButton, AccessibleStatusIndicator } from './AccessibleWrapper.jsx';

// Mock window.matchMedia for tests
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('AccessibleWrapper', () => {
  it('renders children correctly', () => {
    render(
      <AccessibleWrapper>
        <div>Test content</div>
      </AccessibleWrapper>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies ARIA attributes correctly', () => {
    render(
      <AccessibleWrapper
        role="button"
        ariaLabel="Test button"
        data-testid="accessible-wrapper"
      >
        <div>Button content</div>
      </AccessibleWrapper>
    );
    
    const wrapper = screen.getByTestId('accessible-wrapper');
    expect(wrapper).toHaveAttribute('role', 'button');
    expect(wrapper).toHaveAttribute('aria-label', 'Test button');
  });

  it('adds status indicators correctly', () => {
    render(
      <AccessibleWrapper
        statusIndicator="success"
        data-testid="status-wrapper"
      >
        <div>Success content</div>
      </AccessibleWrapper>
    );
    
    const wrapper = screen.getByTestId('status-wrapper');
    expect(wrapper).toBeInTheDocument();
  });
});

describe('AccessibleText', () => {
  it('renders text correctly', () => {
    render(
      <AccessibleText>
        Accessible text content
      </AccessibleText>
    );
    
    expect(screen.getByText('Accessible text content')).toBeInTheDocument();
  });
});

describe('AccessibleButton', () => {
  it('renders button correctly', () => {
    render(
      <AccessibleButton>
        Click me
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(
      <AccessibleButton loading loadingText="Loading...">
        Click me
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });
});

describe('AccessibleStatusIndicator', () => {
  it('renders status indicator correctly', () => {
    render(
      <AccessibleStatusIndicator status="success" />
    );
    
    const indicator = screen.getByText('success');
    expect(indicator).toBeInTheDocument();
  });

  it('includes proper ARIA attributes', () => {
    render(
      <AccessibleStatusIndicator status="error" data-testid="error-indicator" />
    );
    
    const indicator = screen.getByTestId('error-indicator');
    expect(indicator).toHaveAttribute('role', 'img');
    expect(indicator).toHaveAttribute('aria-label', 'Error');
  });
});