import { z } from 'zod';

export const formUpdateWhitelistSchema = z.object({
  presaleId: z.string().uuid(),
  walletAddress: z.string(),
});

export const formRemoveAllocationSchema = z.object({
  address: z.string(),
});

export const formProjectAddressWhitelistSchema = z.object({
  projectId: z.string().uuid(),
  walletAddress: z.string(),
});