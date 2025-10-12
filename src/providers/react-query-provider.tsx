"use client";

import {
  IWeb3AuthState,
  WEB3AUTH_NETWORK,
  WEB3AUTH_NETWORK_TYPE,
} from "@web3auth/modal";
import {
  Web3AuthProvider,
  type Web3AuthContextConfig,
} from "@web3auth/modal/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import React from "react";
import { config } from "@/lib/wagmi"; // Import wagmi config

const clientId = process.env.W3AUTH_CLIENT_ID ?? "";
const envNetwork = process.env.W3AUTH_NETWORK ?? "SAPPHIRE_DEVNET";
const web3AuthNetwork: WEB3AUTH_NETWORK_TYPE =
  WEB3AUTH_NETWORK[envNetwork as keyof typeof WEB3AUTH_NETWORK];
const queryClient = new QueryClient();

// Check if Web3Auth client ID is configured
if (!clientId) {
  console.error(
    "❌ CRITICAL: W3AUTH_CLIENT_ID is missing! Wallet connection will fail."
  );
  console.error("Please set W3AUTH_CLIENT_ID in your .env.local file");
}
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: web3AuthNetwork,
    ssr: true,
    uiConfig: {
      mode: "auto",
      loginMethodsOrder: ["wallet"],
    },
  },
};

export default function ReactQueryProvider({
  children,
  web3authInitialState,
}: {
  children: React.ReactNode;
  web3authInitialState: IWeb3AuthState | undefined;
}) {
  return (
    <Web3AuthProvider
      config={web3AuthContextConfig}
      initialState={web3authInitialState}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
