import { z } from "zod";
export const allocationSchema = z.object({
  name: z.string().min(1),
  supply: z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"),
  vesting: z.coerce.number().min(0),
  startDate: z.coerce.date(),
  isPresale: z.boolean().optional(),
});

export const presalesSchema = z
  .object({
    hardcap: z.coerce.number().min(0.001, "Hard cap required").optional(),
    price: z.coerce
      .number()
      .min(0.00000001, "Price must be greater than 0")
      .optional(),
    unit: z.string().min(1, "Unit is required"),
    maxContribution: z.coerce.number().min(0, "Max contribution required"),
    duration: z.coerce.number().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    claimTime: z.coerce.number().min(0).optional(),
    whitelistDuration: z.coerce.number().optional(),
    whitelistAddress: z.string().optional(),
    sweepDuration: z.coerce.number().min(0).optional(),
    presaleSCID: z.string().nullable().optional(),
    initialReleaseBps: z.coerce.number(),
    cliffDuration: z.coerce.number(),
    vestingDuration: z.coerce.number(),
    unitTimeCliffDuration: z.enum(["day", "month"]),
    unitTimeVestingDuration: z.enum(["day", "month"]),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End Date cannot be earlier than Start Date",
      path: ["endDate"], // error diarahkan ke endDate
    }
  );
export const socialSchema = z.object({
  socialId: z.string().uuid(),
  url: z.string(),
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
  socials: z.array(socialSchema).superRefine((socials, ctx) => {
    if (socials.length === 0) return;

    const firstUrl = socials[0].url;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(firstUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid email address (e.g. example@email.com)",
        path: [0, "url"],
      });
    }

    for (let i = 1; i < socials.length; i++) {
      const url = socials[i].url;
      try {
        new URL(url);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid URL (e.g. https://example.com)`,
          path: [i, "url"],
        });
      }
    }
  }),
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
