/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  11155111: {
    perennialprediction: {
      address: "0xC2F76FdF8fB05159BC290E8bea9A554C5b6784f1",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_stakingToken",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "EnforcedPause",
          type: "error",
        },
        {
          inputs: [],
          name: "ExpectedPause",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "OwnableInvalidOwner",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "OwnableUnauthorizedAccount",
          type: "error",
        },
        {
          inputs: [],
          name: "ReentrancyGuardReentrantCall",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint64",
              name: "marketId",
              type: "uint64",
            },
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "string",
              name: "title",
              type: "string",
            },
            {
              indexed: false,
              internalType: "enum perennialprediction.MarketType",
              name: "marketType",
              type: "uint8",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "endTime",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "isHyperLocal",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "latitude",
              type: "int256",
            },
            {
              indexed: false,
              internalType: "int256",
              name: "longitude",
              type: "int256",
            },
          ],
          name: "MarketCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
          ],
          name: "MarketCreatorAdded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint64",
              name: "marketId",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "outcome",
              type: "bool",
            },
          ],
          name: "MarketResolved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "Paused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint128",
              name: "newScore",
              type: "uint128",
            },
          ],
          name: "ReputationUpdated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint64",
              name: "marketId",
              type: "uint64",
            },
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint128",
              name: "amount",
              type: "uint128",
            },
          ],
          name: "RewardsClaimed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint64",
              name: "marketId",
              type: "uint64",
            },
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "isYes",
              type: "bool",
            },
            {
              indexed: false,
              internalType: "uint128",
              name: "amount",
              type: "uint128",
            },
            {
              indexed: false,
              internalType: "uint128",
              name: "price",
              type: "uint128",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "isBuy",
              type: "bool",
            },
          ],
          name: "SharesTraded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "Unpaused",
          type: "event",
        },
        {
          inputs: [],
          name: "EARLY_UNSTAKE_PENALTY",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MAX_STAKE_PERCENTAGE",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MIN_STAKE_PERIOD",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "REPUTATION_THRESHOLD",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_creator",
              type: "address",
            },
          ],
          name: "addMarketCreator",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint64",
              name: "_marketId",
              type: "uint64",
            },
          ],
          name: "claimRewards",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "string",
                  name: "title",
                  type: "string",
                },
                {
                  internalType: "string",
                  name: "description",
                  type: "string",
                },
                {
                  internalType: "uint64",
                  name: "endTime",
                  type: "uint64",
                },
                {
                  internalType: "bool",
                  name: "isHyperLocal",
                  type: "bool",
                },
                {
                  internalType: "int256",
                  name: "latitude",
                  type: "int256",
                },
                {
                  internalType: "int256",
                  name: "longitude",
                  type: "int256",
                },
                {
                  internalType: "enum perennialprediction.MarketType",
                  name: "marketType",
                  type: "uint8",
                },
                {
                  internalType: "uint128",
                  name: "minStake",
                  type: "uint128",
                },
                {
                  internalType: "uint128",
                  name: "maxStake",
                  type: "uint128",
                },
                {
                  internalType: "uint64",
                  name: "reputationRequired",
                  type: "uint64",
                },
              ],
              internalType: "struct perennialprediction.MarketParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "createMarket",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_token",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "emergencyWithdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "isMarketCreator",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "marketCores",
          outputs: [
            {
              internalType: "string",
              name: "title",
              type: "string",
            },
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "uint64",
              name: "endTime",
              type: "uint64",
            },
            {
              internalType: "bool",
              name: "isResolved",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isHyperLocal",
              type: "bool",
            },
            {
              internalType: "enum perennialprediction.MarketType",
              name: "marketType",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "marketCount",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "marketData",
          outputs: [
            {
              internalType: "uint128",
              name: "yesShares",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "noShares",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "totalStake",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "minStake",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "maxStake",
              type: "uint128",
            },
            {
              internalType: "uint64",
              name: "reputationRequired",
              type: "uint64",
            },
            {
              internalType: "bool",
              name: "outcome",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "marketLocations",
          outputs: [
            {
              internalType: "int256",
              name: "latitude",
              type: "int256",
            },
            {
              internalType: "int256",
              name: "longitude",
              type: "int256",
            },
            {
              internalType: "uint128",
              name: "poolId",
              type: "uint128",
            },
            {
              internalType: "address",
              name: "creator",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "paused",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "positions",
          outputs: [
            {
              internalType: "uint128",
              name: "yesShares",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "noShares",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "stakedAmount",
              type: "uint128",
            },
            {
              internalType: "uint64",
              name: "lastInteractionTime",
              type: "uint64",
            },
            {
              internalType: "bool",
              name: "hasClaimedRewards",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint64",
              name: "_marketId",
              type: "uint64",
            },
            {
              internalType: "bool",
              name: "_outcome",
              type: "bool",
            },
          ],
          name: "resolveMarket",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "stakingToken",
          outputs: [
            {
              internalType: "contract IERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint64",
              name: "_marketId",
              type: "uint64",
            },
            {
              internalType: "bool",
              name: "_isYes",
              type: "bool",
            },
            {
              internalType: "uint128",
              name: "_amount",
              type: "uint128",
            },
            {
              internalType: "bool",
              name: "_isBuy",
              type: "bool",
            },
          ],
          name: "tradeShares",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "userReputations",
          outputs: [
            {
              internalType: "uint128",
              name: "score",
              type: "uint128",
            },
            {
              internalType: "uint64",
              name: "marketsCreated",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "successfulPredictions",
              type: "uint64",
            },
            {
              internalType: "uint128",
              name: "totalStaked",
              type: "uint128",
            },
            {
              internalType: "uint64",
              name: "lastUpdateTime",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        paused: "@openzeppelin/contracts/utils/Pausable.sol",
      },
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
