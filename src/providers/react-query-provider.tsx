"use client";

import { IWeb3AuthState, WEB3AUTH_NETWORK, WEB3AUTH_NETWORK_TYPE } from "@web3auth/modal";
import {
  Web3AuthProvider,
  type Web3AuthContextConfig,
} from "@web3auth/modal/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import React from "react";

const clientId = process.env.W3AUTH_CLIENT_ID ?? "";
const envNetwork = process.env.W3AUTH_NETWORK ?? "SAPPHIRE_DEVNET";
const web3AuthNetwork: WEB3AUTH_NETWORK_TYPE = WEB3AUTH_NETWORK[envNetwork as keyof typeof WEB3AUTH_NETWORK];
const queryClient = new QueryClient();
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: web3AuthNetwork,
    ssr: true,
    uiConfig: {
      mode: "auto",
      loginMethodsOrder: ["external_wallet", "email_passwordless"],
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
        <WagmiProvider>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
