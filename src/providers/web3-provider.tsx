"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, projectId, networks } from "@/lib/web3/config";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: networks as any,
  metadata: {
    name: "My App",
    description: "My App Description",
    url: "https://example.com",
    icons: ["https://example.com/logo.png"],
  },
  features: {
    analytics: true,
  },
});

export default function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}