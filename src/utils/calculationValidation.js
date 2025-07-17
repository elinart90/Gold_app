// src/utils/validation.js
export const validateInput = (value, fieldName) => {
  if (value === '' || value === null || value === undefined) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  
  if (isNaN(value)) {
    throw new Error(`${fieldName} must be a number`);
  }
  
  if (parseFloat(value) <= 0) {
    throw new Error(`${fieldName} must be greater than zero`);
  }
};

// Alternative version with more specific validation:
/*
export const validateInput = (value, fieldName) => {
  // Check if empty
  if (!value && value !== 0) {
    throw new Error(`Please enter a ${fieldName}`);
  }
  
  // Convert to number
  const numValue = Number(value);
  
  // Check if valid number
  if (isNaN(numValue)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  // Check if positive
  if (numValue <= 0) {
    throw new Error(`${fieldName} must be greater than zero`);
  }
  
  // Check if reasonable value for gold (optional)
  if (fieldName === "Weight" && numValue > 10000) {
    throw new Error(`Weight seems too large. Please check your value`);
  }
  
  if (fieldName === "Price" && numValue > 100000) {
    throw new Error(`Price seems too high. Please check your value`);
  }
};
*/