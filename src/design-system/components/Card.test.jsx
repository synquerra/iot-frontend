import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './Card.jsx';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(<Card data-testid="card">Default Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-surface-primary');
    expect(card).toHaveClass('border-border-primary');
    // Check for responsive padding - should include md:p-6
    expect(card.className).toMatch(/md:p-6/);
  });

  it('renders all variants correctly', () => {
    const { rerender } = render(<Card data-testid="card" variant="default">Default</Card>);
    expect(screen.getByTestId('card')).toHaveClass('bg-surface-primary');

    rerender(<Card data-testid="card" variant="elevated">Elevated</Card>);
    expect(screen.getByTestId('card')).toHaveClass('bg-surface-secondary');
    // Check for responsive shadows - should include md:shadow-xl
    expect(screen.getByTestId('card').className).toMatch(/md:shadow-xl/);

    rerender(<Card data-testid="card" variant="outlined">Outlined</Card>);
    expect(screen.getByTestId('card')).toHaveClass('bg-transparent');
    expect(screen.getByTestId('card')).toHaveClass('border-2');

    rerender(<Card data-testid="card" variant="gradient">Gradient</Card>);
    // Check for responsive gradient - should include md:bg-gradient-primary
    expect(screen.getByTestId('card').className).toMatch(/md:bg-gradient-primary/);
    expect(screen.getByTestId('card')).toHaveClass('backdrop-blur-sm');

    rerender(<Card data-testid="card" variant="glass">Glass</Card>);
    expect(screen.getByTestId('card').className).toMatch(/backdrop-blur-/);
    expect(screen.getByTestId('card')).toHaveClass('bg-gradient-to-br');

    rerender(<Card data-testid="card" variant="colorful">Colorful</Card>);
    expect(screen.getByTestId('card')).toHaveClass('border-2');
    // Check for responsive shadows
    expect(screen.getByTestId('card').className).toMatch(/md:shadow-xl/);
  });

  it('renders all padding sizes correctly', () => {
    const { rerender } = render(<Card data-testid="card" padding="sm">Small</Card>);
    // Check for responsive padding - should include md:p-4
    expect(screen.getByTestId('card').className).toMatch(/md:p-4/);

    rerender(<Card data-testid="card" padding="md">Medium</Card>);
    // Check for responsive padding - should include md:p-6
    expect(screen.getByTestId('card').className).toMatch(/md:p-6/);

    rerender(<Card data-testid="card" padding="lg">Large</Card>);
    // Check for responsive padding - should include md:p-8
    expect(screen.getByTestId('card').className).toMatch(/md:p-8/);
  });

  it('applies color schemes correctly for gradient variant', () => {
    const { rerender } = render(
      <Card data-testid="card" variant="gradient" colorScheme="violet">Violet</Card>
    );
    // Check for responsive gradient - should include md:bg-gradient-primary
    expect(screen.getByTestId('card').className).toMatch(/md:bg-gradient-primary/);

    rerender(
      <Card data-testid="card" variant="gradient" colorScheme="blue">Blue</Card>
    );
    // Check for responsive gradient - should include md:bg-gradient-info
    expect(screen.getByTestId('card').className).toMatch(/md:bg-gradient-info/);

    rerender(
      <Card data-testid="card" variant="gradient" colorScheme="green">Green</Card>
    );
    // Check for responsive gradient - should include md:bg-gradient-success
    expect(screen.getByTestId('card').className).toMatch(/md:bg-gradient-success/);
  });

  it('applies color schemes correctly for colorful variant', () => {
    const { rerender } = render(
      <Card data-testid="card" variant="colorful" colorScheme="violet">Violet</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('border-violet-400');

    rerender(
      <Card data-testid="card" variant="colorful" colorScheme="blue">Blue</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('border-blue-400');

    rerender(
      <Card data-testid="card" variant="colorful" colorScheme="teal">Teal</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('border-teal-400');
  });

  it('applies hover effects correctly', () => {
    render(<Card data-testid="card" hover>Hoverable</Card>);
    const card = screen.getByTestId('card');
    // Check for responsive hover effects
    expect(card.className).toMatch(/hover:shadow-md/);
    expect(card.className).toMatch(/md:hover:scale-\[1\.02\]/);
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies border accent correctly', () => {
    render(
      <Card data-testid="card" borderAccent colorScheme="violet">
        Accent Border
      </Card>
    );
    const card = screen.getByTestId('card');
    // Check for responsive border accent - should include md:border-l-4
    expect(card.className).toMatch(/md:border-l-4/);
    expect(card).toHaveClass('border-l-violet-400');
  });

  it('applies glow effect with hover correctly', () => {
    render(
      <Card data-testid="card" glowEffect hover colorScheme="violet">
        Glow Effect
      </Card>
    );
    const card = screen.getByTestId('card');
    // Check for responsive glow effect - should include md:hover:shadow-violet-500/40
    expect(card.className).toMatch(/md:hover:shadow-violet-500\/40/);
  });

  it('applies custom className', () => {
    render(<Card data-testid="card" className="custom-class">Custom</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('renders with composition components', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Card Title</CardTitle>
          <CardDescription data-testid="description">Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Card Content</CardContent>
        <CardFooter data-testid="footer">Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('maintains proper semantic structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Test Title');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
  });

  it('handles all color schemes for border accent', () => {
    const colorSchemes = ['violet', 'blue', 'teal', 'green', 'amber', 'red', 'pink'];
    
    colorSchemes.forEach((colorScheme, index) => {
      render(
        <Card data-testid={`card-${index}`} borderAccent colorScheme={colorScheme}>
          {colorScheme}
        </Card>
      );
      const card = screen.getByTestId(`card-${index}`);
      expect(card).toHaveClass(`border-l-${colorScheme}-400`);
    });
  });

  it('includes responsive behavior by default', () => {
    render(<Card data-testid="card">Responsive Card</Card>);
    const card = screen.getByTestId('card');
    
    // Check for responsive classes
    expect(card.className).toMatch(/sm:/); // Should have some sm: classes
    expect(card.className).toMatch(/md:/); // Should have some md: classes
    expect(card.className).toMatch(/min-h-\[44px\]/); // Should have touch target height
  });

  it('can disable responsive behavior', () => {
    render(<Card data-testid="card" responsive={false}>Non-responsive Card</Card>);
    const card = screen.getByTestId('card');
    
    // Should still have basic classes but fewer responsive variants
    expect(card).toHaveClass('bg-surface-primary');
    expect(card).toBeInTheDocument();
  });
});