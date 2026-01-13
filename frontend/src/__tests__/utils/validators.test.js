import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  validatePassword,
  isRequired,
  minLength,
  maxLength,
  validateForm,
  hasErrors,
} from '../../utils/validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns no errors for valid passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.length).toBe(0);
    });

    it('returns error for short passwords', () => {
      const result = validatePassword('Short1!');
      expect(result).toContain('Password must be at least 8 characters');
    });

    it('returns error for passwords without uppercase', () => {
      const result = validatePassword('lowercase123!');
      expect(result).toContain('Password must contain at least one uppercase letter');
    });

    it('returns error for passwords without lowercase', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result).toContain('Password must contain at least one lowercase letter');
    });

    it('returns error for passwords without numbers', () => {
      const result = validatePassword('NoNumbers!!');
      expect(result).toContain('Password must contain at least one number');
    });
  });

  describe('isRequired', () => {
    it('returns error message for empty values', () => {
      expect(isRequired('')('Field')).toBe('Field is required');
      expect(isRequired(null)('Field')).toBe('Field is required');
      expect(isRequired(undefined)('Field')).toBe('Field is required');
    });

    it('returns null for non-empty values', () => {
      expect(isRequired('value')('Field')).toBeNull();
      expect(isRequired(0)('Field')).toBeNull();
      expect(isRequired(false)('Field')).toBeNull();
    });
  });

  describe('minLength', () => {
    it('returns error for values shorter than minimum', () => {
      const validator = minLength(5);
      expect(validator('abc')('Field')).toBe('Field must be at least 5 characters');
    });

    it('returns null for values meeting minimum length', () => {
      const validator = minLength(5);
      expect(validator('abcde')('Field')).toBeNull();
      expect(validator('abcdef')('Field')).toBeNull();
    });
  });

  describe('maxLength', () => {
    it('returns error for values longer than maximum', () => {
      const validator = maxLength(5);
      expect(validator('abcdef')('Field')).toBe('Field must be no more than 5 characters');
    });

    it('returns null for values meeting maximum length', () => {
      const validator = maxLength(5);
      expect(validator('abcde')('Field')).toBeNull();
      expect(validator('abc')('Field')).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('returns empty object for valid form', () => {
      const rules = {
        email: [(value) => isRequired(value)('Email')],
        name: [(value) => isRequired(value)('Name')],
      };
      const values = { email: 'test@example.com', name: 'Test User' };

      const errors = validateForm(values, rules);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('returns errors for invalid form', () => {
      const rules = {
        email: [(value) => isRequired(value)('Email')],
        name: [(value) => isRequired(value)('Name')],
      };
      const values = { email: '', name: '' };

      const errors = validateForm(values, rules);
      expect(errors.email).toBe('Email is required');
      expect(errors.name).toBe('Name is required');
    });
  });

  describe('hasErrors', () => {
    it('returns true when errors exist', () => {
      expect(hasErrors({ email: 'Invalid email' })).toBe(true);
    });

    it('returns false when no errors', () => {
      expect(hasErrors({})).toBe(false);
      expect(hasErrors({ email: null, name: null })).toBe(false);
    });
  });
});
