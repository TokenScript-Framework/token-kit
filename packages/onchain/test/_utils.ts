const RPC_URLS: Record<number, string> = {
  1: "https://rpc.payload.de",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
  84532: "https://sepolia.base.org",
};

export function getRPCURL(chainId: number): string {
  return RPC_URLS[chainId];
}
