import { ethers, JsonRpcApiProvider } from "ethers";

export function getProvider(chainId: number): JsonRpcApiProvider {
  let rpcUrl: string;
  switch (chainId) {
    // mainnet
    case 1:
      rpcUrl = "https://eth.llamarpc.com";
      break;
    // Goerli
    case 5:
      rpcUrl = "https://eth-goerli.public.blastapi.io";
      break;
    // OP Mainnet
    case 10:
      rpcUrl = "https://optimism.llamarpc.com";
      break;
    // polygon
    case 137:
      rpcUrl = "https://polygon.meowrpc.com";
      break;
    // Mint Mainnet
    case 185:
      rpcUrl = "https://global.rpc.mintchain.io";
      break;
    // X Layer Testnet
    case 195:
      rpcUrl = "https://testrpc.xlayer.tech";
      break;
    // Klaytn Testnet Baobab
    case 1001:
      rpcUrl = "https://public-en-baobab.klaytn.net";
      break;
    // Mint Sepolia Testnet
    case 1687:
      rpcUrl = "https://sepolia-testnet-rpc.mintchain.io";
      break;
    // Klaytn Mainnet Cypress
    case 8217:
      rpcUrl = "https://public-en-cypress.klaytn.net";
      break;
    // Base
    case 8453:
      rpcUrl = "https://base-pokt.nodies.app";
      break;
    // Arbitrum One
    case 42161:
      rpcUrl = "https://arbitrum.llamarpc.com";
      break;
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
      throw new Error("Unsupported chainId");
  }

  return new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
}
