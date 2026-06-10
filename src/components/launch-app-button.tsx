// 'use client'
// import React from 'react'
// import { Button } from './ui/button'
// import Link from 'next/link'
// import { Icon } from './icon'
// import { Web3Provider } from '@ethersproject/providers'
// import { useRouter } from 'next/navigation'
// // import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react'
// import { useRequestNonce, useVerifySignature } from '@/modules/auth/auth.query'
// export default function LaunchAppButton() {
//   const router = useRouter()
//   const { provider } = useWeb3Auth();
//   const {
//     connect,
//     isConnected,
//     loading: connecting,
//   } = useWeb3AuthConnect();
//   const { disconnect } = useWeb3AuthDisconnect()
//   const { mutate: requestNonce } = useRequestNonce()
//   const { mutate: verifySignature } = useVerifySignature()
//   async function handleConnect() {
//     try {
//       await connect();
//       const web3Provider = provider;
//       if (!web3Provider) return;
//       const result = await web3Provider.request({ method: 'eth_accounts' });
//       const accounts = Array.isArray(result) ? result as string[] : [];
//       const address = accounts[0];

//       requestNonce({ walletAddress: address }, {
//         onSuccess: async (data) => {
//           try {
//             const nonce = data.data.nonce;
//             const ethersProvider = new Web3Provider(web3Provider);
//             const signer = ethersProvider.getSigner();
//             const signature = await signer.signMessage(nonce);

//             verifySignature({
//               walletAddress: address,
//               signature,
//             }, {
//               onSuccess: () => {
//                 window.location.href = '/usr'
//                 router.push('/usr')
//               }
//             });
//           } catch (err: any) {
//             if (err.code === 4001) {
//               disconnect()
//             } else {
//               console.error("❌ Error signing message", err);
//             }
//           }
//         }
//       })
//     } catch (error: any) {
//       if (error.code === 4001) {
//         console.warn("🛑 User rejected wallet connection");
//       } else {
//         console.error("❌ Error during wallet connection", error);
//       }
//     }

//   }
//   return (
//     <div>
//       {
//         isConnected ? (
//           <Button asChild size={"lg"}>
//             <Link href={'/usr'}><Icon name='mingcute:rocket-fill' /> Launch App</Link>
//           </Button>
//         ) : (
//             <Button disabled={connecting} onClick={handleConnect}>
//             <Icon name='mingcute:rocket-fill' /> Launch App
//           </Button>
//         )
//       }
//     </div>
//   )
// }
// import React from 'react'

// export const LaunchAppButton = () => {
//   return (
//     <div>LaunchAppButton</div>
//   )
// }

"use client";

import React from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Button } from "./ui/button";

import { Icon } from "./icon";

import {
  useRequestNonce,
  useVerifySignature,
} from "@/modules/auth/auth.query";

import {
  useAccount,
  useDisconnect,
} from "wagmi";

import { useAppKit } from "@reown/appkit/react";

import { BrowserProvider } from "ethers";

export default function LaunchAppButton() {
  const router = useRouter();

  const { open } = useAppKit();

  const { address, isConnected } =
    useAccount();

  const { disconnect } =
    useDisconnect();

  const { mutate: requestNonce } =
    useRequestNonce();

  const { mutate: verifySignature } =
    useVerifySignature();

  async function handleConnect() {
    try {
      if (!isConnected) {
        await open();

        return;
      }

      if (!address) return;

      const ethereum = (window as any)
        .ethereum;

      if (!ethereum) return;

      const provider =
        new BrowserProvider(
          ethereum
        );

      const signer =
        await provider.getSigner();

      requestNonce(
        {
          walletAddress: address,
        },
        {
          onSuccess: async (
            data
          ) => {
            try {
              const nonce =
                data.data.nonce;

              const signature =
                await signer.signMessage(
                  nonce
                );

              verifySignature(
                {
                  walletAddress:
                    address,
                  signature,
                },
                {
                  onSuccess:
                    () => {
                      router.push(
                        "/usr"
                      );
                    },
                }
              );
            } catch (err: any) {
              if (
                err.code === 4001
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
        }
      );
    } catch (error: any) {
      if (error.code === 4001) {
        console.warn(
          "🛑 User rejected wallet connection"
        );
      } else {
        console.error(
          "❌ Error during wallet connection",
          error
        );
      }
    }
  }

  return (
    <div>
      {isConnected ? (
        <Button asChild size={"lg"}>
          <Link href={"/usr"}>
            <Icon name="mingcute:rocket-fill" />
            Launch App
          </Link>
        </Button>
      ) : (
        <Button
          onClick={handleConnect}
        >
          <Icon name="mingcute:rocket-fill" />
          Launch App
        </Button>
      )}
    </div>
  );
}