export default {
  "11155111": [
    {
      "name": "sepolia",
      "chainId": "11155111",
      "contracts": {
        "MarketResolutionValidator": {
          "address": "0x16eeAf3509e6554A4C0e709Ae0cEd13D9E0FE9CB",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_easAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "_schemaUID",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "outcome",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bytes32",
                  "name": "attestationId",
                  "type": "bytes32"
                }
              ],
              "name": "ResolutionFinalized",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "outcome",
                  "type": "bool"
                }
              ],
              "name": "ResolutionProposed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "validator",
                  "type": "address"
                }
              ],
              "name": "ResolutionValidated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "MINIMUM_VALIDATORS",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "SCHEMA_UID",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "VALIDATOR_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                }
              ],
              "name": "getAttestation",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "uid",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "schema",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint64",
                      "name": "time",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "expirationTime",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "revocationTime",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "refUID",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "address",
                      "name": "recipient",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "attester",
                      "type": "address"
                    },
                    {
                      "internalType": "bool",
                      "name": "revocable",
                      "type": "bool"
                    },
                    {
                      "internalType": "bytes",
                      "name": "data",
                      "type": "bytes"
                    }
                  ],
                  "internalType": "struct MarketResolutionValidator.AttestationData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "resolutions",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "outcome",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "validationCount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "isFinalized",
                  "type": "bool"
                },
                {
                  "internalType": "bytes32",
                  "name": "attestationId",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "outcome",
                  "type": "bool"
                }
              ],
              "name": "validateResolution",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                }
              ],
              "name": "verifyAttestation",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "PerennialPredictionSchema": {
          "address": "0x5caB4eB8DB1D188f0D73E708f05d3d02E6e1ae69",
          "abi": [
            {
              "inputs": [],
              "name": "ALLO_POOL_SCHEMA",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "IMPACT_MEASUREMENT_SCHEMA",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "LOCATION_VERIFICATION_SCHEMA",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "MARKET_CREATION_SCHEMA",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "MARKET_RESOLUTION_SCHEMA",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "MARKET_STAKE_SCHEMA",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "perennialprediction": {
          "address": "0xffDB8b3c65C5bB7e1a638E257D7C01A7561afb46",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "initialOwner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_easAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "_schemaUID",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "OwnableInvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "OwnableUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "title",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "endTime",
                  "type": "uint256"
                }
              ],
              "name": "MarketCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "outcome",
                  "type": "bool"
                }
              ],
              "name": "MarketResolved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "previousOwner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "OwnershipTransferred",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Paused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "RewardsClaimed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "trader",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isYes",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "shares",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "stakeAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isBuy",
                  "type": "bool"
                }
              ],
              "name": "SharesTraded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Unpaused",
              "type": "event"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_marketId",
                  "type": "uint256"
                }
              ],
              "name": "claimRewards",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_title",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_description",
                  "type": "string"
                },
                {
                  "internalType": "uint64",
                  "name": "_endTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bool",
                  "name": "_isHyperLocal",
                  "type": "bool"
                },
                {
                  "internalType": "int256",
                  "name": "_latitude",
                  "type": "int256"
                },
                {
                  "internalType": "int256",
                  "name": "_longitude",
                  "type": "int256"
                },
                {
                  "internalType": "uint128",
                  "name": "_minStake",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "_maxStake",
                  "type": "uint128"
                }
              ],
              "name": "createMarket",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_title",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_description",
                  "type": "string"
                },
                {
                  "internalType": "uint64",
                  "name": "_endTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bool",
                  "name": "_isHyperLocal",
                  "type": "bool"
                },
                {
                  "internalType": "int256",
                  "name": "_latitude",
                  "type": "int256"
                },
                {
                  "internalType": "int256",
                  "name": "_longitude",
                  "type": "int256"
                },
                {
                  "internalType": "uint128",
                  "name": "_minStake",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "_maxStake",
                  "type": "uint128"
                }
              ],
              "name": "createMarketWithAttestation",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "marketId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32",
                  "name": "attestationUID",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_marketId",
                  "type": "uint256"
                }
              ],
              "name": "getMarket",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "title",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint64",
                      "name": "endTime",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bool",
                      "name": "isResolved",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "isHyperLocal",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "marketType",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct perennialprediction.MarketCore",
                  "name": "core",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "internalType": "uint128",
                      "name": "yesShares",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "noShares",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "totalStake",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "minStake",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "maxStake",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint64",
                      "name": "reputationRequired",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bool",
                      "name": "outcome",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct perennialprediction.MarketData",
                  "name": "data",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "internalType": "int256",
                      "name": "latitude",
                      "type": "int256"
                    },
                    {
                      "internalType": "int256",
                      "name": "longitude",
                      "type": "int256"
                    },
                    {
                      "internalType": "uint128",
                      "name": "poolId",
                      "type": "uint128"
                    },
                    {
                      "internalType": "address",
                      "name": "creator",
                      "type": "address"
                    }
                  ],
                  "internalType": "struct perennialprediction.MarketLocation",
                  "name": "location",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_marketId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "_user",
                  "type": "address"
                }
              ],
              "name": "getUserPosition",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint128",
                      "name": "yesShares",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "noShares",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "stakedAmount",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint64",
                      "name": "lastInteractionTime",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasClaimedRewards",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct perennialprediction.UserPosition",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "marketCores",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "title",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint64",
                  "name": "endTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bool",
                  "name": "isResolved",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "isHyperLocal",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "marketType",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "marketCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "marketData",
              "outputs": [
                {
                  "internalType": "uint128",
                  "name": "yesShares",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "noShares",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "totalStake",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "minStake",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "maxStake",
                  "type": "uint128"
                },
                {
                  "internalType": "uint64",
                  "name": "reputationRequired",
                  "type": "uint64"
                },
                {
                  "internalType": "bool",
                  "name": "outcome",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "marketLocations",
              "outputs": [
                {
                  "internalType": "int256",
                  "name": "latitude",
                  "type": "int256"
                },
                {
                  "internalType": "int256",
                  "name": "longitude",
                  "type": "int256"
                },
                {
                  "internalType": "uint128",
                  "name": "poolId",
                  "type": "uint128"
                },
                {
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "pause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "paused",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "positions",
              "outputs": [
                {
                  "internalType": "uint128",
                  "name": "yesShares",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "noShares",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "stakedAmount",
                  "type": "uint128"
                },
                {
                  "internalType": "uint64",
                  "name": "lastInteractionTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bool",
                  "name": "hasClaimedRewards",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "renounceOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_marketId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "_outcome",
                  "type": "bool"
                }
              ],
              "name": "resolveMarket",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_marketId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "_isYes",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "_shares",
                  "type": "uint256"
                }
              ],
              "name": "tradeShares",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "stateMutability": "payable",
              "type": "receive"
            }
          ]
        }
      }
    }
  ]
} as const;