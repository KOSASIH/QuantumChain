// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

contract AdvancedToken is ERC20, Ownable, Pausable, ERC20Snapshot {
    using SafeMath for uint256;

    // Mapping from account to frozen status
    mapping(address => bool) private _frozenAccounts;

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event AccountFrozen(address indexed account);
    event AccountUnfrozen(address indexed account);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // Mint new tokens
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to the zero address");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    // Burn tokens
    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    // Freeze an account
    function freezeAccount(address account) external onlyOwner {
        require(account != address(0), "Cannot freeze the zero address");
        require(!_frozenAccounts[account], "Account is already frozen");
        _frozenAccounts[account] = true;
        emit AccountFrozen(account);
    }

    // Unfreeze an account
    function unfreezeAccount(address account) external onlyOwner {
        require(_frozenAccounts[account], "Account is not frozen");
        _frozenAccounts[account] = false;
        emit AccountUnfrozen(account);
    }

    // Override transfer functions to prevent transfers from frozen accounts
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(!_frozenAccounts[from], "Transfer from frozen account");
        super._beforeTokenTransfer(from, to, amount);
    }

    // Create a snapshot of the current balances
    function snapshot() external onlyOwner {
        _snapshot();
    }

    // Pause the contract
    function pause() external onlyOwner {
        _pause();
    }

    // Unpause the contract
    function unpause() external onlyOwner {
        _unpause();
    }

    // Override decimals to return 18
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
