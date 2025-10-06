export type TPresaleSC = {
  startTime: number
  endTime: number
  whitelistDuration: number,
  claimDelay: number
  claimTime: number
  finalized: boolean
  hardCap: string
  totalRaised: string
  tokensNeeded: string
}

export type TContributionInfo = {
  claimable: string
  contribution: string
  claimedToken: string
  isRefunded: boolean
} | null