// src/tests/unit/dao.test.js

const DAO = require('../../contracts/DAO'); // Adjust the path as necessary

describe('DAO Contract', () => {
    let dao;
    let owner;
    let member1;
    let member2;

    beforeEach(() => {
        owner = '0xOwnerAddress'; // Replace with a mock address
        member1 = '0xMember1Address'; // Replace with a mock address
        member2 = '0xMember2Address'; // Replace with a mock address
        dao = new DAO(owner); // Initialize the DAO contract
    });

    test('should create a new proposal', () => {
        const proposalId = dao.createProposal('Increase budget', { from: owner });
        const proposal = dao.getProposal(proposalId);

        expect(proposal.description).toBe('Increase budget');
        expect(proposal.voteCount).toBe(0);
        expect(proposal.status).toBe('Pending');
    });

    test('should allow members to vote on a proposal', () => {
        const proposalId = dao.createProposal('Increase budget', { from: owner });
        
        dao.vote(proposalId, true, { from: member1 });
        const proposal = dao.getProposal(proposalId);

        expect(proposal.voteCount).toBe(1);
    });

    test('should not allow voting on a non-existent proposal', () => {
        expect(() => {
            dao.vote(999, true, { from: member1 }); // Non-existent proposal ID
        }).toThrow('Proposal does not exist');
    });

    test('should execute a proposal if it passes', () => {
        const proposalId = dao.createProposal('Increase budget', { from: owner });
        dao.vote(proposalId, true, { from: member1 });
        dao.vote(proposalId, true, { from: member2 });

        dao.executeProposal(proposalId, { from: owner });
        const proposal = dao.getProposal(proposalId);

        expect(proposal.status).toBe('Executed');
    });

    test('should not allow execution of a proposal that has not passed', () => {
        const proposalId = dao.createProposal('Decrease budget', { from: owner });
        dao.vote(proposalId, false, { from: member1 });

        expect(() => {
            dao.executeProposal(proposalId, { from: owner });
        }).toThrow('Proposal has not passed');
    });
});
