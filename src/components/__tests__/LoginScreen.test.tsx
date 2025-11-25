import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginScreen } from '../LoginScreen';

// Mock dependencies
vi.mock('../../lib/auth', () => ({
  signIn: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginScreen', () => {
  const mockOnLogin = vi.fn();
  const mockOnSignUp = vi.fn();

  it('should render the login screen', () => {
    render(<LoginScreen onLogin={mockOnLogin} onSignUp={mockOnSignUp} />);
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    // Sign in appears multiple times, check for button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<LoginScreen onLogin={mockOnLogin} onSignUp={mockOnSignUp} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render password input', () => {
    render(<LoginScreen onLogin={mockOnLogin} onSignUp={mockOnSignUp} />);
    
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render sign in button', () => {
    render(<LoginScreen onLogin={mockOnLogin} onSignUp={mockOnSignUp} />);
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render sign up link', () => {
    render(<LoginScreen onLogin={mockOnLogin} onSignUp={mockOnSignUp} />);
    
    // Check for sign up button or link
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
});

