import { createConfig as actionConfig } from "@wagmi/core";
import { createConfig, http } from "wagmi";
import { baseSepolia, mainnet, polygon, sepolia } from "wagmi/chains";

const parameters = {
  chains: [mainnet, sepolia, polygon, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
} as const;

export const config = createConfig(parameters);
export const wagmiActionChainConfig = actionConfig(parameters);
