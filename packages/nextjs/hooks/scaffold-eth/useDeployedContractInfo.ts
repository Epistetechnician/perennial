import { useEffect, useState } from "react";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useIsMounted } from "usehooks-ts"; // Add this import

export const useDeployedContractInfo = (contractName: ContractName) => {
  const [data, setData] = useState<{ address: Address; abi: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();
  const isMounted = useIsMounted(); // Add this line

  useEffect(() => {
    const getDeployedContractInfo = async () => {
      try {
        // Your contract fetching logic here
        if (!isMounted()) return;
        setData({
          address: "0xdB67D1BD3bF01380992Fe9804e12813a54d5AaB7" as Address, // From your deployedContracts.ts
          abi: [] // Add your contract ABI here
        });
      } catch (error) {
        console.error("Error loading contract info:", error);
      } finally {
        if (isMounted()) setIsLoading(false);
      }
    };

    getDeployedContractInfo();
  }, [contractName, publicClient, isMounted]);

  return { data, isLoading };
};