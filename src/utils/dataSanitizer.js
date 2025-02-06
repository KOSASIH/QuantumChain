// utils/dataSanitizer.js

const validator = require('validator');

/**
 * Sanitize a string by trimming whitespace and escaping HTML.
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitizeString(str) {
    return validator.escape(validator.trim(str));
}

/**
 * Sanitize an email address.
 * @param {string} email - The email address to sanitize.
 * @returns {string|null} - The sanitized email or null if invalid.
 */
function sanitizeEmail(email) {
    if (validator.isEmail(email)) {
        return sanitizeString(email);
    }
    return null; // Return null if the email is invalid
}

/**
 * Sanitize a URL.
 * @param {string} url - The URL to sanitize.
 * @returns {string|null} - The sanitized URL or null if invalid.
 */
function sanitizeURL(url) {
    if (validator.isURL(url, { require_protocol: true })) {
        return sanitizeString(url);
    }
    return null; // Return null if the URL is invalid
}

/**
 * Sanitize a phone number.
 * @param {string} phone - The phone number to sanitize.
 * @returns {string|null} - The sanitized phone number or null if invalid.
 */
function sanitizePhoneNumber(phone) {
    const cleaned = ('' + phone).replace(/\D/g, ''); // Remove non-digit characters
    if (validator.isMobilePhone(cleaned, 'any', { strict: false })) {
        return cleaned; // Return cleaned phone number if valid
    }
    return null; // Return null if invalid
}

/**
 * Sanitize an array of strings.
 * @param {Array<string>} arr - The array of strings to sanitize.
 * @returns {Array<string>} - The array of sanitized strings.
 */
function sanitizeArray(arr) {
    return arr.map(item => sanitizeString(item));
}

/**
 * Sanitize an object by sanitizing all string properties.
 * @param {object} obj - The object to sanitize.
 * @returns {object} - The sanitized object.
 */
function sanitizeObject(obj) {
    const sanitizedObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitizedObj[key] = sanitizeString(obj[key]);
        } else if (Array.isArray(obj[key])) {
            sanitizedObj[key] = sanitizeArray(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizedObj[key] = sanitizeObject(obj[key]);
        } else {
            sanitizedObj[key] = obj[key]; // Keep non-string properties unchanged
        }
    }
    return sanitizedObj;
}

module.exports = {
    sanitizeString,
    sanitizeEmail,
    sanitizeURL,
    sanitizePhoneNumber,
    sanitizeArray,
    sanitizeObject,
};
