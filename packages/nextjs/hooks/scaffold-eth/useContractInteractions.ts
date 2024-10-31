import { usePublicClient, useWalletClient } from 'wagmi';
import { Hash, TransactionReceipt } from 'viem';
import { useTargetNetwork } from './useTargetNetwork';
import { useScaffoldReadContract } from './useScaffoldReadContract';
import { useTransactor } from './useTransactor';
import { ContractName } from '~/utils/scaffold-eth/contract';

export const useContractInteractions = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { targetNetwork } = useTargetNetwork();
  const transactor = useTransactor(walletClient);

  const waitForTransaction = async (hash: Hash, confirmations = 1): Promise<TransactionReceipt> => {
    return publicClient.waitForTransactionReceipt({
      hash,
      confirmations,
    });
  };

  const readContractData = async (config: any, parameters: any) => {
    return publicClient.readContract({
      ...config,
      ...parameters,
    });
  };

  return {
    waitForTransaction,
    readContractData,
    publicClient,
    walletClient,
    transactor,
  };
};
