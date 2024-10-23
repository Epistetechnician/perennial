import React, { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useContractRead, useWaitForTransactionReceipt } from 'wagmi';
import { perennialpredictionABI } from '../generated/perennialpredictionABI';
import { formatEther } from 'viem';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Brain, Plus, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

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
}

interface Stake {
  amount: number;
  position: 'yes' | 'no';
}

interface MarketData {
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
}

const calculateSuperMetric = (probability: number, liquidity: number, webTrend: number, aiTruth: number) => {
  const weights = { probability: 0.3, liquidity: 0.2, webTrend: 0.2, aiTruth: 0.3 };
  return (
    probability * weights.probability +
    (liquidity / 2000) * weights.liquidity +
    webTrend * weights.webTrend +
    aiTruth * weights.aiTruth
  );
};

const PerennialPredictor: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userStakes, setUserStakes] = useState<Record<string, Stake>>({});
  const [newMarket, setNewMarket] = useState({
    title: '',
    description: '',
    duration: 0,
    isHyperLocal: false,
    latitude: 0,
    longitude: 0
  });
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  const { data: marketCount, isError: isMarketCountError, error: marketCountError } = useContractRead({
    address: contractAddress,
    abi: perennialpredictionABI,
    functionName: 'marketCount',
  });

  console.log("Market count data:", marketCount, "Error:", marketCountError);

  const { write: createMarketWrite, data: createMarketData } = useContractWrite({
    address: contractAddress,
    abi: perennialpredictionABI,
    functionName: 'createMarket',
  });

  const { isLoading: isCreateMarketLoading, isSuccess: isCreateMarketSuccess } = useWaitForTransactionReceipt({
    hash: createMarketData,
  });

  useEffect(() => {
    console.log("useEffect triggered, marketCount:", marketCount);
    const fetchMarkets = async () => {
      console.log("Fetching markets, marketCount:", marketCount);
      if (marketCount) {
        const count = Number(marketCount);
        console.log("Market count (as number):", count);
        const loadedMarkets: Market[] = [];
        for (let i = 1; i <= count; i++) {
          const { data, isError, error } = useContractRead({
            address: contractAddress,
            abi: perennialpredictionABI,
            functionName: 'markets',
            args: [BigInt(i)],
          });

          if (isError) {
            console.error(`Error fetching market ${i}:`, error);
          } else if (data) {
            console.log(`Raw market data for market ${i}:`, data);
            const marketData = data as unknown as MarketData;
            loadedMarkets.push({
              id: i,
              title: marketData.title,
              description: marketData.description,
              endTime: marketData.endTime,
              isResolved: marketData.isResolved,
              yesShares: marketData.yesShares,
              noShares: marketData.noShares,
              totalStake: marketData.totalStake,
              outcome: marketData.outcome,
              isHyperLocal: marketData.isHyperLocal,
              latitude: marketData.latitude,
              longitude: marketData.longitude,    
              currentProbability: Math.random(),
              liquidityFlow: Math.random() * 2000,
              webTrend: Math.random(),
              aiTruth: Math.random(),
              marketSize: {
                current: Number(formatEther(marketData.totalStake)),
                min: 1000,
                max: 10000,
              },
              historicalData: Array.from({ length: 30 }, (_, index) => ({
                date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                superMetric: Math.random(),
              })),
            });
            console.log(`Processed market ${i}:`, loadedMarkets[loadedMarkets.length - 1]);
          } else {
            console.log(`No data returned for market ${i}`);
          }
        }
        console.log("All loaded markets:", loadedMarkets);
        setMarkets(loadedMarkets);
      } else {
        console.log("No market count available");
      }
    };
    fetchMarkets();
  }, [marketCount]);

  console.log("Current markets state:", markets);

  const handleCreateMarket = async () => {
    if (createMarketWrite) {
      try {
        console.log("Creating market with data:", newMarket);
        const result = await createMarketWrite({
          address: contractAddress,
          abi: perennialpredictionABI,
          functionName: 'createMarket',
          args: [
            newMarket.title,
            newMarket.description,
            BigInt(newMarket.duration),
            newMarket.isHyperLocal,
            BigInt(newMarket.latitude),
            BigInt(newMarket.longitude)
          ],
        });
        console.log("Market creation result:", result);
        setShowCreateModal(false);
        setNewMarket({
          title: '',
          description: '',
          duration: 0,
          isHyperLocal: false,
          latitude: 0,
          longitude: 0
        });
      } catch (error) {
        console.error("Error creating market:", error);
        setError("Failed to create market");
      }
    }
  };

  const handleStake = async (marketId: number, amount: number, position: 'yes' | 'no') => {
    // Implement staking logic here
    console.log(`Staking ${amount} on ${position} for market ${marketId}`);
  };

  const handleUnstake = async (marketId: number, amount: number) => {
    // Implement unstaking logic here
    console.log(`Unstaking ${amount} from market ${marketId}`);
  };

  const renderProjectCard = (market: Market) => {
    console.log("Rendering market:", market);
    const superMetric = calculateSuperMetric(
      market.currentProbability,
      market.liquidityFlow,
      market.webTrend,
      market.aiTruth
    );

    return (
      <div key={market.id} className="bg-gray-800 rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        <h3 className="font-semibold text-xl text-white mb-2">{market.title}</h3>
        <p className="text-gray-300 mb-4 h-20 overflow-hidden">{market.description}</p>
        <div className="mb-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={market.historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 1]} />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
              <Line type="monotone" dataKey="superMetric" stroke="#4ade80" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p>Market Size: {market.marketSize.current} / {market.marketSize.max} ETH</p>
          <p className="font-bold">Price: {superMetric.toFixed(4)}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="flex items-center">
            <Activity size={16} className="mr-1" />
            Liquidity Flow: {market.liquidityFlow.toFixed(2)} ETH
          </p>
          <p className="flex items-center">
            <Brain size={16} className="mr-1" />
            AI Truth: {(market.aiTruth * 100).toFixed(2)}%
          </p>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => handleStake(market.id, 0.1, 'yes')}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded flex items-center"
            disabled={isCreateMarketLoading}
          >
            {isCreateMarketLoading ? <Loader className="animate-spin mr-2" /> : <TrendingUp size={16} className="mr-2" />}
            Yes
          </button>
          <button
            onClick={() => handleStake(market.id, 0.1, 'no')}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center"
            disabled={isCreateMarketLoading}
          >
            {isCreateMarketLoading ? <Loader className="animate-spin mr-2" /> : <TrendingDown size={16} className="mr-2" />}
            No
          </button>
        </div>
        {userStakes[market.id.toString()] && (
          <div className="mt-4 bg-gray-700 p-2 rounded">
            <p className="font-semibold">Your Stake: {userStakes[market.id.toString()].amount} ETH ({userStakes[market.id.toString()].position})</p>
            <button
              onClick={() => handleUnstake(market.id, userStakes[market.id.toString()].amount)}
              className="mt-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded w-full"
              disabled={isCreateMarketLoading}
            >
              Unstake
            </button>
          </div>
        )}
      </div>
    );
  };

  console.log("Rendering component, markets:", markets);

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-900 text-white rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">Public Goods Prediction Market</h1>
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
        <p>No markets available. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              type="number"
              placeholder="Duration (in seconds)"
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              value={newMarket.duration}
              onChange={(e) => setNewMarket({ ...newMarket, duration: parseInt(e.target.value) })}
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
                disabled={isCreateMarketLoading}
              >
                {isCreateMarketLoading ? <Loader className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerennialPredictor;
