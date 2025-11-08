import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @param {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to VND
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format date to Vietnamese locale
 * @param {Date|string} date - Date to format
 * @param {string} format - Format style: 'short' | 'long' | 'full'
 * @returns {string} Formatted date
 */
export function formatDate(date, format = "short") {
  const options = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    long: { year: "numeric", month: "long", day: "numeric" },
    full: {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    },
  };

  return new Date(date).toLocaleDateString("vi-VN", options[format]);
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
