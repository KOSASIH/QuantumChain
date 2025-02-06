// src/tests/unit/escrow.test.js

const Escrow = require('../../contracts/Escrow'); // Adjust the path as necessary

describe('Escrow Contract', () => {
    let escrow;
    let buyer;
    let seller;
    let arbiter;

    beforeEach(() => {
        buyer = '0xBuyerAddress'; // Replace with a mock address
        seller = '0xSellerAddress'; // Replace with a mock address
        arbiter = '0xArbiterAddress'; // Replace with a mock address
        escrow = new Escrow(buyer, seller, arbiter); // Initialize the escrow contract
    });

    test('should create a new escrow agreement', () => {
        expect(escrow.buyer).toBe(buyer);
        expect(escrow.seller).toBe(seller);
        expect(escrow.arbiter).toBe(arbiter);
        expect(escrow.status).toBe('Pending');
    });

    test('should allow the buyer to deposit funds', () => {
        escrow.deposit({ from: buyer, value: 1000 });
        expect(escrow.balance).toBe(1000);
        expect(escrow.status).toBe('FundsDeposited');
    });

    test('should allow the arbiter to release funds to the seller', () => {
        escrow.deposit({ from: buyer, value: 1000 });
        escrow.releaseFunds({ from: arbiter });

        expect(escrow.balance).toBe(0);
        expect(escrow.status).toBe('Completed');
    });

    test('should not allow releasing funds if not from arbiter', () => {
        escrow.deposit({ from: buyer, value: 1000 });

        expect(() => {
            escrow.releaseFunds({ from: buyer });
        }).toThrow('Only the arbiter can release funds');
    });

    test('should allow the arbiter to handle disputes', () => {
        escrow.deposit({ from: buyer, value: 1000 });
        escrow.raiseDispute({ from: buyer });

        expect(escrow.status).toBe('Disputed');
    });

    test('should resolve disputes and return funds to the buyer', () => {
        escrow.deposit({ from: buyer, value: 1000 });
        escrow.raiseDispute({ from: buyer });
        escrow.resolveDispute({ from: arbiter });

        expect(escrow.balance).toBe(0);
        expect(escrow.status).toBe('Resolved');
    });
});
