'use client'
import { cn } from '@/lib/utils'
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react'
import { Icon } from './icon'
import { Button } from './ui/button'
import { WalletButtonConnected } from './wallet-button-connected'

import { useRequestNonce, useVerifySignature } from '@/modules/auth/auth.query'
import { Web3Provider } from '@ethersproject/providers'
import { useRouter } from 'next/navigation'
export default function WalletButton({ withText }: { withText?: boolean }) {
  const router = useRouter()
  const {
    connect,
    isConnected,
    loading: connecting,
  } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect()
  const { mutate: requestNonce } = useRequestNonce()
  const { mutate: verifySignature } = useVerifySignature()

  async function handleConnect() {
    try {
      const web3Provider = await connect();
      if (!web3Provider) return;
      const result = await web3Provider.request({ method: 'eth_accounts' });
      const accounts = Array.isArray(result) ? result as string[] : [];
      const address = accounts[0];

      requestNonce({ walletAddress: address }, {
        onSuccess: async (data) => {
          try {
            const nonce = data.data.nonce;
            const provider = new Web3Provider(web3Provider);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(nonce);

            verifySignature({
              walletAddress: address,
              signature,
            }, {
              onSuccess: () => {
                window.location.href = '/usr'
                router.push('/usr')
              }
            });
          } catch (err: any) {
            if (err.code === 4001) {
              disconnect()
            } else {
              console.error("❌ Error signing message", err);
            }
          }
        }
      })
    } catch (error:any) {
      if (error.code === 4001) {
        console.warn("🛑 User rejected wallet connection");
      } else {
        console.error("❌ Error during wallet connection", error);
      }
    }

  }
  return (
    <div>
      <>
        {
          isConnected ? (
            <WalletButtonConnected />
          ) : (
            <>
              <Button disabled={connecting} onClick={handleConnect} className='hidden md:flex'>
                <Icon name='solar:wallet-2-bold' />
                <p>Connect</p>
              </Button>
              <Button disabled={connecting} onClick={handleConnect} size={withText ? "default" : "icon"} className='md:hidden'>
                <Icon name='solar:wallet-2-bold' />
                <p className={cn(
                  withText ? 'block' : 'hidden'
                )}>Connect</p>
              </Button>
            </>
          )
        }
      </>

    </div>
  )
}
