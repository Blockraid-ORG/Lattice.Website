export type TRequestNonce = {
  walletAddress: string
}

export type TVerifySignature = {
  walletAddress: string
  signature: string
}

export type TFormSignVanity = {
  name: string
  symbol: string
  initialSupply: number
  decimals: number
  rpc: string
}

export type TSignVanityResponse = {
  message: string
  signature: string
  signer: string
}