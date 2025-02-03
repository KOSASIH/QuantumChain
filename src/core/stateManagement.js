// src/core/stateManagement.js

class StateManagement {
    constructor() {
        this.state = {
            blocks: [], // Array to hold the blocks in the blockchain
            pendingTransactions: [], // Array to hold pending transactions
            accounts: {}, // Object to hold account balances
        };
    }

    // Method to add a new block to the state
    addBlock(block) {
        this.state.blocks.push(block); // Add the block to the blocks array
        this.updateBalances(block.transactions); // Update account balances based on transactions
    }

    // Method to add a pending transaction to the state
    addPendingTransaction(transaction) {
        this.state.pendingTransactions.push(transaction); // Add the transaction to the pending transactions array
    }

    // Method to update account balances based on transactions
    updateBalances(transactions) {
        transactions.forEach(transaction => {
            const { sender, recipient, amount } = transaction;

            // Deduct the amount from the sender's account
            if (this.state.accounts[sender]) {
                this.state.accounts[sender] -= amount;
            } else {
                this.state.accounts[sender] = -amount; // If sender doesn't exist, initialize with negative balance
            }

            // Add the amount to the recipient's account
            if (this.state.accounts[recipient]) {
                this.state.accounts[recipient] += amount;
            } else {
                this.state.accounts[recipient] = amount; // If recipient doesn't exist, initialize with amount
            }
        });
    }

    // Method to get the current state
    getState() {
        return this.state; // Return the current state
    }

    // Method to get the balance of a specific account
    getBalance(address) {
        return this.state.accounts[address] || 0; // Return the balance or 0 if the account doesn't exist
    }

    // Method to get all blocks
    getBlocks() {
        return this.state.blocks; // Return the array of blocks
    }

    // Method to get pending transactions
    getPendingTransactions() {
        return this.state.pendingTransactions; // Return the array of pending transactions
    }

    // Method to clear pending transactions after mining
    clearPendingTransactions() {
        this.state.pendingTransactions = []; // Reset the pending transactions array
    }
}

module.exports = { StateManagement };
