// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract perennialprediction is Ownable {
    struct Market {
        string title;
        string description;
        uint256 endTime;
        bool isResolved;
        uint256 yesShares;
        uint256 noShares;
        uint256 totalStake;
        bool outcome;
        bool isHyperLocal;
        int256 latitude;
        int256 longitude;
    }

    struct Prediction {
        uint256 marketId;
        address predictor;
        uint256 predictedValue;
        uint256 stake;
        uint256 confidence;
        bool isYes;
        bool resolved;
    }

    IERC20 public immutable token;
    uint256 public marketCount;
    uint256 public predictionIdCounter;
    uint256 public constant MINIMUM_STAKE = 100;
    uint256 public constant PREDICTION_WINDOW = 7 days;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public userYesShares;
    mapping(uint256 => mapping(address => uint256)) public userNoShares;
    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256) public predictorScores;
    mapping(address => uint256) public accuracyHistory;
    mapping(address => bool) public marketCreators;

    // Reentrancy guard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    event MarketCreated(uint256 indexed marketId, string title, uint256 endTime, bool isHyperLocal);
    event SharesBought(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event SharesSold(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event PredictionCreated(uint256 indexed predictionId, address indexed predictor, uint256 marketId, bool isYes);
    event PredictionResolved(uint256 indexed predictionId, bool success, uint256 reward);
    event MarketCreatorAdded(address indexed creator);
    event MarketCreatorRemoved(address indexed creator);

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
        predictionIdCounter = 1;
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyMarketCreator() {
        require(owner() == _msgSender() || marketCreators[_msgSender()], "Caller is not a market creator");
        _;
    }

    function addMarketCreator(address _creator) external onlyOwner {
        marketCreators[_creator] = true;
        emit MarketCreatorAdded(_creator);
    }

    function removeMarketCreator(address _creator) external onlyOwner {
        marketCreators[_creator] = false;
        emit MarketCreatorRemoved(_creator);
    }

    function createMarket(
        string memory _title,
        string memory _description,
        uint256 _duration,
        bool _isHyperLocal,
        int256 _latitude,
        int256 _longitude
    ) external onlyMarketCreator {
        require(_duration > 0, "Duration must be positive");
        
        unchecked {
            marketCount++;
        }
        markets[marketCount] = Market({
            title: _title,
            description: _description,
            endTime: block.timestamp + _duration,
            isResolved: false,
            yesShares: 0,
            noShares: 0,
            totalStake: 0,
            outcome: false,
            isHyperLocal: _isHyperLocal,
            latitude: _latitude,
            longitude: _longitude
        });

        emit MarketCreated(marketCount, _title, markets[marketCount].endTime, _isHyperLocal);
    }

    function buyShares(uint256 _marketId, bool _isYes, uint256 _amount) external nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.isResolved, "Market is already resolved");
        require(block.timestamp < market.endTime, "Market has ended");

        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        uint256 shares = _calculateShares(_marketId, _isYes, _amount);
        
        if (_isYes) {
            market.yesShares += shares;
            userYesShares[_marketId][msg.sender] += shares;
        } else {
            market.noShares += shares;
            userNoShares[_marketId][msg.sender] += shares;
        }

        market.totalStake += _amount;

        emit SharesBought(_marketId, msg.sender, _isYes, shares);
    }

    function sellShares(uint256 _marketId, bool _isYes, uint256 _shares) external nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.isResolved, "Market is already resolved");
        require(block.timestamp < market.endTime, "Market has ended");

        uint256 payout = _calculatePayout(_marketId, _isYes, _shares);

        if (_isYes) {
            require(userYesShares[_marketId][msg.sender] >= _shares, "Not enough YES shares");
            market.yesShares -= _shares;
            userYesShares[_marketId][msg.sender] -= _shares;
        } else {
            require(userNoShares[_marketId][msg.sender] >= _shares, "Not enough NO shares");
            market.noShares -= _shares;
            userNoShares[_marketId][msg.sender] -= _shares;
        }

        market.totalStake -= payout;

        require(token.transfer(msg.sender, payout), "Token transfer failed");

        emit SharesSold(_marketId, msg.sender, _isYes, _shares);
    }

    function createPrediction(
        uint256 _marketId,
        bool _isYes,
        uint256 _predictedValue,
        uint256 _confidence
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= MINIMUM_STAKE, "Insufficient stake");
        Market storage market = markets[_marketId];
        require(!market.isResolved, "Market is already resolved");
        require(block.timestamp < market.endTime, "Market has ended");

        uint256 predictionId = predictionIdCounter++;
        predictions[predictionId] = Prediction({
            marketId: _marketId,
            predictor: msg.sender,
            predictedValue: _predictedValue,
            stake: msg.value,
            confidence: _confidence,
            isYes: _isYes,
            resolved: false
        });

        emit PredictionCreated(predictionId, msg.sender, _marketId, _isYes);
        return predictionId;
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        require(!market.isResolved, "Market is already resolved");
        require(block.timestamp >= market.endTime, "Market has not ended yet");

        market.isResolved = true;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome);

        for (uint256 i = 1; i < predictionIdCounter; i++) {
            if (predictions[i].marketId == _marketId && !predictions[i].resolved) {
                _resolvePrediction(i, _outcome);
            }
        }
    }

    function _resolvePrediction(uint256 _predictionId, bool _outcome) internal {
        Prediction storage prediction = predictions[_predictionId];
        uint256 accuracy = prediction.isYes == _outcome ? 100 : 0;
        uint256 reward = calculateReward(prediction.stake, accuracy, prediction.confidence);

        prediction.resolved = true;
        predictorScores[prediction.predictor] += reward;
        accuracyHistory[prediction.predictor] = (accuracyHistory[prediction.predictor] + accuracy) / 2;

        if (accuracy >= 80) {
            payable(prediction.predictor).transfer(reward);
            emit PredictionResolved(_predictionId, true, reward);
        } else {
            emit PredictionResolved(_predictionId, false, 0);
        }
    }

    function claimRewards(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.isResolved, "Market is not resolved yet");

        uint256 userShares = market.outcome ? userYesShares[_marketId][msg.sender] : userNoShares[_marketId][msg.sender];
        require(userShares > 0, "No shares to claim");

        uint256 totalWinningShares = market.outcome ? market.yesShares : market.noShares;
        uint256 reward = (market.totalStake * userShares) / totalWinningShares;

        if (market.outcome) {
            userYesShares[_marketId][msg.sender] = 0;
        } else {
            userNoShares[_marketId][msg.sender] = 0;
        }

        require(token.transfer(msg.sender, reward), "Token transfer failed");
    }

    function _calculateShares(uint256 _marketId, bool _isYes, uint256 _amount) internal view returns (uint256) {
        Market storage market = markets[_marketId];
        uint256 totalShares = _isYes ? market.yesShares : market.noShares;
        uint256 otherShares = _isYes ? market.noShares : market.yesShares;

        if (totalShares == 0 && otherShares == 0) {
            return _amount;
        }

        return (_amount * (totalShares + otherShares)) / otherShares;
    }

    function _calculatePayout(uint256 _marketId, bool _isYes, uint256 _shares) internal view returns (uint256) {
        Market storage market = markets[_marketId];
        uint256 totalShares = _isYes ? market.yesShares : market.noShares;
        uint256 otherShares = _isYes ? market.noShares : market.yesShares;

        return (_shares * otherShares) / (totalShares + otherShares);
    }

    function calculateReward(uint256 stake, uint256 accuracy, uint256 confidence) internal pure returns (uint256) {
        return (stake * accuracy * confidence) / 10000;
    }
}
