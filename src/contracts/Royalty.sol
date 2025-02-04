// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Royalty is Ownable, Pausable {
    struct RoyaltyInfo {
        address creator;
        uint256 percentage; // Royalty percentage (e.g., 500 for 5%)
    }

    struct RoyaltyDistribution {
        uint256 assetId;
        uint256 amount;
        address recipient;
        bool paid;
    }

    mapping(uint256 => RoyaltyInfo) public royalties; // Mapping of asset ID to RoyaltyInfo
    mapping(uint256 => RoyaltyDistribution[]) public royaltyHistory; // Mapping of asset ID to distribution history
    IERC20 public paymentToken;

    event RoyaltyRegistered(uint256 indexed assetId, address indexed creator, uint256 percentage);
    event RoyaltyUpdated(uint256 indexed assetId, uint256 newPercentage);
    event RoyaltyDistributed(uint256 indexed assetId, address indexed creator, uint256 amount);
    event RoyaltyDispute(uint256 indexed assetId, address indexed creator, string reason);

    constructor(IERC20 _paymentToken) {
        paymentToken = _paymentToken;
    }

    function registerRoyalty(uint256 assetId, uint256 percentage) external whenNotPaused {
        require(percentage <= 10000, "Percentage cannot exceed 100%");
        require(royalties[assetId].creator == address(0), "Royalty already registered");

        royalties[assetId] = RoyaltyInfo({
            creator: msg.sender,
            percentage: percentage
        });

        emit RoyaltyRegistered(assetId, msg.sender, percentage);
    }

    function registerRoyalties(uint256[] calldata assetIds, uint256[] calldata percentages) external whenNotPaused {
        require(assetIds.length == percentages.length, "Mismatched input lengths");

        for (uint256 i = 0; i < assetIds.length; i++) {
            registerRoyalty(assetIds[i], percentages[i]);
        }
    }

    function updateRoyalty(uint256 assetId, uint256 newPercentage) external whenNotPaused {
        RoyaltyInfo storage royalty = royalties[assetId];
        require(royalty.creator == msg.sender, "Only creator can update royalty");
        require(newPercentage <= 10000, "Percentage cannot exceed 100%");

        royalty.percentage = newPercentage;

        emit RoyaltyUpdated(assetId, newPercentage);
    }

    function distributeRoyalty(uint256 assetId, uint256 salePrice) external whenNotPaused {
        RoyaltyInfo storage royalty = royalties[assetId];
        require(royalty.creator != address(0), "Royalty not registered");

        uint256 royaltyAmount = (salePrice * royalty.percentage) / 10000;
        require(paymentToken.transfer(royalty.creator, royaltyAmount), "Royalty transfer failed");

        royaltyHistory[assetId].push(RoyaltyDistribution({
            assetId: assetId,
            amount: royaltyAmount,
            recipient: royalty.creator,
            paid: true
        }));

        emit RoyaltyDistributed(assetId, royalty.creator, royaltyAmount);
    }

    function disputeRoyalty(uint256 assetId, string memory reason) external whenNotPaused {
        RoyaltyInfo storage royalty = royalties[assetId];
        require(royalty.creator == msg.sender, "Only creator can dispute");

        emit RoyaltyDispute(assetId, msg.sender, reason);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
