'use client'

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { useFaucetHook } from "@/modules/faucet/faucet.hook"
import Link from "next/link"
// import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useChainId, useSwitchChain } from "wagmi"

export default function FaucetContent() {
  // const router = useRouter()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain();
  const { requestETH, requestERC } = useFaucetHook()
  function handleRequestETH() {
    requestETH()
  }
  function handleRequestERC(addr: string, unit: string) {
    requestERC(addr, unit)
  }
  useEffect(() => {
    if (chainId !== 97) {
      switchChain({ chainId: 97 })
    }
  }, [chainId, switchChain])
  return (
    <section className="py-6 md:py-32">
      <div className="container">
        <div className="text-center mb-6 text-sm md:text-base">
          <p>
            Claim free test tokens to explore and test the <b>Terravest ecosystem</b>.
          </p>
          <p>
            You can request tBNB, USDT, or USDC for development and testing purposes on the testnet.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild size={'lg'} className="items-center">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={'https://www.bnbchain.org/en/testnet-faucet'}
            >
              <Icon name="ri:bnb-line" />
              <div>tBNB Faucet</div>
            </Link>
          </Button>
          <Button onClick={handleRequestETH} size={'lg'} className="items-center">
            <Icon name="ri:bnb-line" />
            <div>
              Request tBNB test
            </div>
          </Button>

          {/* logic cek usdt atau usdc */}
          <Button
            onClick={() => handleRequestERC('0x660fA7135134D3b182f21eD2997A7E4aF146C64D', 'USDT')}
            size={'lg'} className="items-center">
            <Icon name="cryptocurrency:usdt" />
            <div>
              Request USDT
            </div>
          </Button>
          <Button onClick={() => handleRequestERC('0xb3b6B63d163C6d149b7f89Ee6c308CD9fD4b2734', 'USDC')} size={'lg'} className="items-center">
            <Icon name="mingcute:usd-coin-usdc-line" />
            <div>
              Request USDC
            </div>
          </Button>
        </div>
      </div>
    </section>
  )
}
