// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";

contract MarketResolutionValidator is AccessControl, ReentrancyGuard {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    uint256 public constant MINIMUM_VALIDATORS = 3;
    bytes32 public immutable SCHEMA_UID;
    
    struct Resolution {
        uint256 marketId;
        bool outcome;
        uint256 validationCount;
        mapping(address => bool) hasValidated;
        bool isFinalized;
        bytes32 attestationId;
    }

    struct AttestationData {
        bytes32 uid;
        bytes32 schema;
        uint64 time;
        uint64 expirationTime;
        uint64 revocationTime;
        bytes32 refUID;
        address recipient;
        address attester;
        bool revocable;
        bytes data;
    }
    
    mapping(uint256 => Resolution) public resolutions;
    IEAS private immutable eas;
    
    event ResolutionProposed(uint256 indexed marketId, bool outcome);
    event ResolutionValidated(uint256 indexed marketId, address validator);
    event ResolutionFinalized(uint256 indexed marketId, bool outcome, bytes32 attestationId);
    
    constructor(address _easAddress, bytes32 _schemaUID) {
        eas = IEAS(_easAddress);
        SCHEMA_UID = _schemaUID;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function validateResolution(
        uint256 marketId,
        bool outcome
    ) external onlyRole(VALIDATOR_ROLE) nonReentrant {
        Resolution storage resolution = resolutions[marketId];
        require(!resolution.hasValidated[msg.sender], "Already validated");
        
        resolution.hasValidated[msg.sender] = true;
        resolution.validationCount++;
        
        if (resolution.validationCount >= MINIMUM_VALIDATORS) {
            finalizeResolution(marketId, outcome);
        }
        
        emit ResolutionValidated(marketId, msg.sender);
    }
    
    function finalizeResolution(uint256 marketId, bool outcome) internal {
        Resolution storage resolution = resolutions[marketId];
        require(!resolution.isFinalized, "Already finalized");
        
        // Encode the attestation data
        bytes memory encodedData = abi.encode(
            marketId,
            outcome,
            resolution.validationCount,
            block.timestamp
        );

        // Create attestation request using IEAS types
        AttestationRequestData memory data = AttestationRequestData({
            recipient: address(0), // No specific recipient
            expirationTime: 0, // No expiration
            revocable: true,
            refUID: bytes32(0), // No reference UID
            data: encodedData,
            value: 0 // No value being sent
        });

        AttestationRequest memory request = AttestationRequest({
            schema: SCHEMA_UID,
            data: data
        });

        // Create attestation
        bytes32 attestationId = eas.attest(request);
        
        resolution.isFinalized = true;
        resolution.attestationId = attestationId;
        
        emit ResolutionFinalized(marketId, outcome, attestationId);
    }

    // Function to verify an attestation
    function verifyAttestation(bytes32 uid) external view returns (bool) {
        return eas.isAttestationValid(uid);
    }

    // Function to get attestation data
    function getAttestation(bytes32 uid) external view returns (AttestationData memory) {
        Attestation memory attestation = eas.getAttestation(uid);

        return AttestationData({
            uid: uid,
            schema: attestation.schema,
            time: attestation.time,
            expirationTime: attestation.expirationTime,
            revocationTime: attestation.revocationTime,
            refUID: attestation.refUID,
            recipient: attestation.recipient,
            attester: attestation.attester,
            revocable: attestation.revocable,
            data: attestation.data
        });
    }
}
