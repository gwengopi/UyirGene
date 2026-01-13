import { VALIDATION } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate string length
 * @param {string} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {string|null} Error message or null if valid
 */
export function validateLength(value, fieldName, min, max) {
  if (!value) return null; // Use validateRequired for required check

  const length = value.trim().length;

  if (min && length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }

  if (max && length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }

  return null;
}

/**
 * Validate a number is positive
 * @param {number} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export function validatePositiveNumber(value, fieldName) {
  if (value === null || value === undefined) return null;

  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num < 0) {
    return `${fieldName} must be positive`;
  }
  return null;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate form based on schema
 * @param {Object} schema - Validation schema
 * @param {Object} values - Form values
 * @returns {Object} Object with errors for each field
 */
export function validateForm(schema, values) {
  const errors = {};

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = values[field];

    // Check required
    if (rules.required) {
      const requiredError = validateRequired(value, rules.label || field);
      if (requiredError) {
        errors[field] = requiredError;
        return;
      }
    }

    // Check email
    if (rules.email && value && !isValidEmail(value)) {
      errors[field] = 'Invalid email address';
      return;
    }

    // Check URL
    if (rules.url && value && !isValidUrl(value)) {
      errors[field] = 'Invalid URL';
      return;
    }

    // Check length
    if (rules.minLength || rules.maxLength) {
      const lengthError = validateLength(value, rules.label || field, rules.minLength, rules.maxLength);
      if (lengthError) {
        errors[field] = lengthError;
        return;
      }
    }

    // Check positive number
    if (rules.positive && value !== null && value !== undefined) {
      const numberError = validatePositiveNumber(value, rules.label || field);
      if (numberError) {
        errors[field] = numberError;
        return;
      }
    }

    // Check password
    if (rules.password && value) {
      const passwordResult = validatePassword(value);
      if (!passwordResult.isValid) {
        errors[field] = passwordResult.errors[0];
        return;
      }
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
}

/**
 * Check if validation errors object has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if has errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export default {
  isValidEmail,
  validatePassword,
  validateRequired,
  validateLength,
  validatePositiveNumber,
  isValidUrl,
  validateForm,
  hasErrors,
};
