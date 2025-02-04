// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MyNFT is ERC721URIStorage, Ownable, ERC2981, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to creator address
    mapping(uint256 => address) private _creators;

    // Mapping to track transfer restrictions
    mapping(uint256 => uint256) private _transferRestrictions;

    event Minted(address indexed creator, uint256 indexed tokenId, string tokenURI, uint96 royaltyFee);
    event RoyaltyUpdated(uint256 indexed tokenId, uint96 newRoyaltyFee);
    event TransferRestrictionSet(uint256 indexed tokenId, uint256 restrictionEndTime);
    event TokenURIUpdated(uint256 indexed tokenId, string newTokenURI);

    constructor() ERC721("MyNFT", "MNFT") {}

    function mint(string memory tokenURI, uint96 royaltyFee, uint256 transferRestrictionDuration) external onlyOwner whenNotPaused {
        uint256 tokenId = _tokenIdCounter.current();
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _setRoyaltyInfo(tokenId, msg.sender, royaltyFee);
        _creators[tokenId] = msg.sender;

        // Set transfer restriction if specified
        if (transferRestrictionDuration > 0) {
            _transferRestrictions[tokenId] = block.timestamp + transferRestrictionDuration;
            emit TransferRestrictionSet(tokenId, _transferRestrictions[tokenId]);
        }

        _tokenIdCounter.increment();
        emit Minted(msg.sender, tokenId, tokenURI, royaltyFee);
    }

    function mintBatch(string[] memory tokenURIs, uint96[] memory royaltyFees, uint256[] memory transferRestrictionDurations) external onlyOwner whenNotPaused {
        require(tokenURIs.length == royaltyFees.length && tokenURIs.length == transferRestrictionDurations.length, "Array lengths must match");
        
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            mint(tokenURIs[i], royaltyFees[i], transferRestrictionDurations[i]);
        }
    }

    function updateRoyalty(uint256 tokenId, uint96 newRoyaltyFee) external {
        require(msg.sender == _creators[tokenId], "Only creator can update royalty");
        _setRoyaltyInfo(tokenId, msg.sender, newRoyaltyFee);
        emit RoyaltyUpdated(tokenId, newRoyaltyFee);
    }

    function setTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner {
        _setTokenURI(tokenId, newTokenURI);
        emit TokenURIUpdated(tokenId, newTokenURI);
    }

    function _setRoyaltyInfo(uint256 tokenId, address creator, uint96 royaltyFee) internal {
        _setDefaultRoyalty(creator, royaltyFee);
    }

    function getCreator(uint256 tokenId) external view returns (address) {
        return _creators[tokenId];
    }

    function canTransfer(uint256 tokenId) external view returns (bool) {
        return block.timestamp >= _transferRestrictions[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
