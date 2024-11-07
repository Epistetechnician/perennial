'use client';

import * as dotenv from "dotenv"
dotenv.config();
import { useState, useEffect, ErrorInfo, useMemo } from 'react';
import type { FC } from 'react';
import { useAccount, useWriteContract, useChainId, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth/useDeployedContractInfo';
import { useIsMounted } from "usehooks-ts";
import { formatEther, parseEther, type Hash, type TransactionReceipt, type TransactionRequest, createWalletClient, http, type Chain } from 'viem';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Brain, Plus, Loader, Clock, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Address } from '~~/components/scaffold-eth';
import { notification } from "~~/utils/scaffold-eth";
import AstralMap from '~~/components/AstralMap';
import { ethers } from 'ethers';
import { Allo, type CreatePoolArgs } from '@allo-team/allo-v2-sdk';
import { EASIntegration } from "../../hardhat/src/eas-integration";
import { useRouter } from 'next/navigation';
import { type ContractName } from "~~/utils/scaffold-eth/contract";
import { AbiCoder } from "ethers";
import { useReadContract, useContractRead, useContractWrite, useContractReads } from 'wagmi';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import type { ReadContractParameters, Config } from '@wagmi/core';
import deployedContracts from "~~/generated/deployedContracts";
import { getContract } from 'viem';

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
  currentProbability: number;
  liquidityFlow: number;
  webTrend: number;
  aiTruth: number;
  marketSize: {
    current: number;
    min: number;
    max: number;
  };
  historicalData: Array<{ date: string; superMetric: number }>;
  poolId?: number;
  marketType: number;
  minStake: bigint;
  maxStake: bigint;
  reputationRequired: bigint;
  isHyperLocal: boolean;
  latitude: bigint;
  longitude: bigint;
}

interface Stake {
  amount: number;
  position: 'yes' | 'no';
}

type TransactionHash = `0x${string}`;

interface TransactionResult {
  hash: TransactionHash;
  wait: () => Promise<TransactionReceipt>;
}

// Move ErrorBoundary to a separate client component file
export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <h1>Something went wrong.</h1>;
  }

  return <>{children}</>;
};

