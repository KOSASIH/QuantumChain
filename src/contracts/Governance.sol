// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Governance is Ownable {
    using Counters for Counters.Counter;

    // Struct to represent a proposal
    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount;
        uint256 endTime;
        bool executed;
        mapping(address => bool) voters;
    }

    // State variables
    IERC20 public governanceToken; // The governance token used for voting
    Counters.Counter private proposalIdCounter; // Counter for proposal IDs
    mapping(uint256 => Proposal) public proposals; // Mapping of proposal ID to Proposal
    uint256 public votingDuration; // Duration for voting on proposals

    // Events
    event ProposalCreated(uint256 indexed proposalId, string description, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter);
    event ProposalExecuted(uint256 indexed proposalId);

    // Constructor
    constructor(IERC20 _governanceToken, uint256 _votingDuration) {
        governanceToken = _governanceToken;
        votingDuration = _votingDuration;
    }

    // Function to create a new proposal
    function createProposal(string memory _description) external onlyOwner {
        proposalIdCounter.increment();
        uint256 proposalId = proposalIdCounter.current();
        uint256 endTime = block.timestamp + votingDuration;

        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.description = _description;
        newProposal.endTime = endTime;
        newProposal.executed = false;

        emit ProposalCreated(proposalId, _description, endTime);
    }

    // Function to vote on a proposal
    function vote(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp < proposal.endTime, "Voting has ended");
        require(!proposal.voters[msg.sender], "You have already voted");

        // Check if the voter has enough governance tokens
        uint256 voterBalance = governanceToken.balanceOf(msg.sender);
        require(voterBalance > 0, "You must hold governance tokens to vote");

        // Record the vote
        proposal.voters[msg.sender] = true;
        proposal.voteCount += voterBalance;

        emit Voted(_proposalId, msg.sender);
    }

    // Function to execute a proposal
    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp >= proposal.endTime, "Voting is still ongoing");
        require(!proposal.executed, "Proposal has already been executed");

        // Logic to execute the proposal (e.g., changing a parameter)
        // This is where you would implement the changes proposed

        proposal.executed = true;

        emit ProposalExecuted(_proposalId);
    }

    // Function to get proposal details
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        string memory description,
        uint256 voteCount,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.id, proposal.description, proposal.voteCount, proposal.endTime, proposal.executed);
    }
}
