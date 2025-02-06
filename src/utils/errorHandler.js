// utils/errorHandler.js

/**
 * Custom error class for handling application errors.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Indicates if the error is operational
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Middleware for handling errors.
 * @param {Error} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
    // Set default values for error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error (you can integrate with a logging service here)
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
    });

    // Send error response to the client
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

/**
 * Function to create an operational error.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 * @returns {AppError} - The created AppError instance.
 */
const createOperationalError = (message, statusCode) => {
    return new AppError(message, statusCode);
};

module.exports = {
    errorHandler,
    createOperationalError,
    AppError,
};
