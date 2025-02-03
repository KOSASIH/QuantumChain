// src/core/middleware/errorHandlingMiddleware.js

const { logger } = require('../logging/logger');

function errorHandlingMiddleware(err, req, res, next) {
    logger.error('An error occurred:', err); // Log the error details
    res.status(500).json({ message: 'Internal Server Error' }); // Respond with 500 for internal server errors
}

module.exports = errorHandlingMiddleware;
