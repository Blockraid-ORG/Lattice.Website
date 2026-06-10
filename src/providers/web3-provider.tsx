"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, projectId, networks } from "@/lib/web3/config";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter] as any,
  projectId,
  networks: networks as any,
  metadata: {
    name: "Terravest",
    description: "Terravest Launchpad",
    url: "https://alpha.terravest.capital",
    icons: ["https://alpha.terravest.capital/logo/logo-dark.png"],
  },
  features: {
    analytics: true,
    email: false
  },
});

export default function Web3Provider({
  children,
  // cookies,
}: {
    children: ReactNode;
    // cookies: string | null
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}