'use client';

import * as dotenv from "dotenv"
dotenv.config();
import React, { useState, useEffect, ErrorInfo, useMemo, use } from 'react';
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
const PerennialPredictor: React.FC = (): JSX.Element => {
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

  // Use useContractReads for batch fetching markets
  const { data: marketCount } = useContractRead({
    address: deployedContracts["11155111"][0].contracts.perennialprediction.address,
    abi: deployedContracts["11155111"][0].contracts.perennialprediction.abi,
    functionName: 'marketCount',
  });

  const fetchMarketData = async (marketId: bigint) => {
    if (!wagmiPublicClient) return null;

    try {
      const result = await wagmiPublicClient.readContract({
        address: deployedContracts["11155111"][0].contracts.perennialprediction.address,
        abi: deployedContracts["11155111"][0].contracts.perennialprediction.abi,
        functionName: 'getMarket',
        args: [marketId],
      });

      if (!result) return null;

      const typedResult = result as unknown as readonly [{
        title: string;
        description: string;
        endTime: bigint;
        isResolved: boolean;
        isHyperLocal: boolean;
        marketType: string;
      }, {
        yesShares: bigint;
        noShares: bigint;
        totalStake: bigint;
        minStake: bigint;
        maxStake: bigint;
        reputationRequired: bigint;
        outcome: boolean;
      }, {
        latitude: bigint;
        longitude: bigint;
      }];

      const [coreData, marketData, location] = typedResult;
      const core = {
        ...coreData,
        marketType: Number(coreData.marketType)
      };

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
        currentProbability: Number(marketData.yesShares) / (Number(marketData.yesShares) + Number(marketData.noShares) || 1),
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
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  };

  // Update the useEffect for fetching markets
  useEffect(() => {
    const fetchMarkets = async () => {
      if (!marketCount || !wagmiPublicClient) {
        console.log("No market count or public client available");
        return;
      }

      setIsLoadingMarkets(true);
      try {
        const count = Number(marketCount);
        const marketPromises = [];

        // Start from 1 since market IDs typically start at 1
        for (let i = 1; i <= count; i++) {
          marketPromises.push(fetchMarketData(BigInt(i)));
        }

        const markets = await Promise.all(marketPromises);
        const validMarkets = markets.filter((market): market is Market => market !== null);
        
        console.log("Fetched markets:", validMarkets);
        setMarketsList(validMarkets);
      } catch (error) {
        console.error("Error fetching markets:", error);
        notification.error("Failed to fetch markets");
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, [marketCount, wagmiPublicClient]); // Update dependency

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
    if (!isConnected) {
      notification.error("Please connect your wallet first");
      return;
    }

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

  const { data: marketData } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'marketCores',
  });

  const { writeContractAsync } = useWriteContract();

  const { data: marketsData, isError: isMarketsError } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'marketCores',
  }) as { data: any[] | undefined, isError: boolean };

  useEffect(() => {
    if (marketsData && Array.isArray(marketsData) && !isMarketsError) {
      const processedMarkets = (marketsData as any[]).map((data: any, index: number) => {
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
      }).filter((market: Market | null): market is Market => market !== null);

      setMarketsList(processedMarkets);
    } else if (isMarketsError) {
      console.error("Error fetching markets");
      notification.error("Failed to fetch markets");
    }
  }, [marketsData, isMarketsError]);

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

  // Update the contract write hook for trading shares
  const { writeContract: tradeShares } = useWriteContract();

  // Update the handleConfirmPrediction function
  const handleConfirmPrediction = async () => {
    if (!selectedMarket || !tradeShares || !isConnected) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      const stakeAmountBigInt = parseEther(stakeAmount);

      // Call the tradeShares function
      await tradeShares({
        address: deployedContracts["11155111"][0].contracts.perennialprediction.address,
        abi: deployedContracts["11155111"][0].contracts.perennialprediction.abi,
        functionName: 'tradeShares',
        args: [
          BigInt(selectedMarket.id),
          predictionType === 'yes',
          stakeAmountBigInt
        ],
        value: stakeAmountBigInt // Send ETH with the transaction
      });

      // Update the user's stakes
      setUserStakes(prev => ({
        ...prev,
        [selectedMarket.id]: {
          amount: Number(formatEther(stakeAmountBigInt)),
          position: predictionType
        }
      }));

      notification.success("Transaction submitted!");
      setShowPredictionModal(false);
      setStakeAmount('0.1');

    } catch (error) {
      console.error("Error processing prediction:", error);
      notification.error(error instanceof Error ? error.message : "Failed to process prediction");
    }
  };

  // Update the renderPredictionModal to show more information
  const renderPredictionModal = () => {
    if (!selectedMarket) return null;

    const currentProbability = Number(selectedMarket.yesShares) / 
      (Number(selectedMarket.yesShares) + Number(selectedMarket.noShares) || 1);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Make Prediction</h3>
          <div className="mb-4">
            <p className="text-gray-300 mb-2">Market: {selectedMarket.title}</p>
            <p className="text-gray-400 text-sm mb-4">{selectedMarket.description}</p>
            
            <div className="bg-gray-700 p-3 rounded-lg mb-4">
              <p className="text-gray-400 mb-1">Current Probability</p>
              <p className="text-green-400 font-bold">{(currentProbability * 100).toFixed(2)}%</p>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg mb-4">
              <p className="text-gray-400 mb-1">Your Position</p>
              <p className={predictionType === 'yes' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {predictionType.toUpperCase()}
              </p>
            </div>

            <div className="mb-4">
              <label className="text-gray-400 block mb-2">Stake Amount (ETH)</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                min={Number(formatEther(selectedMarket.minStake))}
                max={Number(formatEther(selectedMarket.maxStake))}
                step="0.000001"
              />
              <p className="text-gray-400 text-sm mt-1">
                Min: {Number(formatEther(selectedMarket.minStake))} ETH | 
                Max: {Number(formatEther(selectedMarket.maxStake))} ETH
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowPredictionModal(false)}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPrediction}
              className={`px-4 py-2 rounded transition-colors ${
                predictionType === 'yes' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Confirm Prediction
            </button>
          </div>
        </div>
      </div>
    );
  };

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
    </ErrorBoundary>
  );
};

// Export the component directly without wrapping
export default PerennialPredictor;
