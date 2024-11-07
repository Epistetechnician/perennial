// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { SchemaResolver } from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

contract PerennialPredictionSchema {
    // Market Creation Schema
    bytes32 public constant MARKET_CREATION_SCHEMA = keccak256(
        "address creator,uint256 marketId,string title,string description,uint256 endTime,bool isHyperLocal,int256 latitude,int256 longitude,uint256 marketType,uint256 minStake,uint256 maxStake,uint256 reputationRequired,bytes32 alloPoolId"
    );

    // Market Resolution Schema
    bytes32 public constant MARKET_RESOLUTION_SCHEMA = keccak256(
        "uint256 marketId,bool outcome,uint256 timestamp,address[] validators,bytes[] signatures,uint256 totalStake,bytes32 ipfsProof"
    );

    // Market Stake Schema
    bytes32 public constant MARKET_STAKE_SCHEMA = keccak256(
        "uint256 marketId,address staker,uint256 amount,bool isYesStake,uint256 timestamp,uint256 reputationScore"
    );

    // Location Verification Schema
    bytes32 public constant LOCATION_VERIFICATION_SCHEMA = keccak256(
        "uint256 marketId,int256 latitude,int256 longitude,uint256 timestamp,bytes32 astralProof,address verifier"
    );

    // Impact Measurement Schema
    bytes32 public constant IMPACT_MEASUREMENT_SCHEMA = keccak256(
        "uint256 marketId,uint256 timestamp,uint256 webTrend,uint256 aiTruth,uint256 liquidityFlow,bytes32 ipfsData,address[] impactValidators"
    );

    // Allo Integration Schema
    bytes32 public constant ALLO_POOL_SCHEMA = keccak256(
        "uint256 marketId,bytes32 poolId,address strategy,address token,uint256 amount,bytes metadata,address[] managers"
    );
}