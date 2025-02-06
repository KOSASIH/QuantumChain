// src/tests/unit/voting.test.js

const Voting = require('../../contracts/Voting'); // Adjust the path as necessary

describe('Voting Contract', () => {
    let voting;
    let owner;
    let voter1;
    let voter2;

    beforeEach(() => {
        owner = '0xOwnerAddress'; // Replace with a mock address
        voter1 = '0xVoter1Address'; // Replace with a mock address
        voter2 = '0xVoter2Address'; // Replace with a mock address
        voting = new Voting(owner); // Initialize the voting contract
    });

    test('should allow creating a new vote', () => {
        const voteId = voting.createVote('Should we adopt the new policy?', { from: owner });
        const vote = voting.getVote(voteId);

        expect(vote.question).toBe('Should we adopt the new policy?');
        expect(vote.yesVotes).toBe(0);
        expect(vote.noVotes).toBe(0);
        expect(vote.status).toBe('Open');
    });

    test('should allow casting a vote', () => {
        const voteId = voting.createVote('Should we adopt the new policy?', { from: owner });
        voting.castVote(voteId, true, { from: voter1 });

        const vote = voting.getVote(voteId);
        expect(vote.yesVotes).toBe(1);
    });

    test('should not allow voting on a non-existent vote', () => {
        expect(() => {
            voting.castVote(999, true, { from: voter1 }); // Non-existent vote ID
        }).toThrow('Vote does not exist');
    });

    test('should tally results correctly', () => {
        const voteId = voting.createVote('Should we adopt the new policy?', { from: owner });
        voting.castVote(voteId, true, { from: voter1 });
        voting.castVote(voteId, false, { from: voter2 });

        const results = voting.tallyResults(voteId);
        expect(results.yesVotes).toBe(1);
        expect(results.noVotes).toBe(1);
    });

    test('should not allow tallying results of a closed vote', () => {
        const voteId = voting.createVote('Should we adopt the new policy?', { from: owner });
        voting.castVote(voteId, true, { from: voter1 });
        voting.closeVote(voteId, { from: owner });

        expect(() => {
            voting.tallyResults(voteId);
        }).toThrow('Vote is closed');
    });
});
