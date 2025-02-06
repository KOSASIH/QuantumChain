// src/tests/unit/marketplace.test.js

const Marketplace = require('../../contracts/Marketplace'); // Adjust the path as necessary

describe('Marketplace Contract', () => {
    let marketplace;
    let seller;
    let buyer;

    beforeEach(() => {
        seller = '0xSellerAddress'; // Replace with a mock address
        buyer = '0xBuyerAddress'; // Replace with a mock address
        marketplace = new Marketplace(); // Initialize the marketplace contract
    });

    test('should allow listing an item for sale', () => {
        marketplace.listItem('Item1', 100, { from: seller });
        const item = marketplace.getItem(1); // Assuming the first item has ID 1

        expect(item.name).toBe('Item1');
        expect(item.price).toBe(100);
        expect(item.status).toBe('Available');
    });

    test('should allow purchasing an item', () => {
        marketplace.listItem('Item1', 100, { from: seller });
        marketplace.purchaseItem(1, { from: buyer, value: 100 });

        const item = marketplace.getItem(1);
        expect(item.status).toBe('Sold');
    });

    test('should not allow purchasing an item with insufficient funds', () => {
        marketplace.listItem('Item1', 100, { from: seller });

        expect(() => {
            marketplace.purchaseItem(1, { from: buyer, value: 50 });
        }).toThrow('Insufficient funds');
    });

    test('should allow checking item status', () => {
        marketplace.listItem('Item1', 100, { from: seller });
        const status = marketplace.checkItemStatus(1);

        expect(status).toBe('Available');
    });

    test('should not allow listing an item with the same ID', () => {
        marketplace.listItem('Item1', 100, { from: seller });

        expect(() => {
            marketplace.listItem('Item1', 100, { from: seller });
        }).toThrow('Item with this ID already exists');
    });
});
