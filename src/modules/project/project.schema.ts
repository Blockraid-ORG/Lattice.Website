import { z } from "zod"
export const allocationSchema = z.object({
  name: z.string().min(1),
  supply: z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"),
  vesting: z.coerce.number().min(0),
  startDate: z.coerce.date(),
  isPresale: z.boolean().optional(),
})

export const presalesSchema = z.object({
  hardcap: z.coerce.number().min(1, "Hard cap required"),
  price: z.coerce.number().min(0.00000001, "Price must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  maxContribution: z.coerce.number().min(0, "Max contribution required"),
  duration: z.coerce.number().min(1, "Duration is required"),
  startDate: z.coerce.date(),
  claimTime: z.coerce.number().min(0),
})
export const socialSchema = z.object({
  socialId: z.string().uuid(),
  url: z.string().url(),
})

export const formCreateProjectSchema = z.object({
  name: z.string().min(1),
  logo: z.string().min(1),
  slug: z.string().optional(),
  banner: z.string().min(1),
  ticker: z.string().min(1),
  decimals: z.coerce.number().min(10),
  totalSupply: z.coerce.number().min(1),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DEPLOYED']),
  detail: z.string().min(1),
  categoryId: z.string().uuid(),
  chainId: z.string().uuid(),
  allocations: z.array(allocationSchema).refine((allocs) => {
    const total = allocs.reduce((sum, a) => sum + a.supply, 0)
    return total === 100
  }, {
    message: "Total supply allocations must not exceed 100%",
    path: ["allocations"]
  }),
  presales: z.array(presalesSchema).optional(),
  socials: z.array(socialSchema),
})

export const formFilterProjectSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DEPLOYED']),
})

export const formBuyPresale = (max: number) => z.object({
  amount: z.coerce.number().min(1, "Amount required").max(max, `Max contribution ${max}`),
})
