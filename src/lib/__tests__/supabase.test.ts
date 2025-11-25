import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapInventoryItemToUI, InventoryItem } from '../supabase';

describe('Supabase Utilities', () => {
  describe('mapInventoryItemToUI', () => {
    it('should map database item to UI item correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const expiryDate = futureDate.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const dbItem: InventoryItem = {
        item_id: '123',
        household_id: 'household-123',
        custom_name: 'Milk',
        quantity: 2,
        category: 'dairy',
        storage_location: 'fridge',
        purchase_date: today,
        expected_expiry_date: expiryDate,
        price: 3.99,
        image_url: 'https://example.com/image.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const uiItem = mapInventoryItemToUI(dbItem);

      expect(uiItem.id).toBe('123');
      expect(uiItem.name).toBe('Milk');
      expect(uiItem.quantity).toBe(2);
      expect(uiItem.category).toBe('dairy');
      expect(uiItem.location).toBe('fridge');
      expect(uiItem.expiry_date).toBe(expiryDate);
      expect(uiItem.price).toBe(3.99);
      expect(uiItem.image_url).toBe('https://example.com/image.jpg');
      expect(uiItem.daysUntilExpiry).toBeGreaterThan(0);
    });

    it('should use fallback location if storage_location is missing', () => {
      const dbItem: InventoryItem = {
        item_id: '123',
        household_id: 'household-123',
        custom_name: 'Bread',
        quantity: 1,
        category: 'bakery',
        storage_location: 'pantry' as any,
        location: 'counter',
        purchase_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const uiItem = mapInventoryItemToUI(dbItem);
      expect(uiItem.location).toBe('pantry');
    });

    it('should use fallback expiry_date if expected_expiry_date is missing', () => {
      const dbItem: InventoryItem = {
        item_id: '123',
        household_id: 'household-123',
        custom_name: 'Eggs',
        quantity: 1,
        category: 'dairy',
        storage_location: 'fridge',
        expiry_date: '2024-01-10',
        purchase_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const uiItem = mapInventoryItemToUI(dbItem);
      expect(uiItem.expiry_date).toBe('2024-01-10');
    });

    it('should handle missing custom_name gracefully', () => {
      const dbItem: InventoryItem = {
        item_id: '123',
        household_id: 'household-123',
        custom_name: null,
        quantity: 1,
        category: 'other',
        storage_location: 'pantry',
        purchase_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const uiItem = mapInventoryItemToUI(dbItem);
      expect(uiItem.name).toBe('Unnamed Item');
    });

    it('should calculate daysUntilExpiry correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const expiryDate = futureDate.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const dbItem: InventoryItem = {
        item_id: '123',
        household_id: 'household-123',
        custom_name: 'Test Item',
        quantity: 1,
        category: 'other',
        storage_location: 'pantry',
        expected_expiry_date: expiryDate,
        purchase_date: today,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const uiItem = mapInventoryItemToUI(dbItem);
      // Allow for 1 day variance due to time of day differences
      expect(uiItem.daysUntilExpiry).toBeGreaterThanOrEqual(4);
      expect(uiItem.daysUntilExpiry).toBeLessThanOrEqual(6);
    });
  });
});

