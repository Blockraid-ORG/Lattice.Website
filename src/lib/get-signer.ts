import { BrowserProvider } from "ethers"

export async function getSigner() {
  if (typeof window === 'undefined') {
    throw new Error('Window not found')
  }

  const ethereum = (window as any).ethereum

  if (!ethereum) {
    throw new Error('Ethereum provider not found')
  }

  const provider = new BrowserProvider(
    ethereum
  )

  return provider.getSigner()
}