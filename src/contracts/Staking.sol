// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 lockDuration; // Duration for which rewards are locked
        bool withdrawn;
    }

    IERC20 public stakingToken;
    uint256 public totalStaked;
    uint256 public rewardRate; // Base reward rate per second
    bool public paused; // Emergency pause flag

    mapping(address => Stake[]) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 duration, uint256 lockDuration);
    event Withdrawn(address indexed user, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 amount);
    event Paused();
    event Unpaused();
    event RewardRateUpdated(uint256 newRate);

    modifier whenNotPaused() {
        require(!paused, "Staking is paused");
        _;
    }

    constructor(IERC20 _stakingToken, uint256 _rewardRate) {
        stakingToken = _stakingToken;
        rewardRate = _rewardRate;
        paused = false;
    }

    function stake(uint256 amount, uint256 duration, uint256 lockDuration) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(duration > 0, "Duration must be greater than 0");
        require(lockDuration >= 0, "Lock duration must be non-negative");

        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            duration: duration,
            lockDuration: lockDuration,
            withdrawn: false
        }));

        totalStaked = totalStaked.add(amount);
        emit Staked(msg.sender, amount, duration, lockDuration);
    }

    function calculateRewards(address user) public view returns (uint256) {
        uint256 totalRewards = 0;
        for (uint256 i = 0; i < stakes[user].length; i++) {
            Stake memory stakeInfo = stakes[user][i];
            if (!stakeInfo.withdrawn) {
                uint256 stakingDuration = block.timestamp.sub(stakeInfo.startTime);
                if (stakingDuration > stakeInfo.duration) {
                    stakingDuration = stakeInfo.duration;
                }
                totalRewards = totalRewards.add(stakeInfo.amount.mul(stakingDuration).mul(rewardRate).div(1e18));
            }
        }
        return totalRewards;
    }

    function withdraw(uint256 stakeIndex) external nonReentrant whenNotPaused {
        Stake storage stakeInfo = stakes[msg.sender][stakeIndex];
        require(!stakeInfo.withdrawn, "Already withdrawn");
        
        uint256 rewards = calculateRewards(msg.sender);
        require(block.timestamp >= stakeInfo.startTime.add(stakeInfo.duration), "Stake is still locked");

        // Check if rewards are locked
        require(block.timestamp >= stakeInfo.startTime.add(stakeInfo.duration).add(stakeInfo.lockDuration), "Rewards are still locked");

        stakeInfo.withdrawn = true;
        uint256 totalAmount = stakeInfo.amount.add(rewards);
        totalStaked = totalStaked.sub(stakeInfo.amount);
        
        stakingToken.transfer(msg.sender, totalAmount);
        emit Withdrawn(msg.sender, totalAmount);
    }

    function emergencyWithdraw(uint256 stakeIndex) external nonReentrant onlyOwner {
        Stake storage stakeInfo = stakes[msg.sender][stakeIndex];
        require(!stakeInfo.withdrawn, "Already withdrawn");

        stakeInfo.withdrawn = true;
        totalStaked = totalStaked.sub(stakeInfo.amount);
        
        stakingToken.transfer(msg.sender, stakeInfo.amount);
        emit EmergencyWithdrawn(msg.sender, stakeInfo.amount);
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    function getStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }
}
