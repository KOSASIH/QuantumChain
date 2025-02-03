// src/core/consensus/consensusUtils.js

const crypto = require('crypto');

/**
 * Generates a SHA-256 hash of the given data.
 * @param {string} data - The data to hash.
 * @returns {string} - The resulting hash.
 */
function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validates a block by checking its structure and previous hash.
 * @param {Object} block - The block to validate.
 * @param {Object} lastBlock - The last block in the blockchain.
 * @returns {boolean} - True if the block is valid, false otherwise.
 */
function validateBlock(block, lastBlock) {
    if (block.previousHash !== lastBlock.hash) {
        console.error('Invalid previous hash');
        return false;
    }
    if (!block.hash || block.hash !== generateHash(`${block.index}${block.previousHash}${block.timestamp}${JSON.stringify(block.transactions)}`)) {
        console.error('Invalid block hash');
        return false;
    }
    return true;
}

/**
 * Calculates the quorum size based on the number of validators.
 * @param {number} totalValidators - The total number of validators.
 * @returns {number} - The quorum size.
 */
function calculateQuorum(totalValidators) {
    return Math.ceil(totalValidators / 2); // Quorum is more than half of the validators
}

/**
 * Checks if a given address is a valid validator.
 * @param {string} address - The address to check.
 * @param {Array} validators - The list of registered validators.
 * @returns {boolean} - True if the address is a valid validator, false otherwise.
 */
function isValidValidator(address, validators) {
    return validators.includes(address);
}

/**
 * Generates a unique identifier for a transaction or block.
 * @returns {string} - A unique identifier.
 */
function generateUniqueId() {
    return crypto.randomBytes(16).toString('hex'); // Generate a random 16-byte hex string
}

module.exports = {
    generateHash,
    validateBlock,
    calculateQuorum,
    isValidValidator,
    generateUniqueId,
};
