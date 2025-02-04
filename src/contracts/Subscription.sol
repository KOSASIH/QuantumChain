// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Subscription is Ownable, Pausable {
    enum SubscriptionStatus { Active, Expired, Canceled }

    struct SubscriptionInfo {
        address subscriber;
        uint256 amount; // Payment amount
        uint256 duration; // Duration in seconds
        uint256 startTime; // When the subscription starts
        SubscriptionStatus status; // Current status of the subscription
    }

    struct SubscriptionHistory {
        uint256 subscriptionId;
        uint256 startTime;
        uint256 endTime;
        SubscriptionStatus status;
    }

    IERC20 public paymentToken;
    mapping(uint256 => SubscriptionInfo) public subscriptions; // Mapping of subscription ID to SubscriptionInfo
    mapping(address => SubscriptionHistory[]) public subscriptionHistories; // Mapping of subscriber to their subscription history
    uint256 public subscriptionCount; // Counter for subscriptions
    uint256 public gracePeriod; // Grace period in seconds for expired subscriptions
    uint256 public discountPercentage; // Discount percentage for long-term subscriptions

    event SubscriptionCreated(uint256 indexed subscriptionId, address indexed subscriber, uint256 amount, uint256 duration);
    event SubscriptionRenewed(uint256 indexed subscriptionId, address indexed subscriber);
    event SubscriptionCanceled(uint256 indexed subscriptionId, address indexed subscriber);
    event PaymentReceived(uint256 indexed subscriptionId, address indexed subscriber, uint256 amount);
    event SubscriptionDispute(uint256 indexed subscriptionId, address indexed subscriber, string reason);

    constructor(IERC20 _paymentToken, uint256 _gracePeriod, uint256 _discountPercentage) {
        paymentToken = _paymentToken;
        gracePeriod = _gracePeriod;
        discountPercentage = _discountPercentage;
    }

    function createSubscription(uint256 amount, uint256 duration) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        // Transfer payment from subscriber
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Payment failed");

        // Create the subscription
        subscriptions[subscriptionCount] = SubscriptionInfo({
            subscriber: msg.sender,
            amount: amount,
            duration: duration,
            startTime: block.timestamp,
            status: SubscriptionStatus.Active
        });

        subscriptionHistories[msg.sender].push(SubscriptionHistory({
            subscriptionId: subscriptionCount,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            status: SubscriptionStatus.Active
        }));

        emit SubscriptionCreated(subscriptionCount, msg.sender, amount, duration);
        emit PaymentReceived(subscriptionCount, msg.sender, amount);
        subscriptionCount++;
    }

    function renewSubscription(uint256 subscriptionId) external whenNotPaused {
        SubscriptionInfo storage subscription = subscriptions[subscriptionId];
        require(subscription.subscriber == msg.sender, "Not the subscriber");
        require(subscription.status == SubscriptionStatus.Active || subscription.status == SubscriptionStatus.Expired, "Subscription is not active or expired");

        uint256 amountToPay = subscription.amount;
        if (subscription.status == SubscriptionStatus.Expired) {
            require(block.timestamp <= subscription.startTime + subscription.duration + gracePeriod, "Grace period has expired");
        } else {
            // Apply discount for long-term subscriptions
            if (subscription.duration > 30 days) {
                amountToPay = (amountToPay * (10000 - discountPercentage)) / 10000; // Apply discount
            }
        }

        // Transfer payment for renewal
        require(paymentToken.transferFrom(msg.sender, address(this), amountToPay), "Payment failed");

        // Update the start time
        subscription.startTime = block.timestamp;
        subscription.status = SubscriptionStatus.Active;

        // Update subscription history
        subscriptionHistories[msg.sender].push(SubscriptionHistory({
            subscriptionId: subscriptionId,
            startTime: block.timestamp,
            endTime: block.timestamp + subscription.duration,
            status: SubscriptionStatus.Active
        }));

        emit SubscriptionRenewed(subscriptionId, msg.sender);
        emit PaymentReceived(subscriptionId, msg.sender, amountToPay);
    }

    function cancelSubscription(uint256 subscriptionId) external whenNotPaused {
        SubscriptionInfo storage subscription = subscriptions[subscriptionId];
        require(subscription.subscriber == msg.sender, "Not the subscriber");
        require(subscription.status == SubscriptionStatus.Active, "Subscription is not active");

        // Mark the subscription as canceled
        subscription.status = SubscriptionStatus.Canceled;

        emit SubscriptionCanceled(subscriptionId, msg.sender);
    }

    function getSubscriptionStatus(uint256 subscriptionId) external view returns (SubscriptionStatus) {
        SubscriptionInfo storage subscription = subscriptions[subscriptionId];
        if (subscription.status == SubscriptionStatus.Active) {
            if (block.timestamp >= subscription.startTime + subscription.duration) {
                return SubscriptionStatus.Expired;
            }
        }
        return subscription.status;
    }

    function disputeSubscription(uint256 subscriptionId, string memory reason) external whenNotPaused {
        SubscriptionInfo storage subscription = subscriptions[subscriptionId];
        require(subscription.subscriber == msg.sender, "Not the subscriber");

        emit SubscriptionDispute(subscriptionId, msg.sender, reason);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
