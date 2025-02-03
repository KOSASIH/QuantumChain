// src/core/consensus/proofOfStake.js

const crypto = require('crypto');
const { logger } = require('../logging/logger');

class ProofOfStake {
    constructor(blockchain) {
        this.blockchain = blockchain; // Reference to the blockchain
    }

    // Method to create a new block using Proof of Stake
    createBlock(minerAddress) {
        const lastBlock = this.blockchain.getLastBlock();
        const newBlock = {
            index: lastBlock.index + 1,
            previousHash: lastBlock.hash,
            timestamp: Date.now(),
            transactions: this.blockchain.pendingTransactions,
            miner: minerAddress,
            hash: '',
        };

        // Calculate the block's hash
        newBlock.hash = this.calculateHash(newBlock);
        this.blockchain.chain.push(newBlock); // Add the new block to the blockchain
        this.blockchain.pendingTransactions = []; // Reset pending transactions

        logger.info(`Block ${newBlock.index} created by ${minerAddress}: ${newBlock.hash}`);
        return newBlock;
    }

    // Method to calculate the hash of a block
    calculateHash(block) {
        const data = `${block.index}${block.previousHash}${block.timestamp}${JSON.stringify(block.transactions)}${block.miner}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Method to validate if a user can create a block based on their stake
    canCreateBlock(minerAddress) {
        const stake = this.getStake(minerAddress);
        const totalStake = this.getTotalStake();

        // Probability of being selected to create a block is proportional to the stake
        const probability = stake / totalStake;
        const randomValue = Math.random();

        return randomValue < probability; // Return true if selected
    }

    // Method to get the stake of a user (this should be implemented based on your staking logic)
    getStake(minerAddress) {
        // Placeholder: Replace with actual logic to retrieve the user's stake
        // For example, this could query a database or a smart contract
        return Math.random() * 100; // Random stake for demonstration
    }

    // Method to get the total stake in the network (this should be implemented based on your staking logic)
    getTotalStake() {
        // Placeholder: Replace with actual logic to calculate total stake
        return 1000; // Fixed total stake for demonstration
    }
}

module.exports = { ProofOfStake };
