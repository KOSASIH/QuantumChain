// src/core/consensus/proofOfWork.js

const crypto = require('crypto');
const { logger } = require('../logging/logger');

class ProofOfWork {
    constructor(block, difficulty) {
        this.block = block; // The block to mine
        this.difficulty = difficulty; // Difficulty level for mining
        this.nonce = 0; // Nonce value to be found
        this.mined = false; // Flag to indicate if the block has been mined
    }

    // Method to calculate the hash of the block with the current nonce
    calculateHash() {
        const data = `${this.block.index}${this.block.previousHash}${this.block.timestamp}${JSON.stringify(this.block.transactions)}${this.nonce}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Method to mine the block
    mine() {
        logger.info(`Mining block ${this.block.index}...`);
        while (!this.mined) {
            const hash = this.calculateHash();
            if (this.isHashValid(hash)) {
                this.block.hash = hash; // Set the block's hash
                this.mined = true; // Mark the block as mined
                logger.info(`Block mined: ${this.block.hash} with nonce: ${this.nonce}`);
            } else {
                this.nonce++; // Increment nonce and try again
            }
        }
    }

    // Method to check if the hash meets the difficulty criteria
    isHashValid(hash) {
        const prefix = '0'.repeat(this.difficulty); // Create a string of '0's based on difficulty
        return hash.startsWith(prefix); // Check if the hash starts with the required number of leading zeros
    }
}

module.exports = { ProofOfWork };
