// src/core/networking/p2p.js

const WebSocket = require('ws');
const { logger } = require('../logging/logger');

class P2PNetwork {
    constructor(port, blockchain) {
        this.port = port; // Port for the WebSocket server
        this.blockchain = blockchain; // Reference to the blockchain
        this.sockets = []; // Array to hold connected peers
        this.server = new WebSocket.Server({ port: this.port }); // Create WebSocket server

        this.server.on('connection', (socket) => this.handleConnection(socket)); // Handle new connections
        logger.info(`P2P server started on port ${this.port}`);
    }

    // Method to handle new connections
    handleConnection(socket) {
        this.sockets.push(socket); // Add the new socket to the list of peers
        logger.info('New peer connected');

        // Handle incoming messages
        socket.on('message', (message) => this.handleMessage(message, socket));

        // Handle socket closure
        socket.on('close', () => {
            this.sockets = this.sockets.filter(s => s !== socket); // Remove the socket from the list
            logger.info('Peer disconnected');
        });
    }

    // Method to handle incoming messages
    handleMessage(message, socket) {
        const data = JSON.parse(message); // Parse the incoming message

        switch (data.type) {
            case 'transaction':
                this.handleTransaction(data.transaction);
                break;
            case 'block':
                this.handleBlock(data.block);
                break;
            case 'requestChain':
                this.sendChain(socket);
                break;
            case 'responseChain':
                this.handleChainResponse(data.chain);
                break;
            default:
                logger.warn('Unknown message type:', data.type);
        }
    }

    // Method to handle new transactions
    handleTransaction(transaction) {
        this.blockchain.addTransaction(transaction); // Add transaction to the blockchain
        this.broadcastTransaction(transaction); // Broadcast the transaction to all peers
        logger.info('Transaction received and broadcasted:', transaction);
    }

    // Method to handle new blocks
    handleBlock(block) {
        if (this.blockchain.validateBlock(block, this.blockchain.getLastBlock())) {
            this.blockchain.chain.push(block); // Add the block to the blockchain
            this.blockchain.pendingTransactions = []; // Reset pending transactions
            this.broadcastBlock(block); // Broadcast the new block to all peers
            logger.info('Block received and added to the blockchain:', block);
        } else {
            logger.warn('Invalid block received:', block);
        }
    }

    // Method to broadcast a transaction to all peers
    broadcastTransaction(transaction) {
        const message = JSON.stringify({ type: 'transaction', transaction });
        this.sockets.forEach(socket => socket.send(message)); // Send the message to all connected peers
    }

    // Method to broadcast a block to all peers
    broadcastBlock(block) {
        const message = JSON.stringify({ type: 'block', block });
        this.sockets.forEach(socket => socket.send(message)); // Send the message to all connected peers
    }

    // Method to send the entire blockchain to a peer
    sendChain(socket) {
        const message = JSON.stringify({ type: 'responseChain', chain: this.blockchain.chain });
        socket.send(message); // Send the blockchain to the requesting peer
    }

    // Method to handle a chain response from a peer
    handleChainResponse(chain) {
        // Logic to handle the received chain (e.g., validate and update the local chain)
        if (chain.length > this.blockchain.chain.length) {
            logger.info('Received longer chain, updating local chain...');
            this.blockchain.chain = chain; // Update the local chain with the received chain
        } else {
            logger.warn('Received chain is not longer than the local chain, ignoring...');
        }
    }

    // Method to connect to another peer
    connectToPeer(peerAddress) {
        const socket = new WebSocket(peerAddress); // Create a new WebSocket connection

        socket.on('open', () => {
            this.sockets.push(socket); // Add the new socket to the list of peers
            logger.info(`Connected to peer: ${peerAddress}`);
            this.sendChain(socket); // Request the blockchain from the new peer
        });

        socket.on('message', (message) => this.handleMessage(message, socket)); // Handle incoming messages
    }
}

module.exports = { P2PNetwork };
