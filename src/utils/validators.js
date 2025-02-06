// utils/validators.js

/**
 * Validate an email address format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate a password based on specific criteria.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidPassword(password) {
    // Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

/**
 * Validate a required field.
 * @param {any} field - The field to validate.
 * @param {string} fieldName - The name of the field for error messages.
 * @throws Will throw an error if the field is invalid.
 */
function validateRequiredField(field, fieldName) {
    if (!field) {
        throw new Error(`${fieldName} is required.`);
    }
}

/**
 * Validate a numeric value.
 * @param {number} value - The value to validate.
 * @param {string} fieldName - The name of the field for error messages.
 * @throws Will throw an error if the value is not a valid number.
 */
function validateNumeric(value, fieldName) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${fieldName} must be a valid number.`);
    }
}

/**
 * Validate a string length.
 * @param {string} str - The string to validate.
 * @param {number} minLength - The minimum length.
 * @param {number} maxLength - The maximum length.
 * @param {string} fieldName - The name of the field for error messages.
 * @throws Will throw an error if the string length is invalid.
 */
function validateStringLength(str, minLength, maxLength, fieldName) {
    if (typeof str !== 'string' || str.length < minLength || str.length > maxLength) {
        throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters long.`);
    }
}

/**
 * Validate a URL format.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidURL(url) {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;
    return regex.test(url);
}

/**
 * Validate a phone number format.
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidPhoneNumber(phone) {
    const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return regex.test(phone);
}

module.exports = {
    isValidEmail,
    isValidPassword,
    validateRequiredField,
    validateNumeric,
    validateStringLength,
    isValidURL,
    isValidPhoneNumber,
};
