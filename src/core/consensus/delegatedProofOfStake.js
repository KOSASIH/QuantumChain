// src/core/consensus/delegatedProofOfStake.js

const crypto = require('crypto');
const { logger } = require('../logging/logger');

class DelegatedProofOfStake {
    constructor(blockchain) {
        this.blockchain = blockchain; // Reference to the blockchain
        this.delegates = new Map(); // Map to hold delegates and their stakes
        this.electedDelegates = []; // Array to hold elected delegates
        this.delegateCount = 10; // Number of delegates to elect
    }

    // Method to register a delegate with a stake
    registerDelegate(delegateAddress, stake) {
        if (this.delegates.has(delegateAddress)) {
            throw new Error('Delegate already registered');
        }
        this.delegates.set(delegateAddress, stake);
        logger.info(`Delegate registered: ${delegateAddress} with stake: ${stake}`);
    }

    // Method to elect delegates based on their stakes
    electDelegates() {
        const sortedDelegates = Array.from(this.delegates.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by stake in descending order
            .slice(0, this.delegateCount); // Select top delegates

        this.electedDelegates = sortedDelegates.map(entry => entry[0]); // Extract addresses of elected delegates
        logger.info(`Elected delegates: ${this.electedDelegates}`);
    }

    // Method to create a new block using elected delegates
    createBlock(minerAddress) {
        if (!this.electedDelegates.includes(minerAddress)) {
            throw new Error('Only elected delegates can create blocks');
        }

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

    // Method to get the current elected delegates
    getElectedDelegates() {
        return this.electedDelegates;
    }
}

module.exports = { DelegatedProofOfStake };
