import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Notification } from './Notification.jsx';

describe('Notification', () => {
  // Test success notification rendering
  describe('Success notification rendering', () => {
    it('renders success notification with message', () => {
      render(
        <Notification
          type="success"
          message="Contact settings saved successfully"
          onDismiss={vi.fn()}
        />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Contact settings saved successfully')).toBeInTheDocument();
    });

    it('applies success color classes', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('bg-green-500/20', 'border-green-400/50', 'text-green-200');
    });

    it('displays success icon', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      const svg = notification.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('does not display dismiss button for success notifications', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      expect(screen.queryByLabelText('Dismiss notification')).not.toBeInTheDocument();
    });
  });

  // Test error notification rendering
  describe('Error notification rendering', () => {
    it('renders error notification with message', () => {
      render(
        <Notification
          type="error"
          message="Failed to save contact settings"
          onDismiss={vi.fn()}
        />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to save contact settings')).toBeInTheDocument();
    });

    it('applies error color classes', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('bg-red-500/20', 'border-red-400/50', 'text-red-200');
    });

    it('displays error icon', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      const svg = notification.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('displays dismiss button for error notifications', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });

    it('dismiss button has proper styling', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toHaveClass('text-red-300', 'hover:text-red-100', 'transition-colors');
    });

    it('dismiss button contains close icon', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      const svg = dismissButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-5', 'h-5');
    });
  });

  // Test dismiss functionality
  describe('Dismiss functionality', () => {
    it('calls onDismiss when dismiss button is clicked', () => {
      const handleDismiss = vi.fn();
      
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={handleDismiss}
        />
      );
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);
      
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not call onDismiss for success notifications (no dismiss button)', () => {
      const handleDismiss = vi.fn();
      
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={handleDismiss}
        />
      );
      
      expect(screen.queryByLabelText('Dismiss notification')).not.toBeInTheDocument();
      expect(handleDismiss).not.toHaveBeenCalled();
    });

    it('dismiss button is keyboard accessible', () => {
      const handleDismiss = vi.fn();
      
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={handleDismiss}
        />
      );
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton.tagName).toBe('BUTTON');
    });
  });

  // Test accessibility attributes
  describe('Accessibility attributes', () => {
    it('has role="alert" for screen readers', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveAttribute('role', 'alert');
    });

    it('has aria-live="polite" for screen reader announcements', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveAttribute('aria-live', 'polite');
    });

    it('dismiss button has aria-label for screen readers', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('maintains accessibility attributes for error notifications', () => {
      render(
        <Notification
          type="error"
          message="Error message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveAttribute('role', 'alert');
      expect(notification).toHaveAttribute('aria-live', 'polite');
    });
  });

  // Test edge cases
  describe('Edge cases', () => {
    it('returns null when message is empty string', () => {
      const { container } = render(
        <Notification
          type="success"
          message=""
          onDismiss={vi.fn()}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('returns null when message is not provided', () => {
      const { container } = render(
        <Notification
          type="success"
          onDismiss={vi.fn()}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('handles empty type gracefully (defaults to error styling)', () => {
      render(
        <Notification
          type=""
          message="Message with empty type"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('bg-red-500/20', 'border-red-400/50', 'text-red-200');
    });

    it('renders long messages correctly', () => {
      const longMessage = 'This is a very long error message that contains a lot of information about what went wrong and how the user might be able to fix it. It should still render correctly without breaking the layout.';
      
      render(
        <Notification
          type="error"
          message={longMessage}
          onDismiss={vi.fn()}
        />
      );
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles special characters in message', () => {
      const messageWithSpecialChars = 'Error: <script>alert("test")</script> & "quotes" \'apostrophes\'';
      
      render(
        <Notification
          type="error"
          message={messageWithSpecialChars}
          onDismiss={vi.fn()}
        />
      );
      
      expect(screen.getByText(messageWithSpecialChars)).toBeInTheDocument();
    });
  });

  // Test layout and structure
  describe('Layout and structure', () => {
    it('has proper flex layout classes', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('flex', 'items-start', 'gap-3');
    });

    it('has proper padding and border classes', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('p-4', 'rounded-lg', 'border');
    });

    it('message text has proper styling', () => {
      render(
        <Notification
          type="success"
          message="Success message"
          onDismiss={vi.fn()}
        />
      );
      
      const messageElement = screen.getByText('Success message');
      expect(messageElement).toHaveClass('text-sm', 'font-medium');
    });
  });
});
