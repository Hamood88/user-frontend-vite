// Form validation utilities for Moondala authentication

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone.trim()) return null; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
  if (phone.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
  return null;
};

export const validateAge = (day: string, month: string, year: string): string | null => {
  if (!day || !month || !year) return null; // Optional field
  
  const birthDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 13) return 'You must be at least 13 years old';
  if (age > 120) return 'Please enter a valid date of birth';
  
  return null;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
