import { formFaucetSchema } from "@/modules/faucet/faucet.schema"

export type TFaucet = {
  id: string
  address: string
  userId: string
  amount: string
  unit: string
  txHash: string | null,
}
export type TFormFaucet = z.infer<typeof formFaucetSchema>