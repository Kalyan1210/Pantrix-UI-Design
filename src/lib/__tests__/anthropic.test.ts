import { describe, it, expect, vi } from 'vitest';
import { getLocationForCategory, estimateExpiryDate } from '../anthropic';

describe('Anthropic Utilities', () => {
  describe('getLocationForCategory', () => {
    it('should return fridge for dairy', () => {
      expect(getLocationForCategory('dairy')).toBe('fridge');
    });

    it('should return fridge for meat', () => {
      expect(getLocationForCategory('meat')).toBe('fridge');
    });

    it('should return freezer for frozen items', () => {
      expect(getLocationForCategory('frozen')).toBe('freezer');
    });

    it('should return pantry for snacks', () => {
      expect(getLocationForCategory('snacks')).toBe('pantry');
    });

    it('should return counter for fruits', () => {
      expect(getLocationForCategory('fruits')).toBe('counter');
    });

    it('should return default pantry for unknown category', () => {
      expect(getLocationForCategory('unknown')).toBe('pantry');
    });

    it('should handle case insensitive categories', () => {
      expect(getLocationForCategory('DAIRY')).toBe('fridge');
      expect(getLocationForCategory('Dairy')).toBe('fridge');
    });
  });

  describe('estimateExpiryDate', () => {
    it('should return future date', () => {
      const expiryDate = estimateExpiryDate('dairy');
      const today = new Date();
      expect(expiryDate.getTime()).toBeGreaterThan(today.getTime());
    });

    it('should return different dates for different categories', () => {
      const dairyDate = estimateExpiryDate('dairy');
      const frozenDate = estimateExpiryDate('frozen');
      expect(frozenDate.getTime()).toBeGreaterThan(dairyDate.getTime());
    });

    it('should estimate 7 days for dairy', () => {
      const expiryDate = estimateExpiryDate('dairy');
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('should estimate 90 days for frozen', () => {
      const expiryDate = estimateExpiryDate('frozen');
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(90);
    });
  });
});

