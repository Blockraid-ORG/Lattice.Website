export type TStableGroup = {
  id: string
  name: string
}

export type TMasterPayment = {
  id: string
  paymentSc: string
  listingFee: string
  presaleFee: number
  decimal: number
  status: boolean
  stableCoin: {
    id: string
    address: string
    chain: {
      id: string
      name: string
      ticker: string
    }
    stableCoin: {
      id: string
      name: string
    }
  }
}