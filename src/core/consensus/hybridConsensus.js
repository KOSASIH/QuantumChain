// src/core/consensus/hybridConsensus.js

const { ProofOfWork } = require('./proofOfWork');
const { ProofOfStake } = require('./proofOfStake');
const { logger } = require('../logging/logger');

class HybridConsensus {
    constructor(blockchain, difficulty) {
        this.blockchain = blockchain; // Reference to the blockchain
        this.difficulty = difficulty; // Difficulty level for PoW
        this.poW = new ProofOfWork(blockchain, difficulty); // Instance of Proof of Work
        this.poS = new ProofOfStake(blockchain); // Instance of Proof of Stake
    }

    // Method to create a new block using the hybrid consensus mechanism
    createBlock(minerAddress) {
        // Check if the miner is eligible to create a block using PoS
        if (this.poS.canCreateBlock(minerAddress)) {
            return this.poS.createBlock(minerAddress); // Create block using PoS
        } else {
            // If not eligible for PoS, fall back to PoW
            logger.info(`${minerAddress} is not eligible for PoS, attempting to mine using PoW...`);
            this.poW.mine(); // Start mining using PoW
            return this.blockchain.getLastBlock(); // Return the last mined block
        }
    }

    // Method to register a delegate for PoS
    registerDelegate(delegateAddress, stake) {
        this.poS.registerDelegate(delegateAddress, stake);
    }

    // Method to elect delegates for PoS
    electDelegates() {
        this.poS.electDelegates();
    }

    // Method to get the current elected delegates
    getElectedDelegates() {
        return this.poS.getElectedDelegates();
    }
}

module.exports = { HybridConsensus };
