// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    
    struct Proposal {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Proposal) public proposals;
    mapping(address => mapping(uint => bool)) public votes; // voter -> proposalId -> hasVoted
    uint public proposalsCount;
    address public owner;

    event ProposalCreated(uint id, string name);
    event Voted(address indexed voter, uint proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender; // Set the contract creator as the owner
    }
    
    function createProposal(string memory _name) public onlyOwner {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(proposalsCount, _name, 0);
        emit ProposalCreated(proposalsCount, _name);
    }

    function vote(uint _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");
        require(!votes[msg.sender][_proposalId], "You have already voted for this proposal");

        votes[msg.sender][_proposalId] = true;
        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    function getProposal(uint _proposalId) public view returns (uint, string memory, uint) {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");
        Proposal memory proposal = proposals[_proposalId];
        return (proposal.id, proposal.name, proposal.voteCount);
    }

    function totalProposals() public view returns (uint) {
        return proposalsCount;
    }
}
