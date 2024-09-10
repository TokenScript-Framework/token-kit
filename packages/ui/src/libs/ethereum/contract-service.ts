import axios from "axios";
import {
  Chain,
  createPublicClient,
  defineChain,
  erc721Abi,
  extractChain,
  http,
  PublicClient,
} from "viem";
import * as chains from "viem/chains";

const customChains: Chain[] = [
  defineChain({
    id: 185,
    name: "Mint Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://rpc.mintchain.io"],
      },
    },
    blockExplorers: {
      default: {
        name: "Mint Mainnet blockchain explorer",
        url: "https://explorer.mintchain.io",
      },
    },
    testnet: false,
  }),
  defineChain({
    id: 1687,
    name: "Mint Sepolia Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://sepolia-testnet-rpc.mintchain.io"],
      },
    },
    blockExplorers: {
      default: {
        name: "Mint Sepolia Testnet blockchain explorer",
        url: "https://sepolia-testnet-explorer.mintchain.io",
      },
    },
    testnet: true,
  }),
];

const clientCache: Record<number, PublicClient> = {};
function getBatchClient(chainId: any) {
  if (!clientCache[chainId]) {
    clientCache[chainId] = createPublicClient({
      chain: extractChain({
        chains: [...Object.values(chains), ...customChains],
        id: chainId,
      }),
      transport: http(),
      batch: {
        // Apply the same config as ethers.js batch provider
        multicall: {
          batchSize: 100,
          wait: 10,
        },
      },
    }) as any;
  }

  return clientCache[chainId];
}

export async function getERC721Metadata(
  chainId: number,
  contract: `0x${string}`,
  tokenId: bigint,
) {
  try {
    const client = getBatchClient(chainId);

    const tokenURI = await client.readContract({
      address: contract,
      abi: erc721Abi,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    return (await axios.get(tokenURI)).data;
  } catch (e) {
    console.log(e);
    return null;
  }
}
