// src/core/logging/logger.js

const winston = require('winston');
const { format } = require('winston');
const logFormatter = require('./logFormatter');

// Create a logger instance
const logger = winston.createLogger({
    level: 'info', // Default log level
    format: format.combine(
        format.timestamp(), // Add timestamp to logs
        format.json(), // Log in JSON format
        logFormatter.customFormat // Use custom log formatting
    ),
    transports: [
        new winston.transports.Console(), // Log to console
        new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file
        new winston.transports.File({ filename: 'combined.log' }) // Log all messages to a file
    ],
});

// Export the logger instance
module.exports = logger;
