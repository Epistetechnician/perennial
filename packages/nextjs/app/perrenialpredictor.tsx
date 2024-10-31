import React, { useState, useEffect, ErrorInfo, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts, useChainId, type Config } from 'wagmi';
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';
import { formatEther, parseEther, Hash } from 'viem';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Brain, Plus, Loader, Clock, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Address } from '~~/components/scaffold-eth';
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'wagmi/chains';
import { notification } from "~~/utils/scaffold-eth";
import AstralMap from '~~/components/AstralMap';
import { ethers } from 'ethers';
import { Allo, StrategyFactory, type CreatePoolArgs } from '@allo-team/allo-v2-sdk';
import { readContract, waitForTransactionReceipt, type WaitForTransactionReceiptParameters } from '@wagmi/core';
import { createConfig } from 'wagmi'
import { waitForTransactionReceiptQueryKey } from 'wagmi/query';
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { type ReadContractReturnType } from '@wagmi/core';
// Define types for Market and Stake
interface Market {
  id: number;
  title: string;
  description: string;
  endTime: bigint;
  isResolved: boolean;
  yesShares: bigint;
  noShares: bigint;
  totalStake: bigint;
  outcome: boolean;
  isHyperLocal: boolean;
  latitude: bigint;
  longitude: bigint;
  currentProbability: number;
  liquidityFlow: number;
  webTrend: number;
  aiTruth: number;
  marketSize: {
    current: number;
    min: number;
    max: number;
  };
  historicalData: { date: string; superMetric: number }[];
  marketType: number;
  minStake: bigint;
  maxStake: bigint;
  reputationRequired: bigint;
}

interface Stake {
  amount: number;
  position: 'yes' | 'no';
}

type TransactionHash = `0x${string}`;
interface WriteContractResult {
  hash: TransactionHash;
}

