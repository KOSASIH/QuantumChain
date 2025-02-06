// src/tests/unit/blockchain.test.js

const Blockchain = require('../../core/blockchain'); // Adjust the path as necessary

describe('Blockchain', () => {
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
    });

    test('should create a new blockchain instance', () => {
        expect(blockchain).toBeDefined();
        expect(blockchain.chain).toHaveLength(1); // Genesis block
    });

    test('should add a new block to the chain', () => {
        const previousBlock = blockchain.getLatestBlock();
        const newBlock = blockchain.createBlock({ data: 'Test transaction' });

        expect(newBlock.previousHash).toBe(previousBlock.hash);
        expect(blockchain.chain).toHaveLength(2); // One new block added
    });

    test('should validate the blockchain integrity', () => {
        blockchain.createBlock({ data: 'Block 1' });
        blockchain.createBlock({ data: 'Block 2' });

        expect(blockchain.isChainValid()).toBe(true);
    });

    test('should invalidate the blockchain if a block is tampered with', () => {
        blockchain.createBlock({ data: 'Block 1' });
        blockchain.chain[1].data = 'Tampered data'; // Tampering with the block

        expect(blockchain.isChainValid()).toBe(false);
    });
});
