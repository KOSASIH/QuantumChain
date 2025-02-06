// src/tests/unit/insurance.test.js

const Insurance = require('../../contracts/Insurance'); // Adjust the path as necessary

describe('Insurance Contract', () => {
    let insurance;
    let policyholder;

    beforeEach(() => {
        policyholder = '0xPolicyholderAddress'; // Replace with a mock address
        insurance = new Insurance(); // Initialize the insurance contract
    });

    test('should allow purchasing an insurance policy', () => {
        insurance.purchasePolicy(policyholder, 1000, { from: policyholder });
        const policy = insurance.getPolicy(policyholder);

        expect(policy.amount).toBe(1000);
        expect(policy.status).toBe('Active');
    });

    test('should allow claiming insurance', () => {
        insurance.purchasePolicy(policyholder, 1000, { from: policyholder });
        insurance.claimInsurance(policyholder, { from: policyholder });

        const policy = insurance.getPolicy(policyholder);
        expect(policy.status).toBe('Claimed');
    });

    test('should not allow claiming insurance without an active policy', () => {
        expect(() => {
            insurance.claimInsurance(policyholder, { from: policyholder });
        }).toThrow('No active policy found for this address');
    });

    test('should allow checking policy status', () => {
        insurance.purchasePolicy(policyholder, 1000, { from: policyholder });
        const status = insurance.checkPolicyStatus(policyholder);

        expect(status).toBe('Active');
    });

    test('should not allow purchasing a policy if one already exists', () => {
        insurance.purchasePolicy(policyholder, 1000, { from: policyholder });

        expect(() => {
            insurance.purchasePolicy(policyholder, 2000, { from: policyholder });
        }).toThrow('Policy already exists for this address');
    });
});
