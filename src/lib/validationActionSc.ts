import { TPresaleSC } from "@/types/presale";
import dayjs from "dayjs";

export const checkIsClaimPresaleAvail = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    const now = dayjs().unix()
    const claimTime = presaleSc.claimTime
    const claimTimeAvailable = now >= claimTime
    const isAvailableClaim = claimTimeAvailable && presaleSc.finalized
    return isAvailableClaim
  }
}

export const checkIsRefundPresaleAvail = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    const now = dayjs().unix()
    const endTime = presaleSc.endTime
    const isAvailableRefund = now >= endTime && !presaleSc.finalized
    return isAvailableRefund
  }
}

export const getTimeClaim = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    const claimTime = (presaleSc.endTime + presaleSc.claimDelay) * 1000
    return claimTime;
  }
}

export const isAvailableContribute = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    const now = dayjs().unix()
    if (presaleSc.finalized) return false
    if (now < presaleSc.startTime) return false
    if (now > presaleSc.endTime) return false
    if (presaleSc.totalRaised === presaleSc.hardCap) return false
    return true
  }
}

export const isUnitPresaleStable = (unit:string) => {
  return unit === 'USDT' || unit === 'USDC';
}