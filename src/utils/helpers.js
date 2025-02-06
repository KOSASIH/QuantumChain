// utils/helpers.js

const crypto = require('crypto');

/**
 * Generate a SHA-256 hash of the input data.
 * @param {string|object} data - The data to hash.
 * @returns {string} - The resulting hash.
 */
function generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

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
 * Format a date to a readable string.
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
function formatDate(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Log an error message to the console.
 * @param {string} message - The error message to log.
 * @param {object} [details] - Optional additional details about the error.
 */
function logError(message, details) {
    console.error(`Error: ${message}`);
    if (details) {
        console.error('Details:', details);
    }
}

/**
 * Generate a unique identifier (UUID).
 * @returns {string} - A UUID string.
 */
function generateUUID() {
    return crypto.randomUUID();
}

/**
 * Deep clone an object.
 * @param {object} obj - The object to clone.
 * @returns {object} - The cloned object.
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    generateHash,
    isValidEmail,
    validateRequiredField,
    formatDate,
    logError,
    generateUUID,
    deepClone,
};
