"use client"

import { z } from "zod"
export const formFaucetSchema = z.object({
  address: z.string().min(1, { message: 'required' }),
  amount: z.string().optional(),
  unit: z.string().optional(),
  txHash: z.string().optional(),
})