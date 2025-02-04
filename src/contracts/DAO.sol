// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAO is Ownable, Pausable {
    enum ProposalStatus { Pending, Active, Executed, Canceled, Expired }

    struct Proposal {
        address proposer;
        string description;
        uint256 voteCount;
        uint256 endTime;
        ProposalStatus status;
        mapping(address => bool) votes;
        address target; // Target address for execution
        bytes data; // Data to be sent to the target address
    }

    IERC20 public governanceToken;
    Proposal[] public proposals;
    uint256 public quorum; // Minimum votes required for a proposal to pass
    uint256 public votingPeriod; // Duration for which proposals can be voted on

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event ProposalExpired(uint256 indexed proposalId);
    event QuorumChanged(uint256 newQuorum);
    event VotingPeriodChanged(uint256 newVotingPeriod);

    modifier onlyTokenHolder() {
        require(governanceToken.balanceOf(msg.sender) > 0, "Not a token holder");
        _;
    }

    modifier onlyActiveProposal(uint256 proposalId) {
        require(proposals[proposalId].status == ProposalStatus.Active, "Proposal is not active");
        _;
    }

    constructor(IERC20 _governanceToken, uint256 _quorum, uint256 _votingPeriod) {
        governanceToken = _governanceToken;
        quorum = _quorum;
        votingPeriod = _votingPeriod;
    }

    function createProposal(string memory description, address target, bytes memory data) external onlyTokenHolder whenNotPaused {
        proposals.push(Proposal({
            proposer: msg.sender,
            description: description,
            voteCount: 0,
            endTime: block.timestamp + votingPeriod,
            status: ProposalStatus.Active,
            target: target,
            data: data
        }));

        emit ProposalCreated(proposals.length - 1, msg.sender, description, block.timestamp + votingPeriod);
    }

    function vote(uint256 proposalId) external onlyTokenHolder onlyActiveProposal(proposalId) whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.votes[msg.sender], "Already voted");
        require(block.timestamp < proposal.endTime, "Voting period has ended");

        proposal.votes[msg.sender] = true;
        proposal.voteCount += governanceToken.balanceOf(msg.sender);

        emit Voted(proposalId, msg.sender);

        // Check if the proposal has reached quorum
        if (proposal.voteCount >= quorum) {
            executeProposal(proposalId);
        }
    }

    function executeProposal(uint256 proposalId) internal onlyActiveProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting period has not ended");

        proposal.status = ProposalStatus.Executed;

        // Execute the proposal logic here (e.g., fund transfer, contract call, etc.)
        (bool success, ) = proposal.target.call(proposal.data);
        require(success, "Proposal execution failed");

        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external onlyTokenHolder onlyActiveProposal(proposalId) whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer, "Only proposer can cancel");

        proposal.status = ProposalStatus.Canceled;

        emit ProposalCanceled(proposalId);
    }

    function checkProposalExpiration(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Proposal has not expired yet");
        require(proposal.status == ProposalStatus.Active, "Proposal is not active");

        proposal.status = ProposalStatus.Expired;

        emit ProposalExpired(proposalId);
    }

    function changeQuorum(uint256 newQuorum) external onlyOwner {
        quorum = newQuorum;
        emit QuorumChanged(newQuorum);
    }

    function changeVotingPeriod(uint256 newVotingPeriod) external onlyOwner {
        votingPeriod = newVotingPeriod;
        emit VotingPeriodChanged(newVotingPeriod);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
