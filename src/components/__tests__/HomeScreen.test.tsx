import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomeScreen } from '../HomeScreen';

// Mock dependencies
vi.mock('../../lib/inventory', () => ({
  getInventoryItems: vi.fn().mockResolvedValue([]),
  calculateDaysUntilExpiry: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
}));

describe('HomeScreen', () => {
  const mockOnNavigate = vi.fn();

  it('should render the home screen', () => {
    render(<HomeScreen onNavigate={mockOnNavigate} />);
    expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument();
  });

  it('should render stat cards', async () => {
    render(<HomeScreen onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText(/expiring today/i)).toBeInTheDocument();
      expect(screen.getByText(/running low/i)).toBeInTheDocument();
      expect(screen.getByText(/total items/i)).toBeInTheDocument();
    });
  });

  it('should render quick actions', () => {
    render(<HomeScreen onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/scan receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/add item/i)).toBeInTheDocument();
    // Shopping list appears multiple times, use getAllByText
    expect(screen.getAllByText(/shopping list/i).length).toBeGreaterThan(0);
  });
});

