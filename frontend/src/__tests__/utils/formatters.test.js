import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDuration,
  formatDate,
  truncateText,
  formatNumber,
  formatFileSize,
} from '../../utils/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers as INR currency', () => {
      expect(formatCurrency(999)).toContain('999');
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(99999)).toContain('99,999');
    });

    it('handles zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('handles decimal values', () => {
      const result = formatCurrency(999.99);
      expect(result).toBeDefined();
    });
  });

  describe('formatDuration', () => {
    it('formats seconds to mm:ss', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(125)).toBe('2:05');
    });

    it('formats hours correctly', () => {
      expect(formatDuration(3665)).toBe('1:01:05');
    });

    it('handles zero', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    it('pads seconds with leading zero', () => {
      expect(formatDuration(5)).toBe('0:05');
    });
  });

  describe('formatDate', () => {
    it('formats date strings', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeDefined();
      expect(result).not.toBe('Invalid Date');
    });

    it('handles Date objects', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date);
      expect(result).toBeDefined();
    });

    it('returns empty string for invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('does not truncate short text', () => {
      const shortText = 'Short';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    it('handles empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('handles null values', () => {
      expect(truncateText(null, 10)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('handles small numbers', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(2048)).toBe('2.00 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });
  });
});
