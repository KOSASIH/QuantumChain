// src/core/logging/logFormatter.js

const { format } = require('winston');

// Custom log formatting function
const customFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`; // Format: timestamp [level]: message
});

// Export the custom format
module.exports = {
    customFormat,
};
