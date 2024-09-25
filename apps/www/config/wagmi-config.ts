import { http, createConfig } from '@wagmi/core';
import { 
  mainnet, 
  sepolia, 
  polygon, 
} from '@wagmi/core/chains';

export const config = createConfig({
  chains: [
    mainnet, 
    sepolia, 
    polygon,
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
});
