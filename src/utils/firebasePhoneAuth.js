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
  // Check if already initialized
  if (window.recaptchaVerifier) {
    console.log('♻️ reCAPTCHA already initialized, reusing...');
    return window.recaptchaVerifier;
  }

  // Check if container exists
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ reCAPTCHA container not found:', containerId);
    throw new Error('reCAPTCHA container not found');
  }

  // Clear container content if it has any
  container.innerHTML = '';

  console.log('🔧 Initializing new reCAPTCHA...');
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('✅ reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      console.log('⏰ reCAPTCHA expired');
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
    console.log('📱 Sending SMS to:', formattedPhone);
    
    // Ensure reCAPTCHA is set up
    let appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      console.log('⚠️ reCAPTCHA not found, initializing...');
      appVerifier = setupRecaptcha();
    }
    
    console.log('🔐 reCAPTCHA ready, requesting Firebase SMS...');
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    // Save confirmation result for later verification
    window.confirmationResult = confirmationResult;
    console.log('✅ SMS sent! Confirmation result saved to window object');
    
    return confirmationResult;
  } catch (error) {
    console.error('❌ Error sending verification code:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
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
      console.error('❌ No confirmation result found in window object');
      throw new Error('No confirmation result found. Please request a new code by clicking "Resend".');
    }
    
    console.log('🔍 Verifying code:', code);
    const result = await window.confirmationResult.confirm(code);
    console.log('✅ Code verified successfully');
    
    return result;
  } catch (error) {
    console.error('❌ Error verifying code:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid verification code. Please check and try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Verification code expired. Please request a new code.');
    } else if (error.message.includes('No confirmation result')) {
      throw error; // Re-throw our custom error
    }
    
    throw new Error(error.message || 'Verification failed. Please try again.');
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
 * This token proves the user has been authenticated by Firebase
 * @returns {Promise<string>}
 */
export async function getFirebaseIdToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  
  // Get fresh ID token (force refresh to ensure it's valid)
  const idToken = await user.getIdToken(true);
  return idToken;
}
