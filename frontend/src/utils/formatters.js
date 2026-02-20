import { CURRENCY, SUPPORTED_COUNTRIES } from './constants';

/**
 * Format currency amount with locale-aware formatting
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = CURRENCY.CODE) {
  if (amount === null || amount === undefined) return 'Free';
  if (amount === 0) return 'Free';

  // Find the appropriate locale for this currency
  const country = SUPPORTED_COUNTRIES.find((c) => c.currency === currency);
  const locale = country?.locale || CURRENCY.LOCALE;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "5:30" or "1:05:30")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration in hours to readable string
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted string (e.g., "2 hours" or "30 minutes")
 */
export function formatDurationHours(hours) {
  if (!hours || hours <= 0) return '0 hours';

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (hours === 1) return '1 hour';

  const wholeHours = Math.floor(hours);
  const remainingMinutes = Math.round((hours - wholeHours) * 60);

  if (remainingMinutes === 0) {
    return `${wholeHours} hours`;
  }

  return `${wholeHours}h ${remainingMinutes}m`;
}

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(CURRENCY.LOCALE, defaultOptions).format(dateObj);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }

  return formatDate(dateObj);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to append (default: "...")
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage
 * @param {number} value - Value (0-100)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat(CURRENCY.LOCALE).format(num);
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert role to display text
 * @param {string} role - Role (ADMIN, INSTRUCTOR, STUDENT)
 * @returns {string} Display text
 */
export function formatRole(role) {
  if (!role) return '';
  return capitalize(role);
}

/**
 * Format enrollment status to display text
 * @param {string} status - Status (PENDING, ENROLLED, COMPLETED)
 * @returns {string} Display text
 */
export function formatEnrollmentStatus(status) {
  if (!status) return '';
  return capitalize(status);
}

export default {
  formatCurrency,
  formatDuration,
  formatDurationHours,
  formatDate,
  formatRelativeTime,
  truncateText,
  formatFileSize,
  formatPercentage,
  formatNumber,
  capitalize,
  formatRole,
  formatEnrollmentStatus,
};
