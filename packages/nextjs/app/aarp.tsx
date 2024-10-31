import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts, useContractWrite } from 'wagmi';
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';
import { formatEther, parseEther } from 'viem';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Brain, Plus, Loader, Clock, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Address } from '~~/components/scaffold-eth';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { notification } from "~~/utils/scaffold-eth";
import { useAllo } from '~/hooks/useAllo';

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
  poolId?: string;
}

interface Stake {
  amount: number;
  position: 'yes' | 'no';
}

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

  const { address } = useAccount();
  const { data: deployedContractData, isLoading: isContractLoading } = useDeployedContractInfo("perennialprediction");
  const { createPool, allocateFunds } = useAllo();
  const { verifyLocation } = useAstral();

  const { data: marketCount, isError: isMarketCountError, error: marketCountError } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: 'marketCount',
  });

  const { writeContract } = useWriteContract();
  const waitForTransaction = useWaitForTransactionReceipt();

  const { data: marketsData, isError: isMarketsError, error: marketsError } = useReadContracts({
    contracts: Array.from({ length: Number(marketCount) || 0 }, (_, i) => ({
      address: deployedContractData?.address,
      abi: deployedContractData?.abi,
      functionName: 'markets',
      args: [BigInt(i + 1)],
    })),
  });

  useEffect(() => {
    if (marketsData && !isMarketsError) {
      const loadedMarkets: Market[] = marketsData
        .filter((data): data is { result: any; status: 'success' } => 
          data.status === 'success' && !!data.result
        )
        .map((data, index) => {
          const marketData = data.result;
          return {
            id: index + 1,
            title: marketData[0] || `Untitled Market ${index + 1}`,
            description: marketData[1] || '',
            endTime: marketData[2] ? BigInt(marketData[2]) : BigInt(0),
            isResolved: marketData[3] || false,
            yesShares: marketData[4] ? BigInt(marketData[4]) : BigInt(0),
            noShares: marketData[5] ? BigInt(marketData[5]) : BigInt(0),
            totalStake: marketData[6] ? BigInt(marketData[6]) : BigInt(0),
            outcome: marketData[7] || false,
            isHyperLocal: marketData[8] || false,
            latitude: marketData[9] ? BigInt(marketData[9]) : BigInt(0),
            longitude: marketData[10] ? BigInt(marketData[10]) : BigInt(0),
            currentProbability: Math.random(),
            liquidityFlow: Math.random() * 2000,
            webTrend: Math.random(),
            aiTruth: Math.random(),
            marketSize: {
              current: Number(formatEther(marketData[6] ? BigInt(marketData[6]) : BigInt(0))),
              min: 1000,
              max: 10000,
            },
            historicalData: Array.from({ length: 30 }, (_, index) => ({
              date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              superMetric: Math.random(),
            })),
            poolId: marketData[11] ? marketData[11].toString() : undefined,
          };
        });
      setMarkets(loadedMarkets);
    } else if (isMarketsError) {
      console.error("Error fetching markets:", marketsError);
    }
  }, [marketsData, isMarketsError, marketsError]);

  const handleCreateMarket = async () => {
    if (writeContract && deployedContractData) {
      try {
        notification.info("Preparing to create market...");

        if (newMarket.isHyperLocal) {
          const isLocationVerified = await verifyLocation(newMarket.latitude, newMarket.longitude);
          if (!isLocationVerified) {
            throw new Error("Location verification failed");
          }
        }

        const endTimeUnix = Math.floor(new Date(newMarket.endTime).getTime() / 1000);

        const { hash } = await writeContract({
          address: deployedContractData.address,
          abi: deployedContractData.abi,
          functionName: 'createMarket',
          args: [
            newMarket.title,
            newMarket.description,
            BigInt(endTimeUnix),
            newMarket.isHyperLocal,
            BigInt(newMarket.latitude),
            BigInt(newMarket.longitude)
          ],
        });

        notification.info("Transaction sent. Waiting for confirmation...");

        const receipt = await waitForTransaction({ hash });

        // Create Allo pool for the new market
        const poolId = await createPool(newMarket.title, newMarket.description);

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

        // Update markets with the new market including the poolId
        setMarkets(prevMarkets => [...prevMarkets, {
          ...newMarket,
          id: prevMarkets.length + 1,
          endTime: BigInt(endTimeUnix),
          isResolved: false,
          yesShares: BigInt(0),
          noShares: BigInt(0),
          totalStake: BigInt(0),
          outcome: false,
          currentProbability: Math.random(),
          liquidityFlow: Math.random() * 2000,
          webTrend: Math.random(),
          aiTruth: Math.random(),
          marketSize: { current: 0, min: 1000, max: 10000 },
          historicalData: [],
          poolId: poolId,
        }]);

      } catch (error) {
        console.error("Detailed error:", error);
        if (error instanceof Error) {
          notification.error("Failed to create market: " + error.message);
        } else {
          notification.error("An unknown error occurred while creating the market");
        }
      }
    } else {
      notification.error("Unable to create market: Contract data or write function is not available");
    }
  };

  const handleStake = (market: Market, type: 'yes' | 'no') => {
    setSelectedMarket(market);
    setPredictionType(type);
    setShowPredictionModal(true);
  };

  const handleConfirmPrediction = async () => {
    if (!selectedMarket || !writeContract || !deployedContractData) return;

    try {
      const hash = await writeContract({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: 'setPrediction',
        args: [BigInt(selectedMarket.id), predictionType === 'yes'],
        value: parseEther(stakeAmount),
      });

      notification.info("Prediction transaction sent. Waiting for confirmation...");

      const receipt = await waitForTransaction({ hash });
      
      // Allocate funds to the Allo pool
      if (selectedMarket.poolId) {
        await allocateFunds(selectedMarket.poolId, parseEther(stakeAmount));
      }

      notification.success("Prediction set successfully!");
      setShowPredictionModal(false);

      // Update user stakes
      setUserStakes(prevStakes => ({
        ...prevStakes,
        [selectedMarket.id]: {
          amount: parseFloat(stakeAmount),
          position: predictionType
        }
      }));

    } catch (error) {
      console.error("Error setting prediction:", error);
      notification.error("Failed to set prediction: " + (error instanceof Error ? error.message : String(error)));
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

  const resolveMarketToNo = async (marketId: number) => {
    if (!deployedContractData) {
      notification.error("Contract data not available");
      return;
    }

    const { writeAsync } = useContractWrite({
      address: deployedContractData.address,
      abi: deployedContractData.abi,
      functionName: 'resolveMarket',
    });

    try {
      const tx = await writeAsync({
        args: [BigInt(marketId), false], // false for "No"
      });

      notification.info("Resolving market to No. Waiting for confirmation...");

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        notification.success(`Market ${marketId} resolved to No successfully!`);
        // Update the local state to reflect the resolved market
        setMarkets(prevMarkets => 
          prevMarkets.map(market => 
            market.id === marketId 
              ? { ...market, isResolved: true, outcome: false } 
              : market
          )
        );
      } else {
        notification.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error resolving market:", error);
      notification.error("Failed to resolve market: " + (error instanceof Error ? error.message : String(error)));
    }
  };

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
        <div className="flex justify-between">
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
        {userStakes[market.id.toString()] && (
          <div className="mt-4 bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold text-white">Your Stake: {userStakes[market.id.toString()].amount} ETH ({userStakes[market.id.toString()].position})</p>
          </div>
        )}
        {market.isHyperLocal && (
          <div className="mt-2 text-sm text-gray-400">
            Location verified by Astral
          </div>
        )}
        {market.poolId && (
        <div className="mt-2 text-sm text-gray-400">
          Allo Pool ID: {market.poolId}
        </div>
        )}
        {!market.isResolved && (
          <button
            onClick={() => resolveMarketToNo(market.id)}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full w-full transition-colors duration-300"
          >
            Resolve to No
          </button>
        )}
      </div>
    );
  };

  return (
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

          {markets.length === 0 ? (
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
                    onChange={(e) => setNewMarket({ ...newMarket, isHyperLocal: e.target.checked })}
                  />
                  <label htmlFor="isHyperLocal">Is Hyper Local?</label>
                </div>
                {newMarket.isHyperLocal && (
                  <>
                    <input
                      type="number"
                      placeholder="Latitude"
                      className="w-full p-2 mb-4 bg-gray-700 rounded"
                      value={newMarket.latitude}
                      onChange={(e) => setNewMarket({ ...newMarket, latitude: parseInt(e.target.value) })}
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      className="w-full p-2 mb-4 bg-gray-700 rounded"
                      value={newMarket.longitude}
                      onChange={(e) => setNewMarket({ ...newMarket, longitude: parseInt(e.target.value) })}
                    />
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
                  >
                    <Plus size={16} className="mr-2" />
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

      {showPredictionModal && selectedMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Your Prediction</h2>
            <p>Market: {selectedMarket.title}</p>
            <p>Prediction: {predictionType === 'yes' ? 'Yes' : 'No'}</p>
            <input
              type="number"
              step="0.01"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              placeholder="Stake Amount (ETH)"
            />
            <div className="flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowPredictionModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleConfirmPrediction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerennialPredictor;
