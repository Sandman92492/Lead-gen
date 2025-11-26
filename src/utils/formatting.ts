/**
 * Formatting utilities for common text transformations
 */

/**
 * Highlight price amounts in text with bold styling
 * Replaces R199 with styled HTML span
 * @param text - The text to format
 * @returns Object with __html property for dangerouslySetInnerHTML
 */
export const highlightPrices = (text: string) => {
  const html = text
    .replace(/R199/g, '<span class="font-bold text-urgency-high">R199</span>');
  return { __html: html };
};

/**
 * Format a number as South African currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "R249.99")
 */
export const formatCurrency = (amount: number): string => {
  return `R${amount.toFixed(2)}`;
};

/**
 * Truncate text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter of a string
 * @param text - The text to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format date as readable string
 * @param date - The date to format
 * @param format - Format type: 'short' (Dec 25) or 'long' (December 25, 2024)
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  }
  
  return dateObj.toLocaleDateString('en-ZA', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
