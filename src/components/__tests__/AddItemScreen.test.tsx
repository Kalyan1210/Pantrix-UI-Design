import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AddItemScreen } from '../AddItemScreen';

// Mock the dependencies
vi.mock('../../lib/inventory', () => ({
  addInventoryItem: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AddItemScreen', () => {
  const mockOnBack = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnScanBarcode = vi.fn();

  it('should render the Add Item screen', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('should render scan receipt button', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    expect(screen.getByText('Scan Receipt')).toBeInTheDocument();
  });

  it('should render item name input', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
  });

  it('should render quantity controls', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    // Should show quantity value
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render location selection', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Fridge')).toBeInTheDocument();
    expect(screen.getByText('Freezer')).toBeInTheDocument();
    expect(screen.getByText('Pantry')).toBeInTheDocument();
    expect(screen.getByText('Counter')).toBeInTheDocument();
  });

  it('should render category selection', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('should render save button', () => {
    render(
      <AddItemScreen
        onBack={mockOnBack}
        onSave={mockOnSave}
        onScanBarcode={mockOnScanBarcode}
      />
    );

    expect(screen.getByText('Add to Inventory')).toBeInTheDocument();
  });
});

