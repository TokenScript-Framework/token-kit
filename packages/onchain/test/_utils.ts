import { ethers } from "ethers";
export function getProvider(chainId: number): ethers.Provider {
  let rpcUrl: string;
  switch (chainId) {
    // Linea Goerli
    case 59140:
      rpcUrl = "https://rpc.goerli.linea.build";
      break;
    // Mumbai
    case 80001:
      rpcUrl = "https://rpc-mumbai.polygon.technology";
      break;
    // Amoy
    case 80002:
      rpcUrl = "https://polygon-amoy.drpc.org";
      break;
    // Base Sepolia Testnet
    case 84532:
      rpcUrl = "https://sepolia.base.org";
      break;
    // Sepolia
    case 11155111:
      rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
      break;
    // OP Sepolia Testnet
    case 11155420:
      rpcUrl = "https://optimism-sepolia.blockpi.network/v1/rpc/public";
      break;
    default:
      rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
      break;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId, {
    staticNetwork: true,
  });
  return provider;
}
