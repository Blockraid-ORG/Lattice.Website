import { formChainSchema } from "@/modules/chain/schema"
import { z } from "zod"


export type TFormChain = z.infer<typeof formChainSchema>

export type TChain = {
  id: string
  name: string
  ticker: string
  logo: string
  urlScanner: string
  urlRpc: string
  type: string
  chainid: number
}
