import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import * as chains from "wagmi/chains";
import { scaffoldConfig } from "./scaffold.config";

export default defineConfig({
  out: "generated.ts",
  contracts: [],
  plugins: [react()],
  networks: [
    chains.hardhat,
    chains.mainnet,
    chains.sepolia,
  ],
});
