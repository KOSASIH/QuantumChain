// utils/rateLimiter.js

const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiting middleware.
 * @param {number} windowMs - The time frame for which requests are checked (in milliseconds).
 * @param {number} max - The maximum number of requests allowed within the time frame.
 * @param {string} message - The message to return when the limit is exceeded.
 * @returns {function} - The rate limiting middleware function.
 */
function createRateLimiter(windowMs, max, message) {
    return rateLimit({
        windowMs, // Time frame for the rate limit
        max, // Maximum number of requests allowed
        message: message || 'Too many requests, please try again later.', // Custom message
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
}

module.exports = {
    createRateLimiter,
};
