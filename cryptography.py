// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract QuantumFinance {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        bool isApproved;
    }

    mapping(address => Loan) public loans;
    address public owner;

    event LoanRequested(address indexed borrower, uint256 amount, uint256 interestRate, uint256 duration);
    event LoanApproved(address indexed borrower);

    constructor() {
        owner = msg.sender;
    }

    function requestLoan(uint256 _amount, uint256 _interestRate, uint256 _duration) public {
        require(loans[msg.sender].amount == 0, "Loan already requested");
        loans[msg.sender] = Loan(msg.sender, _amount, _interestRate, _duration, false);
        emit LoanRequested(msg.sender, _amount, _interestRate, _duration);
    }

    function approveLoan(address _borrower) public {
        require(msg.sender == owner, "Only owner can approve loans");
        require(loans[_borrower].amount > 0, "No loan found");
        loans[_borrower].isApproved = true;
        emit LoanApproved(_borrower);
    }
}
