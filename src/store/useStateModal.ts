import { create } from 'zustand'

type TModalStore = {
  open: boolean
  setOpen: (open: boolean) => void
  openDistribute: boolean
  setOpenDistribute: (openDistribute: boolean) => void
}

export const useStateModal = create<TModalStore>()((set) => ({
  open: false,
  setOpen: (open) => set(() => ({ open })),
  openDistribute: false,
  setOpenDistribute: (openDistribute) => set(() => ({ openDistribute })),
}))