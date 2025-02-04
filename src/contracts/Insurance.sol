// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Insurance is Ownable, Pausable {
    enum ClaimStatus { Pending, Approved, Denied, Disputed }

    struct Policy {
        address insured;
        uint256 coverageAmount;
        uint256 premium;
        uint256 startTime;
        uint256 duration; // Duration in seconds
        bool isActive;
    }

    struct Claim {
        address insured;
        uint256 policyId;
        uint256 claimAmount;
        ClaimStatus status;
        uint256 approvalCount;
        mapping(address => bool) approvals;
        string disputeReason; // Reason for dispute
    }

    IERC20 public token;
    Policy[] public policies;
    Claim[] public claims;

    event PolicyCreated(uint256 indexed policyId, address indexed insured, uint256 coverageAmount, uint256 premium, uint256 duration);
    event PremiumPaid(uint256 indexed policyId, address indexed insured, uint256 amount);
    event ClaimSubmitted(uint256 indexed claimId, address indexed insured, uint256 policyId, uint256 claimAmount);
    event ClaimApproved(uint256 indexed claimId, address indexed approver);
    event ClaimDenied(uint256 indexed claimId);
    event ClaimDisputed(uint256 indexed claimId, string reason);
    event Payout(uint256 indexed claimId, address indexed insured, uint256 amount);
    event PolicyRenewed(uint256 indexed policyId, uint256 newDuration);
    event PolicyCancelled(uint256 indexed policyId);

    modifier onlyInsured(uint256 policyId) {
        require(msg.sender == policies[policyId].insured, "Not the insured");
        _;
    }

    modifier onlyActivePolicy(uint256 policyId) {
        require(policies[policyId].isActive, "Policy is not active");
        require(block.timestamp < policies[policyId].startTime + policies[policyId].duration, "Policy has expired");
        _;
    }

    constructor(IERC20 _token) {
        token = _token;
    }

    function createPolicy(uint256 coverageAmount, uint256 premium, uint256 duration) external whenNotPaused {
        require(coverageAmount > 0, "Coverage amount must be greater than 0");
        require(premium > 0, "Premium must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        policies.push(Policy({
            insured: msg.sender,
            coverageAmount: coverageAmount,
            premium: premium,
            startTime: block.timestamp,
            duration: duration,
            isActive: true
        }));

        emit PolicyCreated(policies.length - 1, msg.sender, coverageAmount, premium, duration);
    }

    function payPremium(uint256 policyId) external whenNotPaused onlyInsured(policyId) onlyActivePolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(token.transferFrom(msg.sender, address(this), policy.premium), "Premium payment failed");

        emit PremiumPaid(policyId, msg.sender, policy.premium);
    }

    function submitClaim(uint256 policyId, uint256 claimAmount) external whenNotPaused onlyInsured(policyId) onlyActivePolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(claimAmount <= policy.coverageAmount, "Claim exceeds coverage amount");

        claims.push(Claim({
            insured: msg.sender,
            policyId: policyId,
            claimAmount: claimAmount,
            status: ClaimStatus.Pending,
            approvalCount: 0,
            disputeReason: ""
        }));

        emit ClaimSubmitted(claims.length - 1, msg.sender, policyId, claimAmount);
    }

    function approveClaim(uint256 claimId) external onlyOwner whenNotPaused {
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Pending, "Claim is not pending");
        require(!claim.approvals[msg.sender], "Already approved");

        claim.approvals[msg.sender] = true;
        claim.approvalCount++;

        emit ClaimApproved(claimId, msg.sender);

        // Check if enough approvals have been received
        if (claim.approvalCount >= 2) { // Example: require 2 approvals
            claim.status = ClaimStatus.Approved;
            payOut(claimId);
        }
    }

    function denyClaim(uint256 claimId) external onlyOwner whenNotPaused {
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Pending, "Claim is not pending");

        claim.status = ClaimStatus.Denied;

        emit ClaimDenied(claimId);
    }

    function disputeClaim(uint256 claimId, string memory reason) external onlyInsured(claims[claimId].policyId) whenNotPaused {
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Pending, "Claim is not pending");

        claim.status = ClaimStatus.Disputed;
        claim.disputeReason = reason;

        emit ClaimDisputed(claimId, reason);
    }

    function resolveDispute(uint256 claimId, bool approve) external onlyOwner whenNotPaused {
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Disputed, "Claim is not disputed");

        if (approve) {
            claim.status = ClaimStatus.Approved;
            payOut(claimId);
        } else {
            claim.status = ClaimStatus.Denied;
        }
    }

    function payOut(uint256 claimId) internal {
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Approved, "Claim is not approved");

        policies[claim.policyId].isActive = false; // Mark policy as inactive
        require(token.transfer(claim.insured, claim.claimAmount), "Payout failed");

        emit Payout(claimId, claim.insured, claim.claimAmount);
    }

    function renewPolicy(uint256 policyId, uint256 newDuration) external whenNotPaused onlyInsured(policyId) onlyActivePolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(newDuration > 0, "New duration must be greater than 0");

        policy.startTime = block.timestamp; // Reset start time
        policy.duration += newDuration; // Extend duration

        emit PolicyRenewed(policyId, newDuration);
    }

    function cancelPolicy(uint256 policyId) external onlyInsured(policyId) whenNotPaused {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy is not active");

        policy.isActive = false;

        emit PolicyCancelled(policyId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
