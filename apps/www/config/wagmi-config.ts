import { createConfig as actionConfig } from '@wagmi/core';
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygon } from 'wagmi/chains';

const chains = [mainnet, sepolia, polygon] as const;
const transports = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [polygon.id]: http(),
} as const;

const config = createConfig({ chains, transports });
const wagmiActionChainConfig = actionConfig({ chains, transports });
export { config, wagmiActionChainConfig };
