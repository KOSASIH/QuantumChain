// src/tests/unit/token.test.js

const Token = require('../../contracts/Token'); // Adjust the path as necessary

describe('Token Contract', () => {
    let token;

    beforeEach(() => {
        token = new Token('TestToken', 'TTK', 1000); // Initialize with name, symbol, and total supply
    });

    test('should have the correct name and symbol', () => {
        expect(token.name).toBe('TestToken');
        expect(token.symbol).toBe('TTK');
    });

    test('should assign the total supply to the creator', () => {
        expect(token.balanceOf(token.owner)).toBe(1000);
    });

    test('should transfer tokens between accounts', () => {
        token.transfer('recipientAddress', 100);
        expect(token.balanceOf('recipientAddress')).toBe(100);
        expect(token.balanceOf(token.owner)).toBe(900);
    });

    test('should fail to transfer more tokens than available', () => {
        expect(() => {
            token.transfer('recipientAddress', 2000);
        }).toThrow('Insufficient balance');
    });

    test('should approve and allow transfer from another account', () => {
        token.approve('spenderAddress', 200);
        expect(token.allowance(token.owner, 'spenderAddress')).toBe(200);
        
        token.transferFrom(token.owner, 'recipientAddress', 100, { from: 'spenderAddress' });
        expect(token.balanceOf('recipientAddress')).toBe(100);
        expect(token.allowance(token.owner, 'spenderAddress')).toBe(100);
    });
});
