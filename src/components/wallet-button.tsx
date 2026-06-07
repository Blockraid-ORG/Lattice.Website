"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { Icon } from "./icon";
import { Button } from "./ui/button";
import { WalletButtonConnected } from "./wallet-button-connected";

import {
  useLogout,
  useRequestNonce,
  useVerifySignature,
} from "@/modules/auth/auth.query";

import {
  useAccount,
  useDisconnect,
  useSignMessage,
} from "wagmi";

import { useAppKit } from "@reown/appkit/react";

export default function WalletButton({
  withText,
}: {
  withText?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { mutate: requestNonce } = useRequestNonce();
  const { mutate: verifySignature } = useVerifySignature();
  const { mutate: logout } = useLogout();
  const hasSignedRef = useRef(false);
  async function handleConnect() {
    try {
      await open();
    } catch (error) {
      console.error("❌ Error opening wallet modal", error);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    async function login() {
      if (
        !isConnected ||
        !address ||
        hasSignedRef.current ||
        token
      ) {
        return;
      }

      try {
        hasSignedRef.current = true;
        requestNonce({ walletAddress: address}, {
            onSuccess: async (data) => {
              try {
                const nonce =
                  data.data.nonce;
                const message =
                  `Welcome To Terravest\n\n` +
                  `Agree to Presale Terms\n\n` +
                  `To participate in the Terravest presale, you must agree to the following terms:\n\n` +
                  `By signing, you acknowledge and agree to the Terravest presale terms and conditions.\n` +
                  `You understand that participation is subject to all applicable laws and regulations, and you have read and accept the full terms at terravest.capital/terms.\n\n` +
                  `Nonce: ${nonce}`;
                const signature = await signMessageAsync({ message });
                verifySignature(
                  { walletAddress:  address, signature },{
                    onSuccess: (response ) => {
                      localStorage.setItem("accessToken", response?.data?.accessToken);
                      router.push(redirect || "/usr");
                    },
                    onError: (error) => {
                      console.error(
                        "❌ Verify signature error",
                        error
                      );

                      hasSignedRef.current =
                        false;
                    },
                  }
                );
              } catch (err: any) {
                hasSignedRef.current =
                  false;

                if (
                  err?.code === 4001
                ) {
                  disconnect();
                } else {
                  console.error(
                    "❌ Error signing message",
                    err
                  );
                }
              }
            },

            onError: (error) => {
              console.error(
                "❌ Request nonce error",
                error
              );

              hasSignedRef.current =
                false;
            },
          }
        );
      } catch (error) {
        hasSignedRef.current = false;

        console.error(
          "❌ Login flow error",
          error
        );
      }
    }

    login();
  }, [
    isConnected,
    address,
    redirect,
    requestNonce,
    verifySignature,
    signMessageAsync,
    disconnect,
    router,
  ]);

  useEffect(() => {
    if (!isConnected) {
      hasSignedRef.current = false;
      localStorage.removeItem("accessToken");
      logout();
    }
  }, [isConnected, logout]);
  return (
    <div>
      {isConnected ? (
        <WalletButtonConnected />
      ) : (
        <>
          <Button
            onClick={handleConnect}
            className="hidden md:flex"
          >
            <Icon name="solar:wallet-2-bold" />
            <p>Connect</p>
          </Button>
          <Button
            onClick={handleConnect}
            size={
              withText
                ? "default"
                : "icon"
            }
            className="md:hidden"
          >
            <Icon name="solar:wallet-2-bold" />

            <p
              className={cn(
                withText
                  ? "block"
                  : "hidden"
              )}
            >
              Connect
            </p>
          </Button>
        </>
      )}
    </div>
  );
}