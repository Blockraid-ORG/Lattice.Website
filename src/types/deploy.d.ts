export type TBalance = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
} | undefined

export type TFormVerifyProject = {
  projectId: string
  status: string
  note: string
  contractAddress?: string
}