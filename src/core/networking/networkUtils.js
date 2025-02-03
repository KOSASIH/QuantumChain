// src/core/networking/networkUtils.js

const dns = require('dns');

/**
 * Validates a given peer address.
 * @param {string} address - The address to validate.
 * @returns {boolean} - True if the address is valid, false otherwise.
 */
function isValidPeerAddress(address) {
    const regex = /^(ws|wss):\/\/[a-zA-Z0-9.-]+:[0-9]+$/; // Regex for validating WebSocket addresses
    return regex.test(address);
}

/**
 * Resolves a hostname to an IP address.
 * @param {string} hostname - The hostname to resolve.
 * @returns {Promise<string>} - A promise that resolves to the IP address.
 */
function resolveHostname(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address) => {
            if (err) {
                reject(err);
            } else {
                resolve(address);
            }
        });
    });
}

/**
 * Generates a unique identifier for a node.
 * @returns {string} - A unique identifier.
 */
function generateNodeId() {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID based on timestamp and random string
}

/**
 * Parses a WebSocket URL and returns the hostname and port.
 * @param {string} url - The WebSocket URL.
 * @returns {Object} - An object containing the hostname and port.
 */
function parseWebSocketUrl(url) {
    const urlPattern = /^(ws|wss):\/\/([^:\/]+)(:\d+)?/; // Regex to parse WebSocket URL
    const match = url.match(urlPattern);
    if (match) {
        return {
            hostname: match[2],
            port: match[3] ? match[3].slice(1) : (match[1] === 'wss' ? '443' : '80'), // Default ports for ws and wss
        };
    }
    throw new Error('Invalid WebSocket URL');
}

/**
 * Formats a peer address for logging or display.
 * @param {string} address - The peer address.
 * @returns {string} - The formatted address.
 */
function formatPeerAddress(address) {
    return address.replace(/^ws(s)?:\/\//, ''); // Remove ws:// or wss:// for cleaner output
}

module.exports = {
    isValidPeerAddress,
    resolveHostname,
    generateNodeId,
    parseWebSocketUrl,
    formatPeerAddress,
};
