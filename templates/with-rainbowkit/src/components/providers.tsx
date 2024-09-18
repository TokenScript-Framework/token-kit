"use client";
import { config } from "@/wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { TokenTxSonnerProvider } from "./token-kit/token-tx-sonner";

const client = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <TokenTxSonnerProvider>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </TokenTxSonnerProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
