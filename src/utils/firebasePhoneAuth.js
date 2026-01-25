// Firebase Phone Authentication utilities
import { auth } from '../firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';

/**
 * Initialize reCAPTCHA verifier
 * @param {string} containerId - ID of the container element for reCAPTCHA
 * @returns {RecaptchaVerifier}
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  // Clear any existing recaptcha
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      console.log('reCAPTCHA expired');
    }
  });

  return window.recaptchaVerifier;
}

/**
 * Send verification code to phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @returns {Promise<ConfirmationResult>}
 */
export async function sendVerificationCode(phoneNumber) {
  try {
    // Ensure phone number is in E.164 format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const appVerifier = window.recaptchaVerifier || setupRecaptcha();
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    // Save confirmation result for later verification
    window.confirmationResult = confirmationResult;
    
    return confirmationResult;
  } catch (error) {
    console.error('Error sending verification code:', error);
    
    // Clear recaptcha on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    throw error;
  }
}

/**
 * Verify the code entered by user
 * @param {string} code - 6-digit verification code
 * @returns {Promise<UserCredential>}
 */
export async function verifyCode(code) {
  try {
    if (!window.confirmationResult) {
      throw new Error('No confirmation result found. Please request a new code.');
    }
    
    const result = await window.confirmationResult.confirm(code);
    return result;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

/**
 * Resend verification code
 * @param {string} phoneNumber - Phone number in E.164 format
 * @returns {Promise<ConfirmationResult>}
 */
export async function resendVerificationCode(phoneNumber) {
  // Clear previous recaptcha
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  
  // Clear previous confirmation result
  window.confirmationResult = null;
  
  // Send new code
  return sendVerificationCode(phoneNumber);
}

/**
 * Clean up Firebase auth state
 */
export function cleanupFirebaseAuth() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.confirmationResult = null;
}

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - Raw phone number
 * @param {string} countryCode - Country code (default: '1' for US)
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber, countryCode = '1') {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If already starts with country code, return with +
  if (digits.length > 10 && digits.startsWith(countryCode)) {
    return `+${digits}`;
  }
  
  // Add country code
  return `+${countryCode}${digits}`;
}

/**
 * Get Firebase ID token for backend verification
 * @returns {Promise<string>}
 */
export async function getFirebaseToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return user.getIdToken();
}
