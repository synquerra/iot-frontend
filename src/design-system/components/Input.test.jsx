import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Input, Textarea, Select } from './Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('h-10'); // md size
    expect(input).toHaveClass('border-border-primary'); // default variant
  });

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    const label = screen.getByText('Email');
    const input = screen.getByPlaceholderText('Enter email');
    
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('renders with error state', () => {
    render(<Input error="This field is required" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    const errorText = screen.getByText('This field is required');
    
    expect(input).toHaveClass('border-status-error');
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('text-status-error');
  });

  it('renders with success state', () => {
    render(<Input success="Looks good!" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    const successText = screen.getByText('Looks good!');
    
    expect(input).toHaveClass('border-status-success');
    expect(successText).toBeInTheDocument();
    expect(successText).toHaveClass('text-status-success');
  });

  it('renders with warning state', () => {
    render(<Input warning="Please check this field" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    const warningText = screen.getByText('Please check this field');
    
    expect(input).toHaveClass('border-status-warning');
    expect(warningText).toBeInTheDocument();
    expect(warningText).toHaveClass('text-status-warning');
  });

  it('renders with info state', () => {
    render(<Input info="Additional information" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    const infoText = screen.getByText('Additional information');
    
    expect(input).toHaveClass('border-status-info');
    expect(infoText).toBeInTheDocument();
    expect(infoText).toHaveClass('text-status-info');
  });

  it('renders with colorful variant', () => {
    render(<Input variant="colorful" placeholder="Colorful input" />);
    const input = screen.getByPlaceholderText('Colorful input');
    
    expect(input).toHaveClass('border-violet-400/50');
    expect(input).toHaveClass('bg-gradient-to-r');
  });

  it('renders with gradient variant', () => {
    render(<Input variant="gradient" placeholder="Gradient input" />);
    const input = screen.getByPlaceholderText('Gradient input');
    
    expect(input).toHaveClass('border-transparent');
    expect(input).toHaveClass('bg-gradient-to-r');
  });

  it('renders with glass variant', () => {
    render(<Input variant="glass" placeholder="Glass input" />);
    const input = screen.getByPlaceholderText('Glass input');
    
    expect(input).toHaveClass('border-white/20');
    expect(input).toHaveClass('backdrop-blur-sm');
  });

  it('renders with colorful variant and color scheme', () => {
    render(<Input variant="colorful" colorScheme="blue" label="Blue Input" placeholder="Blue colorful input" />);
    const input = screen.getByPlaceholderText('Blue colorful input');
    const label = screen.getByText('Blue Input');
    
    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Input helperText="This is helper text" placeholder="Enter text" />);
    const helperText = screen.getByText('This is helper text');
    
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-text-tertiary');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText('Small')).toHaveClass('h-8');

    rerender(<Input size="lg" placeholder="Large" />);
    expect(screen.getByPlaceholderText('Large')).toHaveClass('h-12');
  });

  it('renders with icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">L</span>;
    const RightIcon = () => <span data-testid="right-icon">R</span>;
    
    render(
      <Input 
        leftIcon={<LeftIcon />} 
        rightIcon={<RightIcon />}
        placeholder="With icons" 
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('With icons')).toHaveClass('pl-10', 'pr-10');
  });

  it('handles focus and blur events', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    render(<Input onFocus={onFocus} onBlur={onBlur} placeholder="Focus test" />);
    const input = screen.getByPlaceholderText('Focus test');
    
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('has smooth transitions for state changes', () => {
    render(<Input placeholder="Transition test" />);
    const input = screen.getByPlaceholderText('Transition test');
    
    expect(input).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
  });

  it('has enhanced hover states', () => {
    render(<Input placeholder="Hover test" />);
    const input = screen.getByPlaceholderText('Hover test');
    
    expect(input).toHaveClass('hover:border-border-secondary', 'hover:shadow-sm');
  });
});

describe('Textarea Component', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter message" />);
    const textarea = screen.getByPlaceholderText('Enter message');
    
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '3');
  });

  it('renders with label and error', () => {
    render(<Textarea label="Message" error="Message is required" placeholder="Enter message" />);
    const label = screen.getByText('Message');
    const textarea = screen.getByPlaceholderText('Enter message');
    const errorText = screen.getByText('Message is required');
    
    expect(label).toBeInTheDocument();
    expect(textarea).toHaveClass('border-status-error');
    expect(errorText).toBeInTheDocument();
  });

  it('renders with custom rows', () => {
    render(<Textarea rows={5} placeholder="Large textarea" />);
    const textarea = screen.getByPlaceholderText('Large textarea');
    
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('renders with colorful variant and color scheme', () => {
    render(<Textarea variant="colorful" colorScheme="teal" label="Colorful Textarea" placeholder="Colorful message" />);
    const textarea = screen.getByPlaceholderText('Colorful message');
    const label = screen.getByText('Colorful Textarea');
    
    expect(textarea).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('renders with gradient variant', () => {
    render(<Textarea variant="gradient" placeholder="Gradient textarea" />);
    const textarea = screen.getByPlaceholderText('Gradient textarea');
    
    expect(textarea).toHaveClass('border-transparent');
    expect(textarea).toHaveClass('bg-gradient-to-r');
  });

  it('renders with warning state', () => {
    render(<Textarea warning="Please review your message" placeholder="Enter message" />);
    const textarea = screen.getByPlaceholderText('Enter message');
    const warningText = screen.getByText('Please review your message');
    
    expect(textarea).toHaveClass('border-status-warning');
    expect(warningText).toBeInTheDocument();
    expect(warningText).toHaveClass('text-status-warning');
  });
});

describe('Select Component', () => {
  it('renders with default props', () => {
    render(
      <Select placeholder="Choose option">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Choose option')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders with label and success state', () => {
    render(
      <Select label="Country" success="Valid selection" placeholder="Select country">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </Select>
    );
    
    const label = screen.getByText('Country');
    const select = screen.getByRole('combobox');
    const successText = screen.getByText('Valid selection');
    
    expect(label).toBeInTheDocument();
    expect(select).toHaveClass('border-status-success');
    expect(successText).toBeInTheDocument();
  });

  it('handles change events', () => {
    const onChange = vi.fn();
    
    render(
      <Select onChange={onChange} placeholder="Select option">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    
    expect(onChange).toHaveBeenCalled();
  });

  it('renders with colorful variant and color scheme', () => {
    render(
      <Select variant="colorful" colorScheme="green" label="Colorful Select" placeholder="Choose colorfully">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    
    const select = screen.getByRole('combobox');
    const label = screen.getByText('Colorful Select');
    
    expect(select).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('renders with glass variant', () => {
    render(
      <Select variant="glass" placeholder="Glass select">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-white/20');
    expect(select).toHaveClass('backdrop-blur-sm');
  });

  it('renders with info state', () => {
    render(
      <Select info="Additional information about this field" placeholder="Select option">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    
    const select = screen.getByRole('combobox');
    const infoText = screen.getByText('Additional information about this field');
    
    expect(select).toHaveClass('border-status-info');
    expect(infoText).toBeInTheDocument();
    expect(infoText).toHaveClass('text-status-info');
  });
});