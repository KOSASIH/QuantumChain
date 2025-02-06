// src/tests/unit/governance.test.js

const Governance = require('../../contracts/Governance'); // Adjust the path as necessary

describe('Governance Contract', () => {
    let governance;
    let owner;
    let voter1;
    let voter2;

    beforeEach(() => {
        owner = '0xOwnerAddress'; // Replace with a mock address
        voter1 = '0xVoter1Address'; // Replace with a mock address
        voter2 = '0xVoter2Address'; // Replace with a mock address
        governance = new Governance(owner); // Initialize the governance contract
    });

    test('should create a new proposal', () => {
        const proposalId = governance.createProposal('Increase block size', { from: owner });
        const proposal = governance.getProposal(proposalId);

        expect(proposal.description).toBe('Increase block size');
        expect(proposal.voteCount).toBe(0);
        expect(proposal.status).toBe('Pending');
    });

    test('should allow voting on a proposal', () => {
        const proposalId = governance.createProposal('Increase block size', { from: owner });
        
        governance.vote(proposalId, true, { from: voter1 });
        const proposal = governance.getProposal(proposalId);

        expect(proposal.voteCount).toBe(1);
    });

    test('should not allow voting on a non-existent proposal', () => {
        expect(() => {
            governance.vote(999, true, { from: voter1 }); // Non-existent proposal ID
        }).toThrow('Proposal does not exist');
    });

    test('should execute a proposal if it passes', () => {
        const proposalId = governance.createProposal('Increase block size', { from: owner });
        governance.vote(proposalId, true, { from: voter1 });
        governance.vote(proposalId, true, { from: voter2 });

        governance.executeProposal(proposalId, { from: owner });
        const proposal = governance.getProposal(proposalId);

        expect(proposal.status).toBe('Executed');
    });

    test('should not allow execution of a proposal that has not passed', () => {
        const proposalId = governance.createProposal('Decrease block size', { from: owner });
        governance.vote(proposalId, false, { from: voter1 });

        expect(() => {
            governance.executeProposal(proposalId, { from: owner });
        }).toThrow('Proposal has not passed');
    });
});
