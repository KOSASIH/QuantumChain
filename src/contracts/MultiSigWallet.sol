// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MultiSigWallet is Ownable, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;

    event Deposit(address indexed sender, uint256 amount);
    event TransactionCreated(uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event TransactionExecuted(uint256 indexed txIndex);
    event TransactionRevoked(uint256 indexed txIndex, address indexed owner);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);
    event EmergencyPaused();
    event EmergencyUnpaused();

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        mapping(address => bool) isConfirmed;
    }

    EnumerableSet.AddressSet private owners;
    uint256 public required;
    Transaction[] public transactions;

    modifier onlyOwner() {
        require(owners.contains(msg.sender), "Not an owner");
        _;
    }

    modifier txExists(uint256 txIndex) {
        require(txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 txIndex) {
        require(!transactions[txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 txIndex) {
        require(!transactions[txIndex].isConfirmed[msg.sender], "Transaction already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid requirement");

        for (uint256 i = 0; i < _owners.length; i++) {
            owners.add(_owners[i]);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function createTransaction(address to, uint256 value, bytes memory data) public onlyOwner whenNotPaused {
        uint256 txIndex = transactions.length;
        transactions.push();
        Transaction storage newTransaction = transactions[txIndex];
        newTransaction.to = to;
        newTransaction.value = value;
        newTransaction.data = data;
        newTransaction.executed = false;
        newTransaction.confirmations = 0;

        emit TransactionCreated(txIndex, to, value, data);
    }

    function confirmTransaction(uint256 txIndex) public onlyOwner txExists(txIndex) notExecuted(txIndex) notConfirmed(txIndex) {
        Transaction storage transaction = transactions[txIndex];
        transaction.isConfirmed[msg.sender] = true;
        transaction.confirmations += 1;

        if (transaction.confirmations >= required) {
            executeTransaction(txIndex);
        }
    }

    function revokeConfirmation(uint256 txIndex) public onlyOwner txExists(txIndex) notExecuted(txIndex) {
        Transaction storage transaction = transactions[txIndex];
        require(transaction.isConfirmed[msg.sender], "Transaction not confirmed");

        transaction.isConfirmed[msg.sender] = false;
        transaction.confirmations -= 1;

        emit TransactionRevoked(txIndex, msg.sender);
    }

    function executeTransaction(uint256 txIndex) internal txExists(txIndex) notExecuted(txIndex) {
        Transaction storage transaction = transactions[txIndex];
        require(transaction.confirmations >= required, "Not enough confirmations");

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");

        emit TransactionExecuted(txIndex);
    }

    function executeBatchTransactions(uint256[] memory txIndexes) external onlyOwner whenNotPaused {
        for (uint256 i = 0; i < txIndexes.length; i++) {
            executeTransaction(txIndexes[i]);
        }
    }

    function addOwner(address owner) public onlyOwner {
        require(!owners.contains(owner), "Owner already exists");
        owners.add(owner);
        emit OwnerAdded(owner);
    }

    function removeOwner(address owner) public onlyOwner {
        require(owners.contains(owner), "Not an owner");
        require(owners.length() - 1 >= required, "Cannot remove owner, would drop below required");

        owners.remove(owner);
        emit OwnerRemoved(owner);
    }

    function changeRequirement(uint256 _required) public onlyOwner {
        require(_required > 0 && _required <= owners.length(), "Invalid requirement");
        required = _required;
        emit RequirementChanged(_required);
    }

    function getOwners() public view returns (address[] memory) {
        return owners.values();
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 txIndex) public view returns (address to, uint256 value, bytes memory data, bool executed, uint256 confirmations) {
        Transaction storage transaction = transactions[txIndex];
        return (transaction.to, transaction.value, transaction.data, transaction.executed, transaction.confirmations);
    }

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPaused();
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused();
    }
}
