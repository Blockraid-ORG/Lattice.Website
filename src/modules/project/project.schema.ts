import { z } from "zod";
export const allocationSchema = z.object({
  name: z.string().min(1),
  supply: z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"),
  vesting: z.coerce.number().min(0),
  startDate: z.coerce.date(),
  isPresale: z.boolean().optional(),
});

export const presalesSchema = z.object({
  hardcap: z.coerce.number().min(0.001, "Hard cap required").optional(),
  price: z.coerce.number().min(0.00000001, "Price must be greater than 0").optional(),
  unit: z.string().min(1, "Unit is required"),
  maxContribution: z.coerce.number().min(0, "Max contribution required").optional(),
  duration: z.coerce.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  claimTime: z.coerce.number().min(0).optional(),
  whitelistDuration: z.coerce.number().optional(),
  whitelistAddress: z.string().optional(),
  sweepDuration: z.coerce.number().min(0).optional(),
  presaleSCID: z.string().optional(),
}).refine(
  (data) =>
    !data.startDate || !data.endDate || data.endDate >= data.startDate,
  {
    message: "End Date cannot be earlier than Start Date",
    path: ["endDate"], // error diarahkan ke endDate
  }
)
export const socialSchema = z.object({
  socialId: z.string().uuid(),
  url: z.string().url(),
});

export const formCreateProjectSchema = z.object({
  name: z.string().min(1),
  logo: z.string().min(1),
  slug: z.string().optional(),
  whitelistAddress: z.string().optional(),
  banner: z.string().min(1),
  ticker: z.string().min(3).max(5),
  decimals: z.coerce.number().min(1),
  totalSupply: z.coerce.number().min(1),
  whitelistDuration: z.coerce.number().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "DEPLOYED"]),
  detail: z.string().min(1),
  categoryId: z.string().uuid(),
  projectTypeId: z.string().uuid(),
  chainId: z.string().uuid(),
  allocations: z.array(allocationSchema).refine(
    (allocs) => {
      const total = allocs.reduce((sum, a) => sum + a.supply, 0);
      return total === 100;
    },
    {
      message: "Total supply allocations must not exceed 100%",
      path: ["allocations"],
    }
  ),
  // presales: z.array(presalesSchema).optional(),
  socials: z.array(socialSchema),
});

export const formFilterProjectSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "DEPLOYED"]),
});

export const formBuyPresale = (max: number) =>
  z.object({
    amount: z.coerce
      .number()
      .min(0.000000001, "Amount required")
      .max(max, `Max contribution ${max}`),
  });

export const formProjectAllocationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  amount: z.coerce
    .number()
    .refine((v) => v > 0, { message: "Must be greater than 0" })
    .refine((v) => v <= 100, { message: "Max 100%" }),
});
export const formBaseProjectAllocationSchema = z.object({
  items: z
    .array(formProjectAllocationSchema)
    .min(1, "At least one recipient is required"),
});
