/**
 * Returns user-friendly error messages for Firebase errors
 * @param {Error} error - The Firebase error object
 * @returns {string} User-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  // Handle cases where error might not be a proper Firebase error
  if (!error || !error.code) {
    console.error('Unknown error:', error);
    return 'An unexpected error occurred. Please try again.';
  }

  // Map of error codes to user-friendly messages
  const errorMessages = {
    // Authentication Errors
    'auth/email-already-in-use': 'This email is already registered. Please use another email or log in.',
    'auth/invalid-email': 'Please enter a valid email address (e.g., yourname@example.com).',
    'auth/weak-password': 'Password must be at least 6 characters long and include a mix of letters and numbers.',
    'auth/operation-not-allowed': 'Email/password authentication is currently disabled.',
    'auth/user-disabled': 'Your account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/too-many-requests': 'Too many login attempts. Please try again in a few minutes.',
    'auth/account-exists-with-different-credential': 'This email is already associated with another sign-in method. Try signing in with Google or another provider.',
    'auth/requires-recent-login': 'For security, please log in again to perform this action.',
    'auth/provider-already-linked': 'This account is already linked to another provider.',
    'auth/credential-already-in-use': 'These credentials are already associated with another account.',
    
    // Network/System Errors
    'auth/network-request-failed': 'Network connection failed. Please check your internet and try again.',
    'auth/internal-error': 'A system error occurred. Please try again later.',
    'auth/invalid-api-key': 'Application configuration error. Please contact support.',
    'auth/app-not-authorized': 'Application not authorized to use Firebase Authentication.',
    
    // Email/Verification Errors
    'auth/invalid-verification-code': 'The verification code is invalid or expired.',
    'auth/invalid-verification-id': 'Verification session expired. Please try again.',
    'auth/expired-action-code': 'The action link has expired. Please request a new one.',
    'auth/invalid-action-code': 'The action link is invalid. Please request a new one.',
    
    // Other Common Errors
    'auth/invalid-credential': 'Your login credentials are invalid or expired.',
    'auth/invalid-user-token': 'Your session has expired. Please log in again.',
    'auth/user-token-expired': 'Your session has expired. Please log in again.',
    'auth/web-storage-unsupported': 'Your browser settings prevent us from storing login data. Please check your browser settings or try another browser.'
  };

  // Return specific message if available, otherwise default message
  return errorMessages[error.code] || 
         error.message || 
         'An unexpected error occurred. Please try again.';
};

/**
 * Checks if the error is a Firebase auth error that should trigger a logout
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error indicates an invalid session
 */
export const shouldLogoutOnError = (error) => {
  const logoutErrorCodes = [
    'auth/invalid-user-token',
    'auth/user-token-expired',
    'auth/user-disabled',
    'auth/requires-recent-login'
  ];
  
  return error && error.code && logoutErrorCodes.includes(error.code);
};