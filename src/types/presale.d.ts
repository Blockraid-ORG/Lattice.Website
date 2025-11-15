export type TPresaleSC = {
  // startTime: number
  // endTime: number
  // whitelistDuration: number,
  // claimDelay: number
  // claimTime: number
  // finalized: boolean
  // hardCap: string
  // totalRaised: string
  // tokensNeeded: string

  startTime: number
  endTime: number
  claimTime: number
  claimDelay: number
  finalized: boolean,
  hardCap: string
  totalRaised: string
  tokensNeeded: string
  initialReleaseBps: string
  cliffDuration: number
  vestingDuration: number
  sweepDuration: number
}

export type TContributionInfo = {
  claimable: string
  contribution: string
  claimedToken: string
  isRefunded: boolean
} | null