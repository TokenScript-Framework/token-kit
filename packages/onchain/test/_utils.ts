import { ethers } from "ethers";

const RPC_URLS: Record<number, string> = {
  1: "https://eth.llamarpc.com",
  59140: "https://rpc.goerli.linea.build",
  80001: "https://rpc-mumbai.polygon.technology",
  80002: "https://polygon-amoy.drpc.org",
  84532: "https://sepolia.base.org",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
  11155420: "https://optimism-sepolia.blockpi.network/v1/rpc/public",
};

const DEFAULT_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export function getProvider(chainId: number): ethers.Provider {
  const rpcUrl = RPC_URLS[chainId] || DEFAULT_RPC_URL;
  return new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
}