// Explicitly declare the component as a client component
const PerennialPredictor: FC = () => {
  const router = useRouter();
  const isMounted = useIsMounted();

  // Update account usage
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [marketsList, setMarketsList] = useState<Market[]>([]);
  const [userStakes, setUserStakes] = useState<Record<string, Stake>>({});
  const [newMarket, setNewMarket] = useState<NewMarketState>({
    title: '',
    description: '',
    endTime: '',
    isHyperLocal: false,
    latitude: 0,
    longitude: 0,
    marketType: 0,
    minStake: "0.001",
    maxStake: "100",
    reputationRequired: BigInt(1)
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

  // Add type for deployedContractData
  interface DeployedContractData {
    address: `0x${string}`;
    abi: any[];
    name: string;
  }

  // Update the useDeployedContractInfo call with proper typing
  const { data: deployedContractData, isLoading: isContractLoading } = useDeployedContractInfo(
    "perennialprediction" as ContractName
  ) as { data: DeployedContractData | null; isLoading: boolean };

  interface MarketCoreResponse {
    title: string;
    description: string;
    endTime: bigint;
    isResolved: boolean;
    isHyperLocal: boolean;
    marketType: number;
  }

  interface MarketDataResponse {
    yesShares: bigint;
    noShares: bigint;
    totalStake: bigint;
    minStake: bigint;
    maxStake: bigint;
    reputationRequired: bigint;
    outcome: boolean;
  }

  interface MarketLocationResponse {
    latitude: bigint;
    longitude: bigint;
  }

  interface MarketDetailsReturn {
    core: MarketCoreResponse | undefined;
    marketData: MarketDataResponse | undefined;
    location: MarketLocationResponse | undefined;
    isError: boolean;
    isLoading: boolean;
  }

  const wagmiPublicClient = usePublicClient();

  // Add these interfaces for contract return types
  interface MarketCoreData {
    title: string;
    description: string;
    endTime: bigint;
    isResolved: boolean;
    isHyperLocal: boolean;
    marketType: string | number;
  }

  interface MarketDataStruct {
    yesShares: bigint;
    noShares: bigint;
    totalStake: bigint;
    minStake: bigint;
    maxStake: bigint;
    reputationRequired: bigint;
    outcome: boolean;
  }

  interface MarketLocationData {
    latitude: bigint;
    longitude: bigint;
  }

  // Update the market count read
  const { data: marketCount } = useReadContract({
    address: deployedContracts["11155111"][0].contracts.perennialprediction.address,
    abi: deployedContracts["11155111"][0].contracts.perennialprediction.abi,
    functionName: 'marketCount'
  });

  // Add this useEffect to log the market count
  useEffect(() => {
    console.log("Market count:", marketCount);
  }, [marketCount]);

  // Update the market fetching logic with proper typing
  useEffect(() => {
    const fetchMarkets = async () => {
      if (!wagmiPublicClient || !marketCount) {
        setIsLoadingMarkets(false); // Set loading to false if dependencies aren't ready
        return;
      }

      setIsLoadingMarkets(true);
      try {
        const count = Number(marketCount);
        console.log("Attempting to fetch", count, "markets");

        // Create a single market for testing
        const testMarket = {
          id: 1,
          title: "Test Market",
          description: "This is a test market",
          endTime: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
          isResolved: false,
          yesShares: BigInt(0),
          noShares: BigInt(0),
          totalStake: BigInt(0),
          outcome: false,
          currentProbability: 0.5,
          liquidityFlow: Math.random() * 2000,
          webTrend: Math.random(),
          aiTruth: Math.random(),
          marketSize: {
            current: 0,
            min: 0.001,
            max: 100,
          },
          historicalData: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            superMetric: Math.random(),
          })),
          marketType: 0,
          minStake: parseEther("0.001"),
          maxStake: parseEther("100"),
          reputationRequired: BigInt(1),
          isHyperLocal: false,
          latitude: BigInt(0),
          longitude: BigInt(0),
        };

        setMarketsList([testMarket]);
        setIsLoadingMarkets(false);

      } catch (error) {
        console.error("Error in fetchMarkets:", error);
        notification.error("Failed to fetch markets");
        setIsLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, [wagmiPublicClient, marketCount]);

  // Type definitions
  interface NewMarketState {
    title: string;
    description: string;
    endTime: string;
    isHyperLocal: boolean;
    latitude: number;
    longitude: number;
    marketType: number;
    minStake: string;
    maxStake: string;
    reputationRequired: bigint;
  }

  interface ContractWriteFunction {
    (config: {
      functionName: string;
      args: readonly any[];
      value?: bigint;
    }): Promise<{ hash: `0x${string}` }>;
  }

  interface TradeSharesFunction {
    (config: {
      functionName: 'tradeShares';
      args: readonly [string, string, string];
      value: bigint;
    }): Promise<{ hash: `0x${string}` }>;
  }

  interface MarketData {
    core: {
      title: string;
      description: string;
      endTime: bigint;
      isResolved: boolean;
      isHyperLocal: boolean;
      marketType: number;
    };
    data: {
      yesShares: bigint;
      noShares: bigint;
      totalStake: bigint;
      minStake: bigint;
      maxStake: bigint;
      reputationRequired: bigint;
      outcome: boolean;
    };
    location: {
      latitude: bigint;
      longitude: bigint;
    };
  }

  // Helper functions
  interface ContractReadConfig extends Omit<ReadContractParameters, 'chainId'> {
    address: `0x${string}`;
    abi: any;
    functionName: string;
    args: readonly any[];
    chainId?: number;
  }

  const processContractData = (
    marketData: MarketData,
    type: 'core' | 'data' | 'location',
  ): Partial<Market> => {
    switch (type) {
      case 'core':
        return {
          title: marketData.core.title,
          description: marketData.core.description,
          endTime: marketData.core.endTime,
          isResolved: marketData.core.isResolved,
          isHyperLocal: marketData.core.isHyperLocal,
          marketType: marketData.core.marketType,
        };
      case 'data':
        return {
          yesShares: marketData.data.yesShares,
          noShares: marketData.data.noShares,
          totalStake: marketData.data.totalStake,
          minStake: marketData.data.minStake,
          maxStake: marketData.data.maxStake,
          reputationRequired: marketData.data.reputationRequired,
          outcome: marketData.data.outcome,
        };
      case 'location':
        return {
          latitude: marketData.location.latitude,
          longitude: marketData.location.longitude,
        };
      default:
        return {};
    }
  };

  // Create config before the component

  // Add these interface definitions at the top of the file, before the component
  interface MarketCoreReturn {
    data: readonly [
      string,    // title
      string,    // description
      bigint,    // endTime
      boolean,   // isResolved
      boolean,   // isHyperLocal
      number     // marketType
    ];
  }

  interface MarketDataReturn {
    data: readonly [
      bigint,    // yesShares
      bigint,    // noShares
      bigint,    // totalStake
      bigint,    // minStake
      bigint,    // maxStake
      bigint,    // reputationRequired
      boolean    // outcome
    ];
  }

  interface MarketLocationReturn {
    data: readonly [
      bigint,    // latitude
      bigint     // longitude
    ];
  }

  // Then update the useMarketData hook to use these types
  const useMarketData = (marketId: bigint, contractData: any) => {
    const { data: core } = useReadContract({
      address: contractData?.address as `0x${string}`,
      abi: contractData?.abi,
      functionName: 'marketCores',
      args: [marketId],
    });

    const { data: marketData } = useReadContract({
      address: contractData?.address as `0x${string}`,
      abi: contractData?.abi,
      functionName: 'marketData',
      args: [marketId],
    });

    const { data: location } = useReadContract({
      address: contractData?.address as `0x${string}`,
      abi: contractData?.abi,
      functionName: 'marketLocations',
      args: [marketId],
    });

    return { core, marketData, location };
  };

  // First, define proper interfaces for the contract return types
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
  }

  // Update the useMarketDetails hook with proper typing
  const useMarketDetails = (marketId: bigint) => {
    const { data: core, isError: isCoreError } = useReadContract({
      address: deployedContractData?.address as `0x${string}`,
      abi: deployedContractData?.abi,
      functionName: 'marketCores',
      args: [marketId],
    });

    const { data: marketData, isError: isMarketDataError } = useReadContract({
      address: deployedContractData?.address as `0x${string}`,
      abi: deployedContractData?.abi,
      functionName: 'marketData',
      args: [marketId],
    });

    const { data: location, isError: isLocationError } = useReadContract({
      address: deployedContractData?.address as `0x${string}`,
      abi: deployedContractData?.abi,
      functionName: 'marketLocations',
      args: [marketId],
    });

    return {
      core: core as MarketCore,
      marketData: marketData as MarketData,
      location: location as MarketLocation,
      isError: isCoreError || isMarketDataError || isLocationError,
      isLoading: !core || !marketData || !location,
    };
  };
  interface CreateMarketArgs {
    title: string;
    description: string;
    endTime: bigint;
    isHyperLocal: boolean;
    latitude: bigint;
    longitude: bigint;
    marketType: number;
    minStake: bigint;
    maxStake: bigint;
    reputationRequired: bigint;
  }

  // Add this debug log to check the ABI
  useEffect(() => {
    if (deployedContractData?.abi) {
      console.log("Contract ABI:", deployedContractData.abi);
      // Log available functions
      const functions = deployedContractData.abi
        .filter((item: any) => item.type === 'function')
        .map((fn: any) => fn.name);
      console.log("Available functions:", functions);
    }
  }, [deployedContractData?.abi]);

  // Update the contract write hook to use the correct type
  const { writeContract: createMarket } = useWriteContract();

  // Update the handleCreateMarket function
  const handleCreateMarket = async () => {
    if (!createMarket) {
      notification.error("Contract not initialized");
      return;
    }

    try {
      setIsCreateMarketLoading(true);
      
      // Validate inputs
      if (!newMarket.title || !newMarket.description || !newMarket.endTime) {
        throw new Error("Please fill in all required fields");
      }

      const endTimeUnix = Math.floor(new Date(newMarket.endTime).getTime() / 1000);
      if (endTimeUnix <= Math.floor(Date.now() / 1000)) {
        throw new Error("End time must be in the future");
      }

      createMarket({
        abi: deployedContracts["11155111"][0].contracts.perennialprediction.abi,
        address: deployedContracts["11155111"][0].contracts.perennialprediction.address,
        functionName: 'createMarket',
        args: [
          newMarket.title,
          newMarket.description,
          BigInt(endTimeUnix),
          newMarket.isHyperLocal,
          BigInt(Math.round(newMarket.latitude * 1e6)),
          BigInt(Math.round(newMarket.longitude * 1e6)),
          parseEther(newMarket.minStake),
          parseEther(newMarket.maxStake)
        ],
      });

      notification.success("Market creation initiated");
      setShowCreateModal(false);
      
      // Reset form
      setNewMarket({
        title: '',
        description: '',
        endTime: '',
        isHyperLocal: false,
        latitude: 0,
        longitude: 0,
        marketType: 0,
        minStake: "0.001",
        maxStake: "100",
        reputationRequired: BigInt(1)
      });

    } catch (error) {
      console.error("Error creating market:", error);
      notification.error(error instanceof Error ? error.message : "Failed to create market");
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


  // Create an array of market IDs based on currentMarketCount
  const marketIds = useMemo(() => {
    if (!currentMarketCount) return [];
    return Array.from({ length: Number(currentMarketCount) }, (_, i) => BigInt(i + 1));
  }, [currentMarketCount]);

  // Fetch all markets using the custom hook
  const markets = useMemo(() => {
    if (!deployedContractData?.address || !marketIds.length) return [];

    return marketIds.map(marketId => {
      const { core, marketData, location, isError } = useMarketDetails(marketId);

      if (isError || !core || !marketData || !location) return null;

      return {
        id: Number(marketId),
        title: core.title,
        description: core.description,
        endTime: core.endTime,
        isResolved: core.isResolved,
        yesShares: marketData.yesShares,
        noShares: marketData.noShares,
        totalStake: marketData.totalStake,
        outcome: marketData.outcome,
        currentProbability: Math.random(),
        liquidityFlow: Math.random() * 2000,
        webTrend: Math.random(),
        aiTruth: Math.random(),
        marketSize: {
          current: Number(formatEther(marketData.totalStake)),
          min: Number(formatEther(marketData.minStake)),
          max: Number(formatEther(marketData.maxStake)),
        },
        historicalData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          superMetric: Math.random(),
        })),
        marketType: core.marketType,
        minStake: marketData.minStake,
        maxStake: marketData.maxStake,
        reputationRequired: marketData.reputationRequired,
        isHyperLocal: core.isHyperLocal,
        latitude: location.latitude,
        longitude: location.longitude,
      } as Market;
    }).filter((market): market is Market => market !== null);
  }, [deployedContractData?.address, marketIds]);

  // Update the markets state when the memoized markets value changes
  useEffect(() => {
    setMarketsList(markets);
  }, [markets]);

  // Add debug logging
  useEffect(() => {
    console.log("Contract address:", deployedContractData?.address);
    console.log("Market count:", currentMarketCount);
    console.log("Market IDs:", marketIds);
    console.log("Current markets:", markets);
  }, [deployedContractData?.address, currentMarketCount, marketIds, markets]);

  const { writeContractAsync } = useWriteContract();

  const { data: marketsData, isError: isMarketsError } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'marketCores',
  }) as { data: any[] | undefined, isError: boolean };

  // Add this useEffect to trigger fetchMarkets when dependencies are ready
  useEffect(() => {
    if (wagmiPublicClient && marketCount) {
      console.log("Starting market fetch with count:", marketCount);
      fetchMarkets();
    }
  }, [wagmiPublicClient, marketCount]);

  const [pendingTxHash, setPendingTxHash] = useState<TransactionHash | undefined>();

  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
    confirmations: 1,
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


  const [easInstance, setEasInstance] = useState<EASIntegration | null>(null);

  // Update the publicClient usage
  const publicClient = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) return null;
    return null; // Return null for now since we're using wagmi hooks instead
  }, []);

 
  // Add useEffect for initial setup
  useEffect(() => {
    if (isConnected && address) {
    }
  }, [isConnected, address]);

  // Add renderPredictionModal function
  const renderPredictionModal = () => {
    if (!selectedMarket) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
          {/* Your prediction modal content */}
        </div>
      </div>
    );
  };

  // Add new state for map popup
