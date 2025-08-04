import { z } from 'zod';

export const formUpdateWhitelistSchema = z.object({
  presaleId: z.string().uuid(),
  walletAddress: z.string(),
});