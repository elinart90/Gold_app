// Password requirements configuration
export const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;\':",./<>?`~',
  maxLength: 64, // Added maximum length for security
  maxConsecutiveChars: 3 // Prevent simple patterns like "aaa"
};

// Common regex patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-()]{8,20}$/,
  name: /^[\p{L}\s\-']+$/u, // Unicode-aware for international names
  agentName: /^[\p{L}\d\s\-']+$/u, // Allows letters, numbers, and basic punctuation
  passwordSpecialChars: /[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?`~]/
};

// Validation functions
export const validateEmail = (email) => {
  return patterns.email.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`);
  }
  
  if (password.length > passwordRequirements.maxLength) {
    errors.push(`Password must be less than ${passwordRequirements.maxLength} characters`);
  }
  
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (passwordRequirements.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (passwordRequirements.requireSpecialChar && 
      !patterns.passwordSpecialChars.test(password)) {
    errors.push(`Password must contain at least one special character (${passwordRequirements.specialChars})`);
  }
  
  // Check for consecutive repeating characters
  if (passwordRequirements.maxConsecutiveChars) {
    const consecutiveRegex = new RegExp(`(.)\\1{${passwordRequirements.maxConsecutiveChars - 1},}`);
    if (consecutiveRegex.test(password)) {
      errors.push(`Password cannot contain ${passwordRequirements.maxConsecutiveChars} or more identical characters in a row`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 8 && digitsOnly.length <= 15 && patterns.phone.test(phone);
};

export const validateName = (name) => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && patterns.name.test(trimmed);
};

export const validateAddress = (address) => {
  if (!address) return false;
  // Basic address validation - should contain at least a number and some text
  return address.trim().length >= 5 && /\d/.test(address) && /[a-zA-Z]/.test(address);
};

export const validateAgentName = (name) => {
  // Optional field, but if provided should be valid
  if (!name || name.trim() === '') return true;
  return name.trim().length >= 2 && patterns.agentName.test(name);
};

export const validateForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  // Validate full name
  if (!validateName(formData.fullName)) {
    errors.fullName = 'Please enter a valid full name (at least 2 characters, letters and spaces only)';
    isValid = false;
  }
  
  // Validate email
  if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address (e.g., yourname@example.com)';
    isValid = false;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors.length === 1 
      ? passwordValidation.errors[0]
      : passwordValidation.errors;
    isValid = false;
  }
  
  // Validate password confirmation
  if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match';
    isValid = false;
  }
  
  // Validate address
  if (!validateAddress(formData.address)) {
    errors.address = 'Please enter a valid address (must contain street number and name)';
    isValid = false;
  }
  
  // Validate phone number
  if (!validatePhone(formData.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number (8-15 digits, international format accepted)';
    isValid = false;
  }
  
  // Validate agent name (optional)
  if (!validateAgentName(formData.agentName)) {
    errors.agentName = 'Agent name can only contain letters, numbers, spaces, and basic punctuation (2 characters minimum)';
    isValid = false;
  }
  
  return {
    isValid,
    errors
  };
};

// Helper function to validate individual fields dynamically
export const validateField = (fieldName, value, formData = {}) => {
  switch (fieldName) {
    case 'fullName':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value).isValid;
    case 'passwordConfirm':
      return value === formData.password;
    case 'address':
      return validateAddress(value);
    case 'phoneNumber':
      return validatePhone(value);
    case 'agentName':
      return validateAgentName(value);
    default:
      return true;
  }
};