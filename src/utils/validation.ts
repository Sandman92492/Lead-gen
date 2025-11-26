/**
 * Form validation utility functions
 * Centralizes validation logic to be reused across multiple modals
 */

export interface ValidationError {
  field: string;
  message: string;
}

// Email validation
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || !email.trim()) {
    return { field: 'email', message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
};

// Required text field
export const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || !value.trim()) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
};

// Password validation
export const validatePassword = (password: string, minLength: number = 6): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < minLength) {
    return { field: 'password', message: `Password must be at least ${minLength} characters` };
  }
  return null;
};

// Password match validation
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationError | null => {
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }
  return null;
};

// PIN validation (4 digits)
export const validatePin = (pin: string): ValidationError | null => {
  if (!pin) {
    return { field: 'pin', message: 'PIN is required' };
  }
  if (pin.length !== 4) {
    return { field: 'pin', message: 'PIN must be 4 digits' };
  }
  if (!/^\d+$/.test(pin)) {
    return { field: 'pin', message: 'PIN must contain only numbers' };
  }
  return null;
};

// Name validation
export const validateName = (name: string): ValidationError | null => {
  if (!name || !name.trim()) {
    return { field: 'name', message: 'Full name is required' };
  }
  if (name.trim().length < 2) {
    return { field: 'name', message: 'Please enter your full name' };
  }
  return null;
};

// Multiple validations - returns first error found
export const validateForm = (_fields: { [key: string]: string }, validators: Array<() => ValidationError | null>): ValidationError | null => {
  for (const validator of validators) {
    const error = validator();
    if (error) return error;
  }
  return null;
};

// Check if all required checkboxes are agreed to
export const validateConsent = (agreedToTerms: boolean, agreedToPrivacy: boolean, agreedToPopia: boolean): ValidationError | null => {
  if (!agreedToTerms || !agreedToPrivacy || !agreedToPopia) {
    return { field: 'consent', message: 'You must agree to all terms and conditions to create an account' };
  }
  return null;
};
