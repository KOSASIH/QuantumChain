// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow is Ownable, Pausable {
    enum EscrowState { Created, Funded, Released, Disputed, Resolved, Expired }

    struct EscrowAgreement {
        address buyer;
        address seller;
        address escrowAgent;
        uint256 amount;
        uint256 expirationTime;
        EscrowState state;
        uint256 disputeVotes;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => EscrowAgreement) public agreements;
    uint256 public agreementCount;
    IERC20 public token;

    event AgreementCreated(uint256 indexed agreementId, address indexed buyer, address indexed seller, uint256 amount, uint256 expirationTime);
    event FundsDeposited(uint256 indexed agreementId, address indexed buyer, uint256 amount);
    event FundsReleased(uint256 indexed agreementId, address indexed escrowAgent);
    event DisputeRaised(uint256 indexed agreementId, address indexed escrowAgent);
    event DisputeResolved(uint256 indexed agreementId, address indexed escrowAgent, address indexed recipient);
    event EscrowAgentChanged(uint256 indexed agreementId, address indexed newEscrowAgent);
    event AgreementExpired(uint256 indexed agreementId);

    modifier onlyEscrowAgent(uint256 agreementId) {
        require(msg.sender == agreements[agreementId].escrowAgent, "Not the escrow agent");
        _;
    }

    modifier onlyInState(uint256 agreementId, EscrowState state) {
        require(agreements[agreementId].state == state, "Invalid state");
        _;
    }

    constructor(IERC20 _token) {
        token = _token;
    }

    function createAgreement(address seller, uint256 amount, address escrowAgent, uint256 duration) external whenNotPaused {
        require(seller != address(0), "Invalid seller address");
        require(escrowAgent != address(0), "Invalid escrow agent address");

        agreementCount++;
        agreements[agreementCount] = EscrowAgreement({
            buyer: msg.sender,
            seller: seller,
            escrowAgent: escrowAgent,
            amount: amount,
            expirationTime: block.timestamp + duration,
            state: EscrowState.Created,
            disputeVotes: 0
        });

        emit AgreementCreated(agreementCount, msg.sender, seller, amount, agreements[agreementCount].expirationTime);
    }

    function depositFunds(uint256 agreementId) external whenNotPaused onlyInState(agreementId, EscrowState.Created) {
        EscrowAgreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.buyer, "Only buyer can deposit funds");
        require(token.transferFrom(msg.sender, address(this), agreement.amount), "Transfer failed");

        agreement.state = EscrowState.Funded;

        emit FundsDeposited(agreementId, msg.sender, agreement.amount);
    }

    function releaseFunds(uint256 agreementId) external onlyEscrowAgent(agreementId) onlyInState(agreementId, EscrowState.Funded) whenNotPaused {
        EscrowAgreement storage agreement = agreements[agreementId];
        require(block.timestamp < agreement.expirationTime, "Agreement has expired");

        agreement.state = EscrowState.Released;
        token.transfer(agreement.seller, agreement.amount);

        emit FundsReleased(agreementId, msg.sender);
    }

    function raiseDispute(uint256 agreementId) external onlyEscrowAgent(agreementId) onlyInState(agreementId, EscrowState.Funded) whenNotPaused {
        EscrowAgreement storage agreement = agreements[agreementId];
        agreement.state = EscrowState.Disputed;

        emit DisputeRaised(agreementId, msg.sender);
    }

    function voteForEscrowAgent(uint256 agreementId, address newEscrowAgent) external onlyInState(agreementId, EscrowState.Disputed) {
        EscrowAgreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.buyer || msg.sender == agreement.seller, "Only buyer or seller can vote");
        require(!agreement.hasVoted[msg.sender], "Already voted");

        agreement.hasVoted[msg.sender] = true;
        agreement.disputeVotes++;

        if (agreement.disputeVotes > 1) { // Simple majority
            agreement.escrowAgent = newEscrowAgent;
            emit EscrowAgentChanged(agreementId, newEscrowAgent);
        }
    }

    function resolveDispute(uint256 agreementId, address recipient) external onlyEscrowAgent(agreementId) onlyInState(agreementId, EscrowState.Disputed) whenNotPaused {
        EscrowAgreement storage agreement = agreements[agreementId];
        agreement.state = EscrowState.Resolved;

        token.transfer(recipient, agreement.amount);

        emit DisputeResolved(agreementId, msg.sender, recipient);
    }

    function checkExpiration(uint256 agreementId) external {
        EscrowAgreement storage agreement = agreements[agreementId];
        require(block.timestamp >= agreement.expirationTime, "Agreement has not expired yet");
        require(agreement.state == EscrowState.Created || agreement.state == EscrowState.Funded, "Invalid state for expiration");

        agreement.state = EscrowState.Expired;
        emit AgreementExpired(agreementId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
