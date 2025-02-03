// src/core/blockchain.js

const crypto = require('crypto');
const { EventEmitter } = require('events');
const { logger } = require('./logging/logger');

class Transaction {
    constructor(sender, recipient, amount) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.timestamp = Date.now();
        this.id = this.generateId();
    }

    generateId() {
        return crypto.randomBytes(16).toString('hex');
    }

    validate() {
        // Basic validation logic (e.g., check if sender has enough balance)
        if (!this.sender || !this.recipient || this.amount <= 0) {
            throw new Error('Invalid transaction');
        }
        // Additional validation logic can be added here
    }
}

class Block {
    constructor(previousHash, transactions) {
        this.index = 0; // Block index
        this.timestamp = Date.now(); // Timestamp of block creation
        this.transactions = transactions; // Array of transactions
        this.previousHash = previousHash; // Hash of the previous block
        this.hash = this.calculateHash(); // Hash of the current block
    }

    calculateHash() {
        const data = `${this.index}${this.timestamp}${JSON.stringify(this.transactions)}${this.previousHash}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

class Blockchain {
    constructor() {
        this.chain = []; // Array to hold the blockchain
        this.pendingTransactions = []; // Array to hold transactions before they are added to a block
        this.createGenesisBlock(); // Create the first block in the chain
        this.eventEmitter = new EventEmitter();
    }

    createGenesisBlock() {
        const genesisBlock = new Block('0', []); // Genesis block has no previous hash
        this.chain.push(genesisBlock);
        logger.info('Genesis block created:', genesisBlock);
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1]; // Return the last block in the chain
    }

    addTransaction(transaction) {
        transaction.validate(); // Validate the transaction
        this.pendingTransactions.push(transaction); // Add to pending transactions
        logger.info('Transaction added:', transaction);
    }

    minePendingTransactions(minerAddress) {
        if (this.pendingTransactions.length === 0) {
            throw new Error('No transactions to mine');
        }

        const lastBlock = this.getLastBlock();
        const newBlock = new Block(lastBlock.hash, this.pendingTransactions);
        newBlock.index = this.chain.length; // Set the index of the new block

        this.chain.push(newBlock); // Add the new block to the chain
        logger.info('New block mined:', newBlock);

        // Reset pending transactions
        this.pendingTransactions = [];

        // Emit an event for the new block
        this.eventEmitter.emit('newBlock', newBlock);
    }

    getBlocks() {
        return this.chain; // Return the entire blockchain
    }

    getPendingTransactions() {
        return this.pendingTransactions; // Return pending transactions
    }

    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check if the current block's hash is valid
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false; // Invalid hash
            }

            // Check if the previous block's hash is correct
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false; // Invalid previous hash
            }
        }
        return true; // Chain is valid
    }
}

module.exports = { Blockchain, Transaction };
