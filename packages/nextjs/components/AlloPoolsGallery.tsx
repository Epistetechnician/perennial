'use client';

import React from 'react';
import { useAllo } from '~~/hooks/useAllo';
import { formatEther } from 'viem';

export const AlloPoolsGallery: React.FC = () => {
  const { pools, loading, error } = useAllo();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="text-gray-400">Loading Allo pools...</p>
        <p className="text-sm text-gray-500">Fetching from Indexer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 text-red-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error Loading Pools</h3>
        <p>{error.message}</p>
        <div className="mt-4 p-4 bg-red-900/30 rounded">
          <p className="text-sm">Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Available Pools</h3>
        <p className="text-sm text-gray-300">Total Pools Found: {pools.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <div key={pool.id} className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-green-400 truncate">
                {pool.profile?.name || `Pool ${pool.id}`}
              </h3>
            </div>
            
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Pool ID:</span>
                <span className="text-sm font-mono">{pool.id}</span>
              </div>
              
              {pool.strategy && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Strategy:</span>
                  <span className="text-sm truncate max-w-[200px]">
                    <a 
                      href={`https://sepolia.etherscan.io/address/${pool.strategy}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {pool.strategy.slice(0, 6)}...{pool.strategy.slice(-4)}
                    </a>
                  </span>
                </div>
              )}
              
              {pool.token && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Token:</span>
                  <span className="text-sm truncate max-w-[200px]">
                    <a 
                      href={`https://sepolia.etherscan.io/address/${pool.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {pool.token.slice(0, 6)}...{pool.token.slice(-4)}
                    </a>
                  </span>
                </div>
              )}

              {pool.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-sm">{formatEther(BigInt(pool.amount))} ETH</span>
                </div>
              )}

              {pool.metadata && (
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-gray-400 mb-1">Metadata:</p>
                  <p className="text-sm">Protocol: {pool.metadata.protocol}</p>
                  {pool.metadata.pointer && (
                    <p className="text-sm break-all">
                      <span className="text-gray-400">IPFS: </span>
                      <a 
                        href={`https://ipfs.io/ipfs/${pool.metadata.pointer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {pool.metadata.pointer}
                      </a>
                    </p>
                  )}
                </div>
              )}

              {pool.profileId && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-gray-400">Profile ID:</span>
                  <p className="text-sm font-mono truncate">{pool.profileId}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {pools.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-10">
            <p className="text-lg mb-2">No pools found</p>
            <p className="text-sm text-gray-500">Try refreshing the page or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};
