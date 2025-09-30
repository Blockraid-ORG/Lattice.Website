import dayjs from "dayjs"
import { TPresaleSC } from "@/types/presale";

export const checkIsClaimPresaleAvail = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    // current time
    const now = dayjs().unix()
    // endtime presale
    const endTime = presaleSc.endTime
    // claim time  = endtime + claimDelay(on second) >= now
    const claimTimeAvailable = now >= (endTime + presaleSc.claimDelay)
    // button claim available if
    const isAvailableClaim = claimTimeAvailable && presaleSc.finalized
    console.log({ isAvailableClaim, presaleSc })
    return isAvailableClaim
  }
}

export const checkIsRefundPresaleAvail = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    // current time
    const now = dayjs().unix()
    // endtime presale
    const endTime = presaleSc.endTime
    
    const claimTimeAvailable = endTime >= now && !presaleSc.finalized
    // button claim available if
    const isAvailableRefund = claimTimeAvailable && presaleSc.finalized
    return isAvailableRefund
  }
}

export const getTimeClaim = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    const claimTime = (presaleSc.endTime + presaleSc.claimDelay) * 1000
    return claimTime;
  }
  
}