import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';

// Replace with the actual EAS contract address for your network
const EAS_CONTRACT_ADDRESS = "0x...";

// Replace with your actual schema
const SCHEMA = "string title,string description,uint256 endTime,bool isHyperLocal,int256 latitude,int256 longitude,bytes32 additionalData";

export class EASIntegration {
    private eas: EAS;
    private schemaEncoder: SchemaEncoder;

    constructor(provider: ethers.providers.Provider) {
        this.eas = new EAS(EAS_CONTRACT_ADDRESS);
        this.eas.connect(provider);
        this.schemaEncoder = new SchemaEncoder(SCHEMA);
    }

    async createAttestation(
        title: string,
        description: string,
        endTime: number,
        isHyperLocal: boolean,
        latitude: number,
        longitude: number,
        additionalData: string
    ): Promise<string> {
        const encodedData = this.schemaEncoder.encodeData([
            { name: "title", value: title, type: "string" },
            { name: "description", value: description, type: "string" },
            { name: "endTime", value: endTime, type: "uint256" },
            { name: "isHyperLocal", value: isHyperLocal, type: "bool" },
            { name: "latitude", value: latitude, type: "int256" },
            { name: "longitude", value: longitude, type: "int256" },
            { name: "additionalData", value: additionalData, type: "bytes32" }
        ]);

        const tx = await this.eas.attest({
            schema: EAS_CONTRACT_ADDRESS,
            data: {
                recipient: "0x0000000000000000000000000000000000000000",
                expirationTime: 0,
                revocable: true,
                data: encodedData,
            },
        });

        const newAttestationUID = await tx.wait();
        return newAttestationUID;
    }

    // Add more EAS-related functions as needed
}