const getTransactionHash = (result: unknown): TransactionHash | null => {
  if (
    result &&
    typeof result === 'object' &&
    'hash' in result &&
    typeof result.hash === 'string' &&
    result.hash.startsWith('0x')
  ) {
    return result.hash as TransactionHash;
  }
  return null;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

async function createPool(title: string, description: string): Promise<number> {
  console.log(`Creating pool for: ${title}`);
  return Math.floor(Math.random() * 1000000); // Placeholder: return a random number as poolId
}

// Add type definitions for contract return types
interface MarketCore {
  title: string;
  description: string;
  endTime: bigint;
  isResolved: boolean;
  isHyperLocal: boolean;
  marketType: number;
}

interface MarketData {
  yesShares: bigint;
  noShares: bigint;
  totalStake: bigint;
  minStake: bigint;
  maxStake: bigint;
  reputationRequired: bigint;
  outcome: boolean;
}

interface MarketLocation {
  latitude: bigint;
  longitude: bigint;
  poolId: bigint;
  creator: string;
}

interface ContractData {
  core: MarketCore;
  data: MarketData;
  location: MarketLocation;
}

const fetchMarketData = async (marketId: bigint, contractData: any): Promise<ContractData> => {
  if (!contractData) {
    throw new Error("Contract data not available");
  }

  console.log("Contract ABI:", contractData.abi); // Log the ABI to check available functions

  // Use the correct function names from your smart contract
  const core = await readContract(config, {
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'marketCores', // Update this to match your contract function name
    args: [marketId]
  });

  const data = await readContract(config, {
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'marketData', // Update this to match your contract function name
    args: [marketId]
  });

  const location = await readContract(config, {
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'marketLocations', // Update this to match your contract function name
    args: [marketId]
  });

  return { 
    core: core as MarketCore, 
    data: data as MarketData, 
    location: location as MarketLocation 
  };
};

const processContractData = (data: any, type: 'core' | 'data' | 'location'): Partial<Market> => {
  switch (type) {
    case 'core':
      return {
        title: data.title,
        description: data.description,
        endTime: data.endTime,
        isResolved: data.isResolved,
        isHyperLocal: data.isHyperLocal,
        marketType: data.marketType
      };
    case 'data':
      return {
        yesShares: data.yesShares,
        noShares: data.noShares,
        totalStake: data.totalStake,
        minStake: data.minStake,
        maxStake: data.maxStake,
        reputationRequired: data.reputationRequired,
        outcome: data.outcome
      };
    case 'location':
      return {
        latitude: data.latitude,
        longitude: data.longitude
      };
    default:
      return {};
  }
};

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const PerennialPredictor: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userStakes, setUserStakes] = useState<Record<string, Stake>>({});
  const [newMarket, setNewMarket] = useState({
    title: '',
    description: '',
    endTime: '',
    isHyperLocal: false,
    latitude: 0,
    longitude: 0
  });
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionType, setPredictionType] = useState<'yes' | 'no'>('yes');
  const [stakeAmount, setStakeAmount] = useState('0.1');
  const [showMap, setShowMap] = useState(false);
  const [isCreateMarketLoading, setIsCreateMarketLoading] = useState(false);

  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [currentMarketCount, setCurrentMarketCount] = useState<bigint>(BigInt(0));

  const { address } = useAccount();
  const chainId = useChainId();

  const { data: deployedContractData, isLoading: isContractLoading } = useDeployedContractInfo("perennialprediction");

  const { data: marketCount, isError: isMarketCountError, error: marketCountError } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'marketCount',
  });

  useEffect(() => {
    console.log("Contract data:", deployedContractData);
    console.log("Market count:", marketCount);
    console.log("Market count error:", marketCountError);

    if (marketCount) {
      setCurrentMarketCount(marketCount as bigint);
    }
  }, [deployedContractData, marketCount, marketCountError]);

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!deployedContractData?.address || !currentMarketCount || currentMarketCount === BigInt(0)) {
        console.log("Not fetching markets. Contract address:", deployedContractData?.address, "Market count:", currentMarketCount);
        return;
      }
      
      setIsLoadingMarkets(true);
      try {
        console.log("Fetching markets. Count:", currentMarketCount);
        const marketPromises = Array.from(
          { length: Number(currentMarketCount) },
          (_, i) => fetchMarketData(BigInt(i + 1), deployedContractData)
        );

        const marketsData = await Promise.all(marketPromises);
        
        const processedMarkets = marketsData.map((data, index) => ({
          id: index + 1,
          ...processContractData(data.core, 'core'),
          ...processContractData(data.data, 'data'),
          ...processContractData(data.location, 'location'),
          currentProbability: Math.random(),
          liquidityFlow: Math.random() * 2000,
          webTrend: Math.random(),
          aiTruth: Math.random(),
          marketSize: {
            current: Number(formatEther(data.data.totalStake)),
            min: 1000,
            max: 10000,
          },
          historicalData: Array.from({ length: 30 }, (_, index) => ({
            date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            superMetric: Math.random(),
          })),
        })) as Market[];

        console.log("Processed markets:", processedMarkets);
        setMarkets(processedMarkets);
      } catch (error) {
        console.error("Error loading markets:", error);
        notification.error("Failed to load markets");
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, [deployedContractData, currentMarketCount, chainId]);

  const { writeContract } = useWriteContract();

  const { data: marketsData, isError: isMarketsError, error: marketsError } = useReadContracts({
    contracts: Array.from({ length: Number(marketCount) || 0 }, (_, i) => ({
      address: deployedContractData?.address,
      abi: deployedContractData?.abi,
      functionName: 'marketCores', // Update this to match your contract function name
      args: [BigInt(i + 1)],
    })),
  });

  useEffect(() => {
    if (marketsData && !isMarketsError) {
      const processedMarkets = marketsData.map((data, index) => {
        if (data.result && Array.isArray(data.result)) {
          return {
            id: index + 1,
            title: data.result[0] as string || `Untitled Market ${index + 1}`,
            description: data.result[1] as string || '',
            endTime: BigInt(data.result[2] as string || '0'),
            isResolved: Boolean(data.result[3]),
            yesShares: BigInt(data.result[4] as string || '0'),
            noShares: BigInt(data.result[5] as string || '0'),
            totalStake: BigInt(data.result[6] as string || '0'),
            outcome: Boolean(data.result[7]),
            isHyperLocal: Boolean(data.result[8]),
            latitude: BigInt(data.result[9] as string || '0'),
            longitude: BigInt(data.result[10] as string || '0'),
            currentProbability: Math.random(),
            liquidityFlow: Math.random() * 2000,
            webTrend: Math.random(),
            aiTruth: Math.random(),
            marketSize: {
              current: Number(formatEther(BigInt(data.result[6] as string || '0'))),
              min: 1000,
              max: 10000,
            },
            historicalData: Array.from({ length: 30 }, (_, index) => ({
              date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              superMetric: Math.random(),
            })),
            marketType: 0,
            minStake: parseEther("0.01"),
            maxStake: parseEther("100"),
            reputationRequired: BigInt(1)
          } as Market;
        }
        return null;
      }).filter((market): market is Market => market !== null);

      setMarkets(processedMarkets);
    } else if (isMarketsError) {
      console.error("Error fetching markets:", marketsError);
    }
  }, [marketsData, isMarketsError, marketsError]);

  const [pendingTxHash, setPendingTxHash] = useState<TransactionHash | undefined>();

  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  // Add this validation before creating market
  const validateMarketParams = (params: any) => {
    if (!params.title || params.title.trim() === '') throw new Error('Title is required');
    if (!params.description || params.description.trim() === '') throw new Error('Description is required');
    if (!params.endTime) throw new Error('End time is required');
    
    const endTimeUnix = Math.floor(new Date(params.endTime).getTime() / 1000);
    if (endTimeUnix <= Math.floor(Date.now() / 1000)) {
      throw new Error('End time must be in the future');
    }

    if (params.isHyperLocal) {
      if (params.latitude < -90 || params.latitude > 90) throw new Error('Invalid latitude');
      if (params.longitude < -180 || params.longitude > 180) throw new Error('Invalid longitude');
    }
  };

  const handleCreateMarket = async () => {
    if (!writeContract || !deployedContractData) {
      notification.error("Contract not initialized");
      return;
    }

    try {
      setIsCreateMarketLoading(true);
      notification.info("Preparing to create market...");

      const endTimeUnix = Math.floor(new Date(newMarket.endTime || Date.now() + 86400000).getTime() / 1000);

      const marketParams = {
        title: newMarket.title || "Test Market",
        description: newMarket.description || "Test Description",
        endTime: BigInt(endTimeUnix),
        isHyperLocal: newMarket.isHyperLocal,
        latitude: BigInt(Math.round(newMarket.latitude * 1e18)),
        longitude: BigInt(Math.round(newMarket.longitude * 1e18)),
        marketType: 0,
        minStake: parseEther("0.01"),
        maxStake: parseEther("100"),
        reputationRequired: BigInt(0)
      };

      console.log("Creating market with params:", marketParams);

      const hash = await writeContract({
        address: deployedContractData.address as `0x${string}`,
        abi: deployedContractData.abi,
        functionName: 'createMarket',
        args: [marketParams],
      }) as unknown as { hash: `0x${string}` };

      notification.info("Transaction sent. Waiting for confirmation...");
      
      const receipt = await waitForTransactionReceipt(config, {
        hash: hash.hash,
        confirmations: 1,
        timeout: 60_000,
      });

      console.log("Transaction receipt:", receipt);

      if (receipt.status === 'success') {
        notification.success("Market created successfully!");
        setShowCreateModal(false);
        setNewMarket({
          title: '',
          description: '',
          endTime: '',
          isHyperLocal: false,
          latitude: 0,
          longitude: 0
        });

        // Update market count
        const newCount = await readContract(config, {
          address: deployedContractData.address as `0x${string}`,
          abi: deployedContractData.abi,
          functionName: 'marketCount',
        });
    
        if (newCount) {
          setCurrentMarketCount(newCount as bigint);
        }
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error creating market:", error);
      notification.error("Failed to create market: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsCreateMarketLoading(false);
    }
  };

  const handleStake = (market: Market, type: 'yes' | 'no') => {
    setSelectedMarket(market);
    setPredictionType(type);
    setShowPredictionModal(true);
  };

  const handleUnstake = async (marketId: number, amount: number) => {
    console.log(`Unstaking ${amount} from market ${marketId}`);
  };

  const addMarketCreator = async (creatorAddress: string) => {
    if (writeContract && deployedContractData) {
      try {
        console.log("Adding market creator:", creatorAddress);
        const result = await writeContract({
          address: deployedContractData.address,
          abi: deployedContractData.abi,
          functionName: 'addMarketCreator',
          args: [creatorAddress],
        });
        console.log("Market creator added:", result);
      } catch (error: any) {
        console.error("Detailed error:", error);
        if (error.message) {
          if (error.message.includes("Invalid creator address")) {
            setError("Failed to add market creator: Invalid address provided");
          } else if (error.message.includes("Address is already a market creator")) {
            setError("This address is already a market creator");
          } else if (error.message.includes("Caller is not the contract owner")) {
            setError("Only the contract owner can add market creators");
          } else {
            setError("Failed to add market creator: " + error.message);
          }
        } else {
          setError("An unknown error occurred while adding the market creator");
        }
      }
    }
  };

  const { data: owner } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'owner',
  });

  const checkOwnership = () => {
    console.log("Contract owner:", owner);
    console.log("Current address:", address);
    if (typeof owner === 'string' && typeof address === 'string') {
      if (owner.toLowerCase() !== address.toLowerCase()) {
        console.warn("Current address is not the contract owner");
        setError("You are not the contract owner. Only the owner can add market creators.");
      }
    } else {
      console.warn("Owner or address is not a string");
      setError("Unable to verify ownership. Please check your connection.");
    }
  };

  useEffect(() => {
    if (owner !== undefined && address !== undefined) {
      checkOwnership();
    }
  }, [owner, address]);

  const checkContractDeployment = async () => {
    try {
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      if (!publicClient) {
        throw new Error("Unable to create public client");
      }
      
    } catch (error) {
      console.error('Error checking contract deployment:', error);
      setError('Error checking contract deployment: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  useEffect(() => {
    checkContractDeployment();
  }, [deployedContractData]);

  const checkContractBalance = async () => {
    try {
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      if (!publicClient) {
        throw new Error("Unable to create public client");
      }
      
      if (deployedContractData?.address) {
        const balance = await publicClient.getBalance({ address: deployedContractData.address });
        console.log('Contract ETH balance:', formatEther(balance));
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error checking contract balance:', error);
      setError('Error checking contract balance');
    }
  };

  useEffect(() => {
    checkContractBalance();
  }, [deployedContractData]);

  const fundContractWithEth = async (amount: string) => {
    if (writeContract && deployedContractData) {
      try {
        const parsedValue = parseEther(amount);
        const marketId = BigInt(1); // Example market ID
        const isYes = true; // Example position
        const shares = BigInt(1); // Example shares amount
        const isAdd = true; // Example: true for adding shares

        const result = await writeContract({
          address: deployedContractData.address,
          abi: deployedContractData.abi,
          functionName: 'tradeShares',
          args: [marketId, isYes, shares, isAdd],
          value: parsedValue,
        });

        const hash = getTransactionHash(result);
        if (hash) {
          console.log("ETH funding transaction hash:", hash);
          setPendingTxHash(hash);
          notification.info("Transaction sent. Waiting for confirmation...");
          await useWaitForTransactionReceipt({ hash });
          notification.success("Contract funded successfully!");
          checkContractBalance();
        } else {
          throw new Error("Failed to get transaction hash");
        }
      } catch (error) {
        console.error("Error funding contract with ETH:", error);
        setError("Failed to fund contract with ETH: " + (error instanceof Error ? error.message : String(error)));
        notification.error("Failed to fund contract with ETH");
      }
    }
  };

  const calculateSuperMetric = (probability: number, liquidity: number, webTrend: number, aiTruth: number) => {
    const weights = { probability: 0.3, liquidity: 0.2, webTrend: 0.2, aiTruth: 0.3 };
    return (
      probability * weights.probability +
      (liquidity / 2000) * weights.liquidity +
      webTrend * weights.webTrend +
      aiTruth * weights.aiTruth
    );
  };

  const handleConfirmPrediction = async () => {
    if (!selectedMarket || !writeContract || !deployedContractData) {
      notification.error("Unable to process prediction");
      return;
    }

    try {
      const stakeAmountBigInt = parseEther(stakeAmount);
      
      notification.info("Processing your prediction...");

      const hash = await writeContract({
        address: deployedContractData.address as `0x${string}`,
        abi: deployedContractData.abi,
        functionName: 'tradeShares',
        args: [
          BigInt(selectedMarket.id),
          predictionType === 'yes',
          stakeAmountBigInt,
          true
        ],
        value: stakeAmountBigInt
      }) as unknown as { hash: `0x${string}` };

      notification.info("Confirming your prediction...");
      
      const receipt = await waitForTransactionReceipt(config, {
        hash: hash.hash,
        confirmations: 1,
        timeout: 60_000,
      });

      if (receipt.status === 'success') {
        // Update local state to reflect the new stake
        setUserStakes(prev => ({
          ...prev,
          [selectedMarket.id]: {
            amount: Number(formatEther(stakeAmountBigInt)),
            position: predictionType
          }
        }));

        // Fetch updated market data
        const updatedMarketData = await fetchMarketData(BigInt(selectedMarket.id), deployedContractData);
        
        // Update markets state with new data
        setMarkets(prevMarkets => 
          prevMarkets.map(market => 
            market.id === selectedMarket.id 
              ? {
                  ...market,
                  yesShares: updatedMarketData.data.yesShares,
                  noShares: updatedMarketData.data.noShares,
                  totalStake: updatedMarketData.data.totalStake,
                  currentProbability: predictionType === 'yes' 
                    ? Number(updatedMarketData.data.yesShares) / Number(updatedMarketData.data.totalStake)
                    : Number(updatedMarketData.data.noShares) / Number(updatedMarketData.data.totalStake)
                }
              : market
          )
        );

        notification.success(`Successfully staked ${stakeAmount} ETH on ${predictionType.toUpperCase()}`);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error processing prediction:", error);
      notification.error("Failed to process prediction: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setShowPredictionModal(false);
      setStakeAmount('0.1');
    }
  };

  // Add this function to render user positions in the market card
  const renderUserPosition = (market: Market) => {
    const userStake = userStakes[market.id];
    if (!userStake) return null;

    const stakedAmount = userStake.amount;
    const position = userStake.position;
    const currentValue = position === 'yes' 
      ? (Number(market.yesShares) / Number(market.totalStake)) * stakedAmount
      : (Number(market.noShares) / Number(market.totalStake)) * stakedAmount;

    return (
      <div className="bg-gray-700 p-3 rounded-lg mt-4">
        <h4 className="text-green-400 font-semibold mb-2">Your Position</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-400">Staked</p>
            <p className="text-white">{stakedAmount} ETH</p>
          </div>
          <div>
            <p className="text-gray-400">Position</p>
            <p className={position === 'yes' ? 'text-green-400' : 'text-red-400'}>
              {position.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Current Value</p>
            <p className="text-white">{currentValue.toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-gray-400">P/L</p>
            <p className={currentValue >= stakedAmount ? 'text-green-400' : 'text-red-400'}>
              {((currentValue - stakedAmount) / stakedAmount * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectCard = (market: Market) => {
    console.log("Rendering market:", market);
    const superMetric = calculateSuperMetric(
      market.currentProbability,
      market.liquidityFlow,
      market.webTrend,
      market.aiTruth
    );

    const timeLeft = Math.max(0, Number(market.endTime) - Math.floor(Date.now() / 1000));
    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
    const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

    return (
      <div key={market.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(80,200,120,0.3)]">
        <h3 className="font-bold text-2xl text-green-400 mb-3">{market.title}</h3>
        <p className="text-gray-300 mb-4 h-20 overflow-hidden">{market.description}</p>
        <div className="mb-6 h-64 bg-gray-700 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={market.historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.375rem' }} 
                labelStyle={{ color: '#A0AEC0' }}
                itemStyle={{ color: '#68D391' }}
              />
              <Line type="monotone" dataKey="superMetric" stroke="#68D391" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-400 mb-1">Market Size</p>
            <p className="font-semibold text-white">{market.marketSize.current.toFixed(2)} / {market.marketSize.max} ETH</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-400 mb-1">Current Price</p>
            <p className="font-semibold text-green-400">{superMetric.toFixed(4)}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg flex items-center">
            <Activity size={16} className="mr-2 text-blue-400" />
            <div>
              <p className="text-gray-400">Liquidity Flow</p>
              <p className="font-semibold text-white">{market.liquidityFlow.toFixed(2)} ETH</p>
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg flex items-center">
            <Brain size={16} className="mr-2 text-purple-400" />
            <div>
              <p className="text-gray-400">AI Truth</p>
              <p className="font-semibold text-white">{(market.aiTruth * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-yellow-400" />
            <span className="text-gray-300">{daysLeft}d {hoursLeft}h left</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-2 text-indigo-400" />
            <span className="text-gray-300">{(Number(market.yesShares) + Number(market.noShares))} participants</span>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => handleStake(market, 'yes')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300"
          >
            <TrendingUp size={16} className="mr-2" />
            Yes
          </button>
          <button
            onClick={() => handleStake(market, 'no')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300"
          >
            <TrendingDown size={16} className="mr-2" />
            No
          </button>
        </div>
        {/* Add user position display */}
        {renderUserPosition(market)}
      </div>
    );
  };

  console.log("Rendering component, markets:", markets);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  const allo = useMemo(() => {
    if (deployedContractData) {
      return new Allo({
        chain: 11155111, // Sepolia chain ID
        rpc: "https://eth-sepolia.g.alchemy.com/v2/v1xYDxKvq2STQTy8WPBL-ZwuzkWTh4K9"
      });
    }
    return null;
  }, [deployedContractData]);

  const createMarketAndPool = async () => {
    if (!allo || !deployedContractData) {
      console.error("Allo SDK not initialized or contract data missing");
      return;
    }

    try {
      const endTimeUnix = Math.floor(new Date(newMarket.endTime).getTime() / 1000);
      const marketParams = {
        title: newMarket.title,
        description: newMarket.description,
        endTime: BigInt(endTimeUnix),
        isHyperLocal: newMarket.isHyperLocal,
        latitude: BigInt(Math.round(newMarket.latitude * 1e6)),
        longitude: BigInt(Math.round(newMarket.longitude * 1e6)),
        marketType: 0,
        minStake: parseEther("0.01"),
        maxStake: parseEther("100"),
        reputationRequired: BigInt(1)
      };

      const createMarketTx = await writeContract({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: 'createMarket',
        args: [marketParams]
      });

      if (typeof createMarketTx === 'string') {
        await useWaitForTransactionReceipt({ hash: createMarketTx });
      } else {
        throw new Error("Transaction failed to return a hash");
      }

      const createPoolData: CreatePoolArgs = {
        profileId: "0x...",
        strategy: deployedContractData.address,
        initStrategyData: ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256', 'string', 'uint256'],
          [Number(marketCount), newMarket.title, BigInt(Math.floor(new Date(newMarket.endTime).getTime() / 1000))]
        ) as `0x${string}`,
        token: "0x0000000000000000000000000000000000000000",
        amount: parseEther("0"),
        metadata: {
          protocol: BigInt(1),
          pointer: "ipfs://...",
        },
        managers: [deployedContractData.address],
      };

      const poolId = await allo.createPool(createPoolData);
      console.log("Pool created with ID:", poolId);

    } catch (error) {
      console.error("Error creating market and pool:", error);
    }
  };

  useEffect(() => {
    if (txReceipt) {
      notification.success("Transaction confirmed!");
      setPendingTxHash(undefined);
    }
  }, [txReceipt]);

  useEffect(() => {
    console.log("Contract ABI:", deployedContractData?.abi);
  }, [deployedContractData]);

  useEffect(() => {
    console.log("Deployed Contract Data:", deployedContractData);
  }, [deployedContractData]);

  const renderPredictionModal = () => {
    if (!selectedMarket) return null;

    const currentStake = userStakes[selectedMarket.id];
    const probability = predictionType === 'yes' 
      ? Number(selectedMarket.yesShares) / (Number(selectedMarket.yesShares) + Number(selectedMarket.noShares)) * 100 
      : Number(selectedMarket.noShares) / (Number(selectedMarket.yesShares) + Number(selectedMarket.noShares)) * 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center justify-between">
            Make Your Prediction
            <button 
              onClick={() => setShowPredictionModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400">{selectedMarket.title}</h3>
              <p className="text-sm text-gray-300">{selectedMarket.description}</p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Your Prediction:</span>
                <span className={predictionType === 'yes' ? 'text-green-400' : 'text-red-400'}>
                  {predictionType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Current Probability:</span>
                <span className="text-blue-400">{probability.toFixed(2)}%</span>
              </div>
              {currentStake && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Your Current Stake:</span>
                  <span className="text-purple-400">
                    {currentStake.amount} ETH on {currentStake.position.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Stake Amount (ETH)</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="Enter stake amount..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPredictionModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPrediction}
                className={`px-4 py-2 rounded text-white transition-colors ${
                  predictionType === 'yes' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm {predictionType.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6 bg-gray-900 text-white rounded-lg">
        {isContractLoading ? (
          <div>Loading contract data...</div>
        ) : deployedContractData ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">Perennial Predictions</h1>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-500 text-white hover:bg-green-600 flex items-center px-4 py-2 rounded"
              >
                <Plus size={20} className="mr-2" />
                Create Market
              </button>
            </div>

            {error && <div className="bg-red-900 border-red-700 p-4 rounded"><p>{error}</p></div>}

            {isLoadingMarkets ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Loading markets...</p>
              </div>
            ) : markets.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">No markets available. Create one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {markets.map(renderProjectCard)}
              </div>
            )}

            <div className="bg-yellow-900 border-yellow-700 p-4 rounded mt-6">
              <h3 className="flex items-center text-yellow-300 font-semibold mb-2">
                <AlertTriangle className="mr-2" />
                Important Notes
              </h3>
              <ul className="list-disc list-inside text-yellow-100">
                <li>Minimum project stake: 20% of prediction market position</li>
                <li>Stake-to-prediction ratio must be maintained throughout market lifetime</li>
                <li>Early unstaking penalties apply to prevent abandonment</li>
                <li>Additional staking opportunities available throughout project lifecycle</li>
              </ul>
            </div>

            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Create New Prediction Market</h2>
                  <input
                    type="text"
                    placeholder="Market Title"
                    className="w-full p-2 mb-4 bg-gray-700 rounded"
                    value={newMarket.title}
                    onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Market Description"
                    className="w-full p-2 mb-4 bg-gray-700 rounded"
                    value={newMarket.description}
                    onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    className="w-full p-2 mb-4 bg-gray-700 rounded"
                    value={newMarket.endTime}
                    onChange={(e) => setNewMarket({ ...newMarket, endTime: e.target.value })}
                  />
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isHyperLocal"
                      className="mr-2"
                      checked={newMarket.isHyperLocal}
                      onChange={(e) => {
                        setNewMarket({ ...newMarket, isHyperLocal: e.target.checked });
                        setShowMap(e.target.checked);
                      }}
                    />
                    <label htmlFor="isHyperLocal">Is Hyper Local?</label>
                  </div>
                  {newMarket.isHyperLocal && (
                    <>
                      <div className="mb-4 h-[400px] rounded-lg overflow-hidden relative" style={{ border: '2px solid #4a5568' }}>
                        <AstralMap
                          onLocationSelect={(lat, lng) => {
                            setNewMarket({ 
                              ...newMarket, 
                              latitude: lat, 
                              longitude: lng 
                            });
                          }}
                        />
                      </div>
                      <div className="mb-4 text-gray-300">
                        <p>Selected Location:</p>
                        <p>Latitude: {newMarket.latitude.toFixed(6)}°</p>
                        <p>Longitude: {newMarket.longitude.toFixed(6)}°</p>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
                      onClick={handleCreateMarket}
                      disabled={isCreateMarketLoading}
                    >
                      {isCreateMarketLoading ? <Loader className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => fundContractWithEth('0.1')}>Fund Contract with 0.001 ETH</button>
          </>
        ) : (
          <div>Contract not found or not deployed.</div>
        )}
      </div>
      {showPredictionModal && renderPredictionModal()}
    </ErrorBoundary>
  );
};

export default PerennialPredictor;
