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
    // current time
    const now = dayjs().unix()
    // endtime presale
    const endTime = presaleSc.endTime
    // const claimTime = presaleSc.claimTime
    
    const claimTimeAvailable = now >= endTime && !presaleSc.finalized
    // button claim available if
    // const isAvailableRefund = claimTimeAvailable && presaleSc.finalized
    return claimTimeAvailable
  }
}

export const getTimeClaim = (presaleSc?: TPresaleSC | null) => {
  if (presaleSc) {
    const claimTime = (presaleSc.endTime + presaleSc.claimDelay) * 1000
    return claimTime;
  }
  
}