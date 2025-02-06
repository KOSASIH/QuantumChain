// src/tests/unit/staking.test.js

const Staking = require('../../contracts/Staking'); // Adjust the path as necessary

describe('Staking Contract', () => {
    let staking;
    let token;
    let staker;

    beforeEach(() => {
        staker = '0xStakerAddress'; // Replace with a mock address
        token = { // Mock token contract
            transfer: jest.fn(),
            transferFrom: jest.fn(),
            balanceOf: jest.fn().mockReturnValue(1000), // Mock balance
        };
        staking = new Staking(token); // Initialize the staking contract
    });

    test('should allow staking tokens', () => {
        staking.stake(500, { from: staker });
        expect(token.transferFrom).toHaveBeenCalledWith(staker, staking.address, 500);
    });

    test('should allow withdrawing staked tokens', () => {
        staking.stake(500, { from: staker });
        staking.withdraw(300, { from: staker });

        expect(token.transfer).toHaveBeenCalledWith(staker, 300);
    });

    test('should not allow withdrawing more than staked amount', () => {
        staking.stake(500, { from: staker });

        expect(() => {
            staking.withdraw(600, { from: staker });
        }).toThrow('Insufficient staked amount');
    });

    test('should calculate rewards correctly', () => {
        staking.stake(500, { from: staker });
        staking.setRewardRate(10); // Set reward rate to 10%

        const rewards = staking.calculateRewards(staker);
        expect(rewards).toBe(50); // 10% of 500
    });

    test('should allow claiming rewards', () => {
        staking.stake(500, { from: staker });
        staking.setRewardRate(10); // Set reward rate to 10%
        staking.claimRewards({ from: staker });

        expect(token.transfer).toHaveBeenCalledWith(staker, 50); // Claiming 50 rewards
    });
});
