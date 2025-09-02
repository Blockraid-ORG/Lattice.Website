"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Icon } from "./icon";
import { Web3Provider } from "@ethersproject/providers";
import { useRouter } from "next/navigation";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useRequestNonce, useVerifySignature } from "@/modules/auth/auth.query";
export default function LaunchAppButton() {
  const router = useRouter();
  const { connect, isConnected, loading: connecting } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { mutate: requestNonce } = useRequestNonce();
  const { mutate: verifySignature } = useVerifySignature();
  async function handleConnect() {
    try {
      const web3Provider = await connect();
      if (!web3Provider) return;
      const result = await web3Provider.request({ method: "eth_accounts" });
      const accounts = Array.isArray(result) ? (result as string[]) : [];
      const address = accounts[0];

      requestNonce(
        { walletAddress: address },
        {
          onSuccess: async (data) => {
            try {
              const nonce = data.data.nonce;
              const provider = new Web3Provider(web3Provider);
              const signer = provider.getSigner();
              const signature = await signer.signMessage(nonce);

              verifySignature(
                {
                  walletAddress: address,
                  signature,
                },
                {
                  onSuccess: () => {
                    window.location.href = "/usr";
                    router.push("/usr");
                  },
                }
              );
            } catch (err: any) {
              if (err.code === 4001) {
                disconnect();
              } else {
                "❌ Error signing message", err;
              }
            }
          },
        }
      );
    } catch (error: any) {
      if (error.code === 4001) {
        ("🛑 User rejected wallet connection");
      } else {
        "❌ Error during wallet connection", error;
      }
    }
  }
  return (
    <div>
      {isConnected ? (
        <Button asChild size={"lg"}>
          <Link href={"/usr"}>
            <Icon name="mingcute:rocket-fill" /> Launch App
          </Link>
        </Button>
      ) : (
        <Button disabled={connecting} onClick={handleConnect}>
          <Icon name="mingcute:rocket-fill" /> Launch App
        </Button>
      )}
    </div>
  );
}
