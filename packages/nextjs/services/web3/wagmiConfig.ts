import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig } from "wagmi";
import * as chains from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { scaffoldConfig } from "~~/scaffold.config";

const availableChains = [chains.sepolia, chains.hardhat];

export const { chains: appChains, publicClient, webSocketPublicClient } = configureChains(
  availableChains,
  [
    alchemyProvider({ apiKey: scaffoldConfig.alchemyApiKey }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "Perennial Prediction",
  projectId: scaffoldConfig.walletConnectProjectId,
  chains: appChains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
