import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button.jsx';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-violet-600'); // primary variant with violet color scheme
    // Check for responsive sizing - should include sm:h-10
    expect(button.className).toMatch(/sm:h-10/);
  });

  it('renders all variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-violet-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-slate-800');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-slate-300');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');

    rerender(<Button variant="success">Success</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');

    rerender(<Button variant="warning">Warning</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-amber-600');

    rerender(<Button variant="gradient" colorScheme="violet">Gradient</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r');
    expect(screen.getByRole('button')).toHaveClass('from-violet-600');

    rerender(<Button variant="colorful" colorScheme="blue">Colorful</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    expect(screen.getByRole('button')).toHaveClass('border-blue-400');

    rerender(<Button variant="outline" colorScheme="teal">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-teal-600');
    expect(screen.getByRole('button')).toHaveClass('text-teal-400');
  });

  it('renders all sizes correctly', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>);
    // Check for responsive sizing - should include sm:h-7
    expect(screen.getByRole('button').className).toMatch(/sm:h-7/);

    rerender(<Button size="sm">Small</Button>);
    // Check for responsive sizing - should include sm:h-8
    expect(screen.getByRole('button').className).toMatch(/sm:h-8/);

    rerender(<Button size="md">Medium</Button>);
    // Check for responsive sizing - should include sm:h-10
    expect(screen.getByRole('button').className).toMatch(/sm:h-10/);

    rerender(<Button size="lg">Large</Button>);
    // Check for responsive sizing - should include sm:h-12
    expect(screen.getByRole('button').className).toMatch(/sm:h-12/);

    rerender(<Button size="xl">Extra Large</Button>);
    // Check for responsive sizing - should include sm:h-14
    expect(screen.getByRole('button').className).toMatch(/sm:h-14/);
  });

  it('renders color schemes correctly', () => {
    const { rerender } = render(<Button colorScheme="blue">Blue</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<Button colorScheme="teal">Teal</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-teal-600');

    rerender(<Button colorScheme="green">Green</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');

    rerender(<Button colorScheme="amber">Amber</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-amber-600');

    rerender(<Button colorScheme="red">Red</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');

    rerender(<Button colorScheme="pink">Pink</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-pink-600');

    rerender(<Button colorScheme="purple">Purple</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-purple-600');
  });

  it('renders gradient variants with color schemes correctly', () => {
    const { rerender } = render(<Button variant="gradient" colorScheme="blue">Gradient Blue</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-blue-600');
    expect(screen.getByRole('button')).toHaveClass('to-cyan-600');

    rerender(<Button variant="gradient" colorScheme="teal">Gradient Teal</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-teal-600');
    expect(screen.getByRole('button')).toHaveClass('to-green-600');

    rerender(<Button variant="gradient" colorScheme="red">Gradient Red</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-red-600');
    expect(screen.getByRole('button')).toHaveClass('to-pink-600');
  });

  it('handles glow effect correctly', () => {
    render(<Button glow>Glow Button</Button>);
    const button = screen.getByRole('button');
    // Check for responsive glow - should include md:hover:drop-shadow-glow
    expect(button.className).toMatch(/md:hover:drop-shadow-glow/);
  });

  it('handles loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument(); // spinner
  });

  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click when disabled or loading', () => {
    const handleClick = vi.fn();
    
    const { rerender } = render(
      <Button disabled onClick={handleClick}>Disabled</Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();

    rerender(<Button loading onClick={handleClick}>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with icons correctly', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    
    render(
      <Button icon={<TestIcon />} iconPosition="left">
        With Icon
      </Button>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('has enhanced transition duration', () => {
    render(<Button>Enhanced Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-300');
  });

  it('includes transform-gpu for smooth animations', () => {
    render(<Button>GPU Accelerated</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transform-gpu');
  });

  it('includes hover scale effects', () => {
    render(<Button>Hover Scale</Button>);
    const button = screen.getByRole('button');
    // Check for responsive hover scale - should include md:hover:scale-[1.03]
    expect(button.className).toMatch(/md:hover:scale-\[1\.03\]/);
  });

  it('includes responsive behavior by default', () => {
    render(<Button>Responsive Button</Button>);
    const button = screen.getByRole('button');
    
    // Check for responsive classes
    expect(button.className).toMatch(/sm:/); // Should have some sm: classes
    expect(button.className).toMatch(/md:/); // Should have some md: classes
    expect(button.className).toMatch(/min-h-\[44px\]/); // Should have touch target height
  });

  it('can disable responsive behavior', () => {
    render(<Button responsive={false}>Non-responsive Button</Button>);
    const button = screen.getByRole('button');
    
    // Should still have basic classes but fewer responsive variants
    expect(button).toHaveClass('bg-violet-600');
    expect(button).toBeInTheDocument();
  });
});