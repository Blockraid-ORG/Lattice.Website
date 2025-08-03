import { formUpdateWhitelistSchema } from "@/modules/deploy/deploy.schema"

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

export type TSetWhitelist = {
  id: string
  whitelistContract: string
}
export type TSetPresale = {
  id: string
  whitelistContract: string
  contractAddress: string
}

export type TFormUpdateWhitelist = z.infer<typeof formUpdateWhitelistSchema>