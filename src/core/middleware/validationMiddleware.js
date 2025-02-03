// src/core/middleware/validationMiddleware.js

const { logger } = require('../logging/logger');

function validationMiddleware(req, res, next) {
    const { transaction } = req.body; // Get the transaction data from the request body

    // Basic validation logic (e.g., check if required fields are present)
    if (!transaction || !transaction.sender || !transaction.recipient || !transaction.amount) {
        logger.warn('Invalid transaction data');
        return res.status(400).json({ message: 'Invalid transaction data' }); // Respond with 400 if validation fails
    }

    next(); // Call the next middleware or route handler
}

module.exports = validationMiddleware;
