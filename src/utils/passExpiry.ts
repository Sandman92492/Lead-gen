/**
 * Check if a pass is expired based on its expiryDate
 */
export const isPassExpired = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  return now > expiry;
};

/**
 * Get days remaining until expiry
 * Returns negative number if expired
 */
export const getDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get expiry status message
 */
export const getExpiryStatus = (expiryDate: string): string => {
  const daysRemaining = getDaysRemaining(expiryDate);
  
  if (daysRemaining < 0) {
    return 'Expired';
  } else if (daysRemaining === 0) {
    return 'Expires today';
  } else if (daysRemaining === 1) {
    return 'Expires tomorrow';
  } else if (daysRemaining <= 7) {
    return `${daysRemaining} days remaining`;
  } else if (daysRemaining <= 30) {
    return `${daysRemaining} days remaining`;
  } else {
    return `${Math.floor(daysRemaining / 7)} weeks remaining`;
  }
};
