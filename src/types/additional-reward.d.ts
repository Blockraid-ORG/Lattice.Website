import { z } from "zod"
import { formAdditionalRewardSchema } from "@/modules/additional-rewards/additional-reward.schema"


export type TFormAdditionalReward = z.infer<typeof formAdditionalRewardSchema>

export type TAdditionalReward = {
  id: string
  amount: string
  endDateClaim: string
  startDateClaim: string
  contactAddress: string | null,
  type: {
    name: string
  }
  project: {
    id: string
    name: string
  }
}
