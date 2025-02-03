// src/core/index.js

// Import necessary modules and libraries
const express = require('express');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Blockchain } = require('./blockchain');
const { EventEmitter } = require('events');
const { config } = require('./configuration/config');
const { logger } = require('./logging/logger');
const { initializeServices } = require('../services/apiService');
const { initializeMiddleware } = require('./middleware');
const { connectToDatabase } = require('./database');
const { setupWebSocket } = require('./networking/p2p');

// Initialize the application
const app = express();
const server = createServer(app);
const io = new Server(server);
const eventEmitter = new EventEmitter();

// Middleware setup
app.use(bodyParser.json());
initializeMiddleware(app);

// Initialize the blockchain
const blockchain = new Blockchain();

// Connect to the database
connectToDatabase()
    .then(() => logger.info('Database connected successfully'))
    .catch(err => logger.error('Database connection failed:', err));

// Initialize services
initializeServices(app, blockchain, eventEmitter);

// Setup WebSocket for real-time communication
setupWebSocket(io, eventEmitter);

// Event listeners for blockchain events
eventEmitter.on('newBlock', (block) => {
    logger.info(`New block added: ${block.hash}`);
    io.emit('blockAdded', block);
});

eventEmitter.on('transactionConfirmed', (transaction) => {
    logger.info(`Transaction confirmed: ${transaction.id}`);
    io.emit('transactionConfirmed', transaction);
});

// API Routes
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.getBlocks());
});

app.get('/api/transactions', (req, res) => {
    res.json(blockchain.getPendingTransactions());
});

app.post('/api/transactions', (req, res) => {
    const transaction = req.body;
    blockchain.addTransaction(transaction);
    res.status(201).json({ message: 'Transaction added', transaction });
});

// Start the server
const PORT = config.port || 3000;
server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down server...');
    server.close(() => {
        logger.info('Server shut down gracefully');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});
