import { Chain } from "viem";
import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetwork: Chain;
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const NETWORKS_EXTRA_DATA: { [key: string]: { color: string } } = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
  },
  [chains.sepolia.id]: {
    color: "#5f4bb6",
  },
};

export const getNetworkColor = (chainId: number): string => {
  return NETWORKS_EXTRA_DATA[chainId]?.color ?? "#666666";
};