const [showLocationMap, setShowLocationMap] = useState<number | null>(null);

// Add this component for the location map popup
const LocationMapPopup = ({ market, onClose }: { market: Market; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-400">Market Location</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="h-[400px] rounded-lg overflow-hidden relative">
          <AstralMap
            isViewOnly={true}
            initialLatitude={Number(market.latitude) / 1e6}
            initialLongitude={Number(market.longitude) / 1e6}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-400 text-sm">Latitude</p>
            <p className="text-white font-semibold">{(Number(market.latitude) / 1e6).toFixed(6)}°</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-400 text-sm">Longitude</p>
            <p className="text-white font-semibold">{(Number(market.longitude) / 1e6).toFixed(6)}°</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the renderProjectCard function to include the hyperlocal badge
  // Update the renderProjectCard function
  const renderProjectCard = (market: Market) => {
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
        
        {/* Chart Section */}
        <div className="mb-6 h-64 bg-gray-700 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={market.historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                stroke="#888" 
                tick={{ fill: '#888' }}
                tickFormatter={(value) => value.split('-').slice(1).join('/')}
              />
              <YAxis 
                stroke="#888" 
                domain={[0, 1]} 
                tick={{ fill: '#888' }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#2D3748', 
                  border: '1px solid #4A5568', 
                  borderRadius: '0.375rem',
                  color: '#E2E8F0'
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="superMetric" 
                stroke="#68D391" 
                strokeWidth={2} 
                dot={false}
                name="Prediction Probability"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Market Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-400 mb-1">Market Size</p>
            <p className="font-semibold text-white">
              {Number(formatEther(market.totalStake)).toFixed(2)} ETH
            </p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-400 mb-1">Current Probability</p>
            <p className="font-semibold text-green-400">
              {(Number(market.yesShares) / (Number(market.yesShares) + Number(market.noShares) || 1) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg flex items-center">
            <Activity size={16} className="mr-2 text-blue-400" />
            <div>
              <p className="text-gray-400">Yes Shares</p>
              <p className="font-semibold text-white">{Number(formatEther(market.yesShares)).toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg flex items-center">
            <Brain size={16} className="mr-2 text-purple-400" />
            <div>
              <p className="text-gray-400">No Shares</p>
              <p className="font-semibold text-white">{Number(formatEther(market.noShares)).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Time and Participants Info */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-yellow-400" />
            <span className="text-gray-300">
              {daysLeft}d {hoursLeft}h left
            </span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-2 text-indigo-400" />
            <span className="text-gray-300">
              {(Number(market.yesShares) + Number(market.noShares))} shares
            </span>
          </div>
        </div>

        {/* Trading Buttons */}
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
        

        {/* User Position Display */}
        {userStakes[market.id] && renderUserPosition(market)}
      </div>
    );
  };

  // Add the renderUserPosition function
  const renderUserPosition = (market: Market) => {
    const userStake = userStakes[market.id];
    if (!userStake) return null;

    const stakedAmount = userStake.amount;
    const position = userStake.position;
    const totalShares = Number(market.yesShares) + Number(market.noShares);
    const currentValue = position === 'yes' 
      ? (Number(market.yesShares) / totalShares) * stakedAmount
      : (Number(market.noShares) / totalShares) * stakedAmount;

    return (
      <div className="bg-gray-700 p-3 rounded-lg mt-4">
        <h4 className="text-green-400 font-semibold mb-2">Your Position</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-400">Staked</p>
            <p className="text-white">{stakedAmount.toFixed(4)} ETH</p>
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

  // Add calculateSuperMetric function
  const calculateSuperMetric = (
    probability: number,
    liquidity: number,
    webTrend: number,
    aiTruth: number
  ): number => {
    const weights = {
      probability: 0.3,
      liquidity: 0.2,
      webTrend: 0.2,
      aiTruth: 0.3
    };
    return (
      probability * weights.probability +
      (liquidity / 2000) * weights.liquidity +
      webTrend * weights.webTrend +
      aiTruth * weights.aiTruth
    );
  };

  // ... rest of your component code ...

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6 bg-gray-900 text-white rounded-lg">
        {isContractLoading ? (
          <div>Loading contract data...</div>
        ) : deployedContractData ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                Perennial Predictions
              </h1>
              <div className="flex gap-4">
                <button 
                  onClick={() => router.push('/gallery')}
                  className="bg-blue-500 text-white hover:bg-blue-600 flex items-center px-4 py-2 rounded"
                >
                  <Users size={20} className="mr-2" />
                  View Allo Pools
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-500 text-white hover:bg-green-600 flex items-center px-4 py-2 rounded"
                >
                  <Plus size={20} className="mr-2" />
                  Create Market
                </button>
              </div>
            </div>

            {error && <div className="bg-red-900 border-red-700 p-4 rounded"><p>{error}</p></div>}

            {isLoadingMarkets ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Loading markets...</p>
              </div>
            ) : marketsList.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">No markets available. Create one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {marketsList.map(renderProjectCard)}
              </div>
            )}

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
          </>     
        ) : (
          <div>Contract not found or not deployed.</div>
        )}
      </div>
      {showPredictionModal && renderPredictionModal()}
      {showLocationMap !== null && selectedMarket && (
        <LocationMapPopup 
          market={selectedMarket} 
          onClose={() => setShowLocationMap(null)} 
        />
      )}
    </ErrorBoundary>
  );
};

// Export the component directly without wrapping
export default PerennialPredictor;
