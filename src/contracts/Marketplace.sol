// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract Marketplace is Ownable, Pausable {
    enum AssetType { ERC721, ERC1155 }

    struct Listing {
        address seller;
        AssetType assetType;
        address assetContract;
        uint256 assetId; // For ERC721, it's the token ID; for ERC1155, it's the token ID
        uint256 price;
        bool isActive;
    }

    IERC20 public paymentToken;
    uint256 public marketplaceFee; // Fee in percentage (e.g., 2 for 2%)
    mapping(uint256 => Listing) public listings; // Mapping of listing ID to Listing
    uint256 public listingCount; // Counter for listings

    event AssetListed(uint256 indexed listingId, address indexed seller, AssetType assetType, address indexed assetContract, uint256 assetId, uint256 price);
    event AssetPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price);
    event AssetCanceled(uint256 indexed listingId, address indexed seller);
    event MarketplaceFeeUpdated(uint256 newFee);

    constructor(IERC20 _paymentToken, uint256 _marketplaceFee) {
        paymentToken = _paymentToken;
        marketplaceFee = _marketplaceFee;
    }

    function listAsset(AssetType assetType, address assetContract, uint256 assetId, uint256 price) external whenNotPaused {
        require(price > 0, "Price must be greater than 0");

        if (assetType == AssetType.ERC721) {
            require(IERC721(assetContract).ownerOf(assetId) == msg.sender, "Not the asset owner");
            IERC721(assetContract).transferFrom(msg.sender, address(this), assetId);
        } else if (assetType == AssetType.ERC1155) {
            require(IERC1155(assetContract).balanceOf(msg.sender, assetId) > 0, "Not the asset owner");
            IERC1155(assetContract).safeTransferFrom(msg.sender, address(this), assetId, 1, "");
        }

        listings[listingCount] = Listing({
            seller: msg.sender,
            assetType: assetType,
            assetContract: assetContract,
            assetId: assetId,
            price: price,
            isActive: true
        });

        emit AssetListed(listingCount, msg.sender, assetType, assetContract, assetId, price);
        listingCount++;
    }

    function purchaseAsset(uint256 listingId) external whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Asset is not listed");
        require(listing.seller != msg.sender, "Seller cannot buy their own asset");

        uint256 fee = (listing.price * marketplaceFee) / 100;
        uint256 totalPrice = listing.price + fee;

        require(paymentToken.transferFrom(msg.sender, address(this), totalPrice), "Payment failed");

        // Transfer the asset to the buyer
        if (listing.assetType == AssetType.ERC721) {
            IERC721(listing.assetContract).transferFrom(address(this), msg.sender, listing.assetId);
        } else if (listing.assetType == AssetType.ERC1155) {
            IERC1155(listing.assetContract).safeTransferFrom(address(this), msg.sender, listing.assetId, 1, "");
        }

        // Transfer the fee to the marketplace owner
        require(paymentToken.transfer(owner(), fee), "Fee transfer failed");

        // Transfer the remaining amount to the seller
        require(paymentToken.transfer(listing.seller, listing.price), "Seller payment failed");

        // Mark the listing as inactive
        listing.isActive = false;

        emit AssetPurchased(listingId, msg.sender, listing.seller, listing.price);
    }

    function cancelListing(uint256 listingId) external whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Asset is not listed");
        require(listing.seller == msg.sender, "Only the seller can cancel the listing");

        // Return the asset to the seller
        if (listing.assetType == AssetType.ERC721) {
            IERC721(listing.assetContract).transferFrom(address(this), msg.sender, listing.assetId);
        } else if (listing.assetType == AssetType.ERC1155) {
            IERC1155(listing.assetContract).safeTransferFrom(address(this), msg.sender, listing.assetId, 1, "");
        }

        listing.isActive = false;

        emit AssetCanceled(listingId, msg.sender);
    }

    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee >= 0 && newFee <= 100, "Fee must be between 0 and 100");
        marketplaceFee = newFee;

        emit MarketplaceFeeUpdated(newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
