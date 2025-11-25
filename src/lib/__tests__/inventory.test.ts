import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDaysUntilExpiry } from '../inventory';

describe('Inventory Utilities', () => {
  describe('calculateDaysUntilExpiry', () => {
    it('should return null for null expiry date', () => {
      expect(calculateDaysUntilExpiry(null)).toBeNull();
    });

    it('should return null for undefined expiry date', () => {
      expect(calculateDaysUntilExpiry(undefined)).toBeNull();
    });

    it('should calculate days correctly for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const expiryDate = futureDate.toISOString().split('T')[0];

      const days = calculateDaysUntilExpiry(expiryDate);
      // Allow for 1 day variance due to time of day differences
      expect(days).toBeGreaterThanOrEqual(6);
      expect(days).toBeLessThanOrEqual(8);
    });

    it('should return negative number for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      const expiryDate = pastDate.toISOString().split('T')[0];

      const days = calculateDaysUntilExpiry(expiryDate);
      expect(days).toBeLessThan(0);
    });

    it('should return 0 or -1 for today (depending on time of day)', () => {
      const today = new Date().toISOString().split('T')[0];
      const days = calculateDaysUntilExpiry(today);
      // Can be 0 or -1 depending on time of day when test runs
      expect(days).toBeGreaterThanOrEqual(-1);
      expect(days).toBeLessThanOrEqual(0);
    });
  });
});

