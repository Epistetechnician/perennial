import { useState, useEffect } from 'react';
import { notification } from "~~/utils/scaffold-eth";
import { useReadContract} from 'wagmi';
import deployedContracts from "~~/generated/deployedContracts";
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';

// Define types for the indexed data
interface IndexedPool {
  id: string;
  strategy: string;
  token: string;
  amount: string;
  metadata: {
    protocol: number;
    pointer: string;
  };
  profileId: string;
  profile?: {
    id: string;
    name: string;
  };
}

// Define the type for a pool node from the GraphQL response
interface PoolNode {
  id: string;
  strategy: string;
  token: string;
  amount: string;
  metadata?: {
    protocol: number;
    pointer: string;
  };
  profileId: string;
  profile?: {
    id: string;
    name: string;
  };
}

interface IndexerResponse {
  data: {
    alloPools: {
      nodes: PoolNode[];
    };
  };
}

// Get the ABI from deployedContracts
const perrenialPredictionABI = deployedContracts["11155111"][0].contracts.perennialprediction.abi;

export function useAllo() {
  const [pools, setPools] = useState<IndexedPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Update contract name to match the correct type
  const { data: deployedContractData } = useDeployedContractInfo("perennialprediction");

  // Read markets from the contract
  const { data: marketsData } = useReadContract({
    address: deployedContractData?.address,
    abi: perrenialPredictionABI,
    functionName: 'getMarket',
    args: [BigInt(1)]
  });

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        if (marketsData) {
          // Properly type and convert the market data
          const marketArray = Array.isArray(marketsData) ? marketsData : [marketsData];
          const transformedPools = marketArray.map((market: any, index: number): IndexedPool => ({
            id: index.toString(),
            strategy: market.predictionStrategy || '',
            token: market.token || '',
            amount: market.amount?.toString() || '0',
            metadata: {
              protocol: 1,
              pointer: market.metadata || '',
            },
            profileId: market.creator || '',
            profile: {
              id: market.creator || '',
              name: `Market ${index + 1}`,
            },
          }));

          console.log("Transformed markets:", transformedPools);
          setPools(transformedPools);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching markets:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch markets'));
        notification.error("Failed to fetch markets");
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [marketsData]);

  return { pools, loading, error };
}
