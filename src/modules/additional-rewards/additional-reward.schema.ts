"use client"

import { z } from "zod"
export const formAdditionalRewardSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.string(),
  startDateClaim: z.string().min(1, {
    message:'required'
  }),
  duration: z.coerce.number().int().positive(),
  unitTime: z.enum(['day', 'month']),
  scheduleId: z.string().uuid().optional(),
})