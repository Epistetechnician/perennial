'use client';

import * as dotenv from "dotenv"
dotenv.config();
import React, { useState, useEffect, ErrorInfo, useMemo } from 'react';
import { useAccount, useWriteContract, useChainId, useWaitForTransactionReceipt } from 'wagmi';
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
import { useReadContract, useContractRead } from 'wagmi';
import { readContract } from '@wagmi/core';
import type { ReadContractParameters, Config } from '@wagmi/core';

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
    minStake: parseEther("0.001"),
    maxStake: parseEther("100"),
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

  const { data: deployedContractData, isLoading: isContractLoading } = useDeployedContractInfo(
    "perennialprediction" as ContractName
  );

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

  const { data: marketCount, isError: isMarketCountError } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'marketCount',
  });

  useEffect(() => {
    console.log("Contract data:", deployedContractData);
    console.log("Market count:", marketCount);
    if (isMarketCountError) {
      console.error("Error fetching market count");
    }

    if (marketCount) {
      const count = typeof marketCount === 'bigint' 
        ? marketCount 
        : Array.isArray(marketCount) 
          ? BigInt(marketCount[0] as number) 
          : BigInt(0);
      setCurrentMarketCount(count);
    }
  }, [deployedContractData, marketCount, isMarketCountError]);

  // Type definitions
  interface NewMarketState {
    title: string;
    description: string;
    endTime: string;
    isHyperLocal: boolean;
    latitude: number;
    longitude: number;
    marketType: number;
    minStake: bigint;
    maxStake: bigint;
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

  const fetchMarketData = async (marketId: bigint, contractData: any) => {
    if (!contractData?.address) {
      throw new Error("Contract data not available");
    }

    try {
      const { data: coreData } = await useContractRead({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'marketCores',
        args: [marketId],
      });

      const { data: marketData } = await useContractRead({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'marketData',
        args: [marketId],
      });

      const { data: locationData } = await useContractRead({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'marketLocations',
        args: [marketId],
      });

      return {
        core: coreData,
        data: marketData,
        location: locationData,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      throw error;
    }
  };

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
    const { data: deployedContractData } = useDeployedContractInfo("perennialprediction" as ContractName);

    const { data: core } = useReadContract({
      address: deployedContractData?.address,
      abi: deployedContractData?.abi,
      functionName: 'marketCores',
      args: [marketId]
    } as const);

    const { data: marketData } = useReadContract({
      address: deployedContractData?.address,
      abi: deployedContractData?.abi,
      functionName: 'marketData',
      args: [marketId]
    } as const);

    const { data: location } = useReadContract({
      address: deployedContractData?.address,
      abi: deployedContractData?.abi,
      functionName: 'marketLocations',
      args: [marketId]
    } as const);

    return {
      core: core as MarketCore,
      marketData: marketData as MarketData,
      location: location as MarketLocation,
      isError: !core || !marketData || !location,
      isLoading: !core || !marketData || !location,
    };
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
      const { core, marketData, location } = useMarketDetails(marketId);

      if (!core || !marketData || !location) return null;

      const market: Market = {
        id: Number(marketId),
        title: (core as MarketCore).title,
        description: (core as MarketCore).description,
        endTime: (core as MarketCore).endTime,
        isResolved: (core as MarketCore).isResolved,
        yesShares: (marketData as MarketData).yesShares,
        noShares: (marketData as MarketData).noShares,
        totalStake: (marketData as MarketData).totalStake,
        outcome: (marketData as MarketData).outcome,
        currentProbability: Math.random(),
        liquidityFlow: Math.random() * 2000,
        webTrend: Math.random(),
        aiTruth: Math.random(),
        marketSize: {
          current: Number(formatEther((marketData as MarketData).totalStake)),
          min: 1000,
          max: 10000,
        },
        historicalData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          superMetric: Math.random(),
        })),
        marketType: (core as MarketCore).marketType,
        minStake: (marketData as MarketData).minStake,
        maxStake: (marketData as MarketData).maxStake,
        reputationRequired: (marketData as MarketData).reputationRequired,
        isHyperLocal: (core as MarketCore).isHyperLocal,
        latitude: (location as MarketLocation).latitude,
        longitude: (location as MarketLocation).longitude,
      };

      return market;
    }).filter((market): market is Market => market !== null);
  }, [deployedContractData, marketIds]);

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

  const { writeContract } = useWriteContract();

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

  // Update the checkContractBalance function with proper typing
  const checkContractBalance = async () => {
    try {
      if (deployedContractData?.address && isConnected) {
        const result = await readContract(
          {
            address: deployedContractData.address as `0x${string}`,
            abi: deployedContractData.abi,
            functionName: 'getBalance',
            args: [],
          },
          {
            chainId: sepolia.id,
          }
        );
        
        console.log('Contract ETH balance:', formatEther(result as bigint));
      }
    } catch (error) {
      console.error('Error checking contract balance:', error);
      setError('Error checking contract balance');
    }
  };

  // Add useEffect for initial setup
  useEffect(() => {
    if (isConnected && address) {
      checkContractBalance();
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

  // Add the renderProjectCard function
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
      <div key={market.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg">
        <h3 className="font-bold text-2xl text-green-400 mb-3">{market.title}</h3>
        <p className="text-gray-300 mb-4">{market.description}</p>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => handleStake(market, 'yes')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
          >
            <TrendingUp size={16} className="mr-2 inline" />
            Yes
          </button>
          <button
            onClick={() => handleStake(market, 'no')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full"
          >
            <TrendingDown size={16} className="mr-2 inline" />
            No
          </button>
        </div>
      </div>
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
                {marketsList.map((market) => renderProjectCard(market))}
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
          </>     
        ) : (
          <div>Contract not found or not deployed.</div>
        )}

      </div>
      {showPredictionModal && renderPredictionModal()}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Market</h2>
            {/* Add your create modal content here */}
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

// Export the component directly without wrapping
export default PerennialPredictor;
