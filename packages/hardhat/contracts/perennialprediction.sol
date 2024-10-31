// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title perennialprediction
 * @dev Advanced prediction market for public goods and environmental projects
 */
contract perennialprediction is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // Constants for precision handling
    uint256 constant PRECISION = 1e18;
    uint256 constant MIN_STAKE = 0.001 ether; // Minimum stake of 0.001 ETH
    uint256 constant MAX_STAKE = 100 ether;   // Maximum stake of 100 ETH

    // Structs with optimized storage
    struct MarketCore {
        string title;
        string description;
        uint64 endTime;
        bool isResolved;
        bool isHyperLocal;
        string marketType;
    }

    struct MarketData {
        uint128 yesShares;
        uint128 noShares;
        uint128 totalStake;
        uint128 minStake;
        uint128 maxStake;
        uint64 reputationRequired;
        bool outcome;
    }

    struct MarketLocation {
        int256 latitude;
        int256 longitude;
        uint128 poolId;
        address creator;
    }

    struct UserPosition {
        uint128 yesShares;
        uint128 noShares;
        uint128 stakedAmount;
        uint64 lastInteractionTime;
        bool hasClaimedRewards;
    }

    // Events
    event SharesTraded(
        uint256 indexed marketId,
        address indexed trader,
        bool isYes,
        uint256 shares,
        uint256 stakeAmount,
        bool isBuy
    );

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string title,
        uint256 endTime
    );

    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    // State variables
    mapping(uint256 => MarketCore) public marketCores;
    mapping(uint256 => MarketData) public marketData;
    mapping(uint256 => MarketLocation) public marketLocations;
    mapping(uint256 => mapping(address => UserPosition)) public positions;
    uint256 public marketCount;

    constructor() Ownable(msg.sender) {}

    // Function to create a new market
    function createMarket(
        string memory _title,
        string memory _description,
        uint64 _endTime,
        bool _isHyperLocal,
        int256 _latitude,
        int256 _longitude,
        uint128 _minStake,
        uint128 _maxStake
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_endTime > block.timestamp, "Invalid end time");
        require(_minStake >= MIN_STAKE, "Stake too low");
        require(_maxStake <= MAX_STAKE, "Stake too high");
        require(_maxStake > _minStake, "Invalid stake range");

        marketCount++;
        uint256 marketId = marketCount;

        marketCores[marketId] = MarketCore({
            title: _title,
            description: _description,
            endTime: _endTime,
            isResolved: false,
            isHyperLocal: _isHyperLocal,
            marketType: _description
        });

        marketData[marketId] = MarketData({
            yesShares: 0,
            noShares: 0,
            totalStake: 0,
            minStake: _minStake,
            maxStake: _maxStake,
            reputationRequired: 0,
            outcome: false
        });

        marketLocations[marketId] = MarketLocation({
            latitude: _latitude,
            longitude: _longitude,
            poolId: 0,
            creator: msg.sender
        });

        emit MarketCreated(marketId, msg.sender, _title, _endTime);
        return marketId;
    }

    // Function to trade shares
    function tradeShares(
        uint256 _marketId,
        bool _isYes,
        uint256 _shares
    ) external payable whenNotPaused nonReentrant {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market");
        require(_shares > 0, "Invalid shares amount");
        require(msg.value >= MIN_STAKE, "Stake too low");
        require(msg.value <= MAX_STAKE, "Stake too high");

        MarketCore storage core = marketCores[_marketId];
        MarketData storage data = marketData[_marketId];
        UserPosition storage position = positions[_marketId][msg.sender];

        require(!core.isResolved, "Market resolved");
        require(block.timestamp < core.endTime, "Market ended");

        // Update shares and stakes
        if (_isYes) {
            data.yesShares += uint128(_shares);
            position.yesShares += uint128(_shares);
        } else {
            data.noShares += uint128(_shares);
            position.noShares += uint128(_shares);
        }

        data.totalStake += uint128(msg.value);
        position.stakedAmount += uint128(msg.value);
        position.lastInteractionTime = uint64(block.timestamp);

        emit SharesTraded(_marketId, msg.sender, _isYes, _shares, msg.value, true);
    }

    // Function to claim rewards
    function claimRewards(uint256 _marketId) external nonReentrant {
        MarketCore storage core = marketCores[_marketId];
        UserPosition storage position = positions[_marketId][msg.sender];

        require(core.isResolved, "Market not resolved");
        require(!position.hasClaimedRewards, "Already claimed");
        require(position.stakedAmount > 0, "No stake");

        uint256 reward = calculateReward(_marketId, msg.sender);
        require(reward > 0, "No reward");

        position.hasClaimedRewards = true;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");

        emit RewardsClaimed(_marketId, msg.sender, reward);
    }

    // Internal function to calculate rewards
    function calculateReward(uint256 _marketId, address _user) internal view returns (uint256) {
        MarketData storage data = marketData[_marketId];
        UserPosition storage position = positions[_marketId][_user];

        uint256 winningShares = data.outcome ? position.yesShares : position.noShares;
        if (winningShares == 0) return 0;

        uint256 totalWinningShares = data.outcome ? data.yesShares : data.noShares;
        return (data.totalStake * winningShares) / totalWinningShares;
    }

    // Function to resolve market
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyOwner {
        MarketCore storage core = marketCores[_marketId];
        require(!core.isResolved, "Already resolved");
        require(block.timestamp >= core.endTime, "Too early");

        core.isResolved = true;
        marketData[_marketId].outcome = _outcome;

        emit MarketResolved(_marketId, _outcome);
    }

    // View functions
    function getMarket(uint256 _marketId) external view returns (
        MarketCore memory core,
        MarketData memory data,
        MarketLocation memory location
    ) {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market");
        return (
            marketCores[_marketId],
            marketData[_marketId],
            marketLocations[_marketId]
        );
    }

    function getUserPosition(uint256 _marketId, address _user) external view returns (UserPosition memory) {
        return positions[_marketId][_user];
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
