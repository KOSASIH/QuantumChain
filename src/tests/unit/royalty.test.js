// src/tests/unit/royalty.test.js

const Royalty = require('../../contracts/Royalty'); // Adjust the path as necessary

describe('Royalty Contract', () => {
    let royalty;
    let creator;
    let buyer;

    beforeEach(() => {
        creator = '0xCreatorAddress'; // Replace with a mock address
        buyer = '0xBuyerAddress'; // Replace with a mock address
        royalty = new Royalty(); // Initialize the royalty contract
    });

    test('should allow setting royalties for a creator', () => {
        royalty.setRoyalty(creator, 10); // Set royalty to 10%

        const royaltyInfo = royalty.getRoyalty(creator);
        expect(royaltyInfo).toBe(10);
    });

    test('should calculate royalties correctly on sale', () => {
        royalty.setRoyalty(creator, 10); // Set royalty to 10%
        const salePrice = 1000;
        const royalties = royalty.calculateRoyalties(creator, salePrice);

        expect(royalties).toBe(100); // 10% of 1000
    });

    test('should distribute royalties on sale', () => {
        royalty.setRoyalty(creator, 10); // Set royalty to 10%
        const salePrice = 1000;

        const payments = royalty.distributeRoyalties(creator, salePrice);
        expect(payments.creator).toBe(100); // Creator receives 100
        expect(payments.platform).toBe(0); // Assuming no platform fee
    });
});
