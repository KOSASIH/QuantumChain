// src/core/middleware/loggingMiddleware.js

const { logger } = require('../logging/logger');

function loggingMiddleware(req, res, next) {
    const { method, url } = req; // Get the request method and URL
    logger.info(`Incoming request: ${method} ${url}`); // Log the request details
    next(); // Call the next middleware or route handler
}

module.exports = loggingMiddleware;
