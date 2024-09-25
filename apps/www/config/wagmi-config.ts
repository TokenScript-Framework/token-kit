import { createConfig as actionConfig } from "@wagmi/core";
import { createConfig, http } from "wagmi";
import { baseSepolia, mainnet, polygon, sepolia } from "wagmi/chains";

const chains = [mainnet, sepolia, polygon, baseSepolia] as const;
const transports = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [polygon.id]: http(),
  [baseSepolia.id]: http("https://sepolia.base.org"),
} as const;

const config = createConfig({ chains, transports });
const wagmiActionChainConfig = actionConfig({ chains, transports });

export { config, wagmiActionChainConfig };
