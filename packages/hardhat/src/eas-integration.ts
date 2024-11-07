import { EAS, SchemaEncoder, SchemaRegistry, Offchain, OffchainAttestationParams, OffchainAttestationVersion } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import type { BigNumber } from '@ethersproject/bignumber';
import type { Provider } from '@ethersproject/providers';
import type { Signer } from '@ethersproject/abstract-signer';

// Sepolia EAS Contract Addresses
const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
const SCHEMA_REGISTRY_ADDRESS = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0";

// Use ethers constants
const ZeroAddress = ethers.constants.AddressZero;

// Optimized schemas for different attestation types
const SCHEMAS = {
    MARKET_CREATION: `
        uint256 marketId,
        string title,
        string description,
        uint256 endTime,
        bool isHyperLocal,
        int256 latitude,
        int256 longitude,
        address creator,
        uint256 timestamp
    `,
    MARKET_RESOLUTION: `
        uint256 marketId,
        bool outcome,
        uint256 totalStake,
        uint256 yesShares,
        uint256 noShares,
        uint256 resolutionTime,
        bytes32 resolutionProof
    `,
    REPUTATION: `
        address user,
        uint256 marketId,
        int256 reputationChange,
        uint256 timestamp,
        bool isCreator
    `
};

// Add type for schema keys
type SchemaType = keyof typeof SCHEMAS;

// Define the EAS-specific transaction types
interface EASTransactionRequest {
  to?: string;
  from?: string;
  nonce?: number;
  gasLimit?: number;
  gasPrice?: BigNumber;
  data?: string;
  value?: BigNumber;
  chainId?: number;
}

interface EASTransactionSigner {
  estimateGas(tx: EASTransactionRequest): Promise<bigint>;
  call(tx: EASTransactionRequest): Promise<string>;
  resolveName(name: string): Promise<string>;
  sendTransaction(tx: EASTransactionRequest): Promise<any>;
}

interface EASTransactionProvider {
  estimateGas(tx: EASTransactionRequest): Promise<bigint>;
  call(tx: EASTransactionRequest): Promise<string>;
  resolveName(name: string): Promise<string>;
}

export class EASIntegration {
    private eas: EAS;
    private schemaRegistry: SchemaRegistry;
    private schemaEncoders: Map<SchemaType, SchemaEncoder>;
    private schemaUIDs: Map<SchemaType, string>;
    private offchain: Offchain;
    private signer?: Signer;

    constructor(provider: Provider) {
        this.eas = new EAS(EAS_CONTRACT_ADDRESS);
        this.schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
        
        this.eas.connect(provider as any);
        this.schemaRegistry.connect(provider as any);
        
        // Initialize schema encoders
        this.schemaEncoders = new Map();
        Object.entries(SCHEMAS).forEach(([key, schema]) => {
            this.schemaEncoders.set(key as SchemaType, new SchemaEncoder(schema));
        });
        
        this.schemaUIDs = new Map();
        
        // Initialize Offchain with correct config
        this.offchain = new Offchain(
            {
                address: EAS_CONTRACT_ADDRESS,
                version: "0.26",
                chainId: 11155111n,
            },
            OffchainAttestationVersion.Version2,
            this.eas
        );
    }

    async registerSchema(schemaType: SchemaType) {
        if (!this.schemaUIDs.has(schemaType)) {
            const transaction = await this.schemaRegistry.register({
                schema: SCHEMAS[schemaType],
                resolverAddress: ZeroAddress,
                revocable: true
            });

            await transaction.wait();
            
            const schemaUID = SchemaRegistry.getSchemaUID(
                SCHEMAS[schemaType],
                ZeroAddress,
                true
            );
            
            this.schemaUIDs.set(schemaType, schemaUID);
            return schemaUID;
        }
        return this.schemaUIDs.get(schemaType)!;
    }

    public async createMarketAttestation(
        marketId: number,
        title: string,
        description: string,
        endTime: number,
        isHyperLocal: boolean,
        latitude: number,
        longitude: number,
        totalStake: string,
        outcome: boolean,
        marketData: string,
        schemaType: string
    ): Promise<string> {
        if (!this.eas) {
            throw new Error("EAS not initialized");
        }

        const encodedData = this.encodeAttestationData({
            marketId,
            title,
            description,
            endTime,
            isHyperLocal,
            latitude,
            longitude,
            totalStake,
            outcome,
            marketData
        });

        const schemaUID = await this.getSchemaUID(schemaType);
        
        const tx = await this.eas.attest({
            schema: schemaUID,
            data: {
                recipient: ZeroAddress,
                expirationTime: BigInt(0),
                revocable: true,
                data: encodedData,
            },
        });

        const receipt = await tx.wait();
        return receipt;
    }

    private encodeAttestationData(data: any): string {
        // Use imported ethers
        return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JSON.stringify(data)));
    }

    private async getSchemaUID(schemaType: string): Promise<string> {
        // Use imported ethers
        return ethers.utils.id(schemaType);
    }

    async getAttestation(uid: string) {
        return await this.eas.getAttestation(uid);
    }

    setSigner(signer: Signer) {
        this.signer = signer;
        // Convert signer to EAS compatible signer
        const easSigner: EASTransactionSigner = {
            estimateGas: async (tx: EASTransactionRequest) => {
                const result = await signer.estimateGas(tx as any);
                return BigInt(result.toString());
            },
            call: async (tx: EASTransactionRequest) => {
                return signer.provider!.call(tx as any);
            },
            resolveName: async (name: string) => {
                const result = await signer.provider!.resolveName(name);
                return result || name;
            },
            sendTransaction: async (tx: EASTransactionRequest) => {
                return signer.sendTransaction(tx as any);
            }
        };
        
        this.eas.connect(easSigner as any);
    }
}