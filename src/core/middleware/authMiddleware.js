// src/core/middleware/authMiddleware.js

const { logger } = require('../logging/logger');

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']; // Get the token from the request headers

    if (!token) {
        logger.warn('Authorization token is missing');
        return res.status(401).json({ message: 'Unauthorized' }); // Respond with 401 if token is missing
    }

    // Here you would typically verify the token (e.g., using JWT)
    // For demonstration, we'll assume the token is valid
    req.user = { id: 'user-id' }; // Attach user information to the request object
    next(); // Call the next middleware or route handler
}

module.exports = authMiddleware;
