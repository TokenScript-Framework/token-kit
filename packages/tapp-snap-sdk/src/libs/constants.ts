export const TAPP_SNAP_ID =
  process.env.NEXT_PUBLIC_TAPP_SNAP_ID || "npm:@token-kit/tapp-snap";

export const SNAP_METHOD = "import";

export const DEFAULT_CSS =
  "flex justify-center min-w-32 max-w-40 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 ";

export enum ChainId {
  MAINNET = 1,
  SEPOLIA = 11155111,
  BASE_SEPOLIA = 84532,
}

interface NetworkInfo {
  rpcUrl: string;
  explorerUrl: string;
}

export const NETWORK_INFO: Record<ChainId, NetworkInfo> = {
  [ChainId.MAINNET]: {
    rpcUrl: "https://rpc.payload.de",
    explorerUrl: "https://etherscan.io/",
  },
  [ChainId.SEPOLIA]: {
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io/",
  },
  [ChainId.BASE_SEPOLIA]: {
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org/",
  },
};
