"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/registry/default/lib/utils";

const queryClient = new QueryClient();

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <NextThemesProvider {...props}>
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          </NextThemesProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
