// src/core/networking/discovery.js

const dgram = require('dgram');
const { logger } = require('../logging/logger');

class NodeDiscovery {
    constructor(port, broadcastInterval) {
        this.port = port; // Port for the discovery service
        this.broadcastInterval = broadcastInterval; // Interval for broadcasting discovery messages
        this.nodes = new Set(); // Set to hold discovered nodes
        this.socket = dgram.createSocket('udp4'); // Create a UDP socket

        this.socket.on('message', (msg, rinfo) => this.handleMessage(msg, rinfo)); // Handle incoming messages
        this.socket.bind(this.port, () => {
            logger.info(`Node discovery service started on port ${this.port}`);
            this.startBroadcast(); // Start broadcasting discovery messages
        });
    }

    // Method to start broadcasting discovery messages
    startBroadcast() {
        setInterval(() => {
            const message = Buffer.from('DISCOVER_NODE'); // Discovery message
            this.socket.send(message, 0, message.length, this.port, '255.255.255.255', (err) => {
                if (err) {
                    logger.error('Error sending discovery message:', err);
                } else {
                    logger.info('Broadcasting discovery message');
                }
            });
        }, this.broadcastInterval);
    }

    // Method to handle incoming discovery messages
    handleMessage(msg, rinfo) {
        if (msg.toString() === 'DISCOVER_NODE') {
            logger.info(`Discovery message received from ${rinfo.address}:${rinfo.port}`);
            this.nodes.add(`${rinfo.address}:${rinfo.port}`); // Add the discovered node to the set
            this.sendResponse(rinfo.address, rinfo.port); // Send a response back to the sender
        }
    }

    // Method to send a response to a discovered node
    sendResponse(address, port) {
        const responseMessage = Buffer.from('NODE_RESPONSE'); // Response message
        this.socket.send(responseMessage, 0, responseMessage.length, port, address, (err) => {
            if (err) {
                logger.error('Error sending response message:', err);
            } else {
                logger.info(`Response sent to ${address}:${port}`);
            }
        });
    }

    // Method to get the list of discovered nodes
    getDiscoveredNodes() {
        return Array.from(this.nodes); // Return the discovered nodes as an array
    }
}

module.exports = { NodeDiscovery };
