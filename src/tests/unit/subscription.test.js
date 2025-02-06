// src/tests/unit/subscription.test.js

const Subscription = require('../../contracts/Subscription'); // Adjust the path as necessary

describe('Subscription Contract', () => {
    let subscription;
    let subscriber;

    beforeEach(() => {
        subscriber = '0xSubscriberAddress'; // Replace with a mock address
        subscription = new Subscription(); // Initialize the subscription contract
    });

    test('should allow subscribing to a service', () => {
        subscription.subscribe(subscriber, { from: subscriber, value: 100 });

        const status = subscription.getStatus(subscriber);
        expect(status).toBe('Active');
    });

    test('should allow canceling a subscription', () => {
        subscription.subscribe(subscriber, { from: subscriber, value: 100 });
        subscription.cancel(subscriber, { from: subscriber });

        const status = subscription.getStatus(subscriber);
        expect(status).toBe('Canceled');
    });

    test('should not allow subscribing with insufficient funds', () => {
        expect(() => {
            subscription.subscribe(subscriber, { from: subscriber, value: 50 });
        }).toThrow('Insufficient funds');
    });

    test('should allow checking subscription status', () => {
        subscription.subscribe(subscriber, { from: subscriber, value: 100 });
        const status = subscription.getStatus(subscriber);

        expect(status).toBe('Active');
    });
});
