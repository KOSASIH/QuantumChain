// src/core/consensus/ByzantineFaultTolerance.js

const { logger } = require('../logging/logger');

class ByzantineFaultTolerance {
    constructor(blockchain, validators) {
        this.blockchain = blockchain; // Reference to the blockchain
        this.validators = validators; // List of validator nodes
        this.quorum = Math.ceil(validators.length / 2); // Quorum size for consensus
    }

    // Method to propose a new block
    proposeBlock(newBlock) {
        logger.info(`Proposing block: ${newBlock.hash}`);
        const votes = this.collectVotes(newBlock);
        if (this.isConsensusReached(votes)) {
            this.blockchain.chain.push(newBlock); // Add the new block to the blockchain
            this.blockchain.pendingTransactions = []; // Reset pending transactions
            logger.info(`Block ${newBlock.index} added to the blockchain: ${newBlock.hash}`);
            return newBlock;
        } else {
            logger.warn(`Consensus not reached for block: ${newBlock.hash}`);
            throw new Error('Consensus not reached');
        }
    }

    // Method to collect votes from validators
    collectVotes(newBlock) {
        const votes = {};
        this.validators.forEach(validator => {
            const vote = this.requestVote(validator, newBlock);
            votes[validator] = vote;
        });
        return votes;
    }

    // Method to request a vote from a validator
    requestVote(validator, newBlock) {
        // Simulate a voting process (in a real implementation, this would involve network communication)
        const isValid = this.validateBlock(newBlock);
        return isValid ? 'yes' : 'no'; // Return 'yes' or 'no' based on validation
    }

    // Method to validate a proposed block
    validateBlock(block) {
        // Basic validation logic (e.g., check if the block's hash is valid)
        const lastBlock = this.blockchain.getLastBlock();
        if (block.previousHash !== lastBlock.hash) {
            logger.error('Invalid previous hash');
            return false;
        }
        // Additional validation logic can be added here
        return true; // Assume the block is valid for demonstration
    }

    // Method to check if consensus is reached
    isConsensusReached(votes) {
        const yesVotes = Object.values(votes).filter(vote => vote === 'yes').length;
        return yesVotes >= this.quorum; // Check if the number of 'yes' votes meets the quorum
    }
}

module.exports = { ByzantineFaultTolerance };
