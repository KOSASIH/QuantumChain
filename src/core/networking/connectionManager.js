// src/core/networking/connectionManager.js

const WebSocket = require('ws');
const { logger } = require('../logging/logger');

class ConnectionManager {
    constructor() {
        this.peers = new Set(); // Set to hold connected peers
    }

    // Method to add a new peer connection
    addPeer(peerAddress) {
        if (this.peers.has(peerAddress)) {
            logger.warn(`Peer ${peerAddress} is already connected.`);
            return;
        }

        const socket = new WebSocket(peerAddress); // Create a new WebSocket connection

        socket.on('open', () => {
            this.peers.add(peerAddress); // Add the peer to the set of connected peers
            logger.info(`Connected to peer: ${peerAddress}`);
            this.requestChain(socket); // Request the blockchain from the new peer
        });

        socket.on('message', (message) => this.handleMessage(message, socket)); // Handle incoming messages

        socket.on('close', () => {
            this.peers.delete(peerAddress); // Remove the peer from the set on disconnection
            logger.info(`Disconnected from peer: ${peerAddress}`);
        });

        socket.on('error', (error) => {
            logger.error(`Connection error with peer ${peerAddress}:`, error);
        });
    }

    // Method to handle incoming messages from peers
    handleMessage(message, socket) {
        const data = JSON.parse(message); // Parse the incoming message

        switch (data.type) {
            case 'transaction':
                this.handleTransaction(data.transaction);
                break;
            case 'block':
                this.handleBlock(data.block);
                break;
            case 'responseChain':
                this.handleChainResponse(data.chain);
                break;
            default:
                logger.warn('Unknown message type:', data.type);
        }
    }

    // Method to handle a new transaction
    handleTransaction(transaction) {
        // Logic to handle the transaction (e.g., add to the local blockchain)
        logger.info('Transaction received:', transaction);
    }

    // Method to handle a new block
    handleBlock(block) {
        // Logic to handle the block (e.g., validate and add to the local blockchain)
        logger.info('Block received:', block);
    }

    // Method to request the blockchain from a peer
    requestChain(socket) {
        const message = JSON.stringify({ type: 'requestChain' }); // Create a request message
        socket.send(message); // Send the request to the peer
        logger.info(`Requested blockchain from peer: ${socket.url}`);
    }

    // Method to get the list of connected peers
    getConnectedPeers() {
        return Array.from(this.peers); // Return the connected peers as an array
    }
}

module.exports = { ConnectionManager };
