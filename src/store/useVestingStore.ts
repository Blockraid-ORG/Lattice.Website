import { TAllocation } from '@/types/project'
import { create } from 'zustand'

type TVestingStore = {
  data: TAllocation[]
  setData: (data: TAllocation[]) => void
}

export const useVestingStore = create<TVestingStore>()((set) => ({
  data: <TAllocation[]>[],
  setData: (data) => {
    // && i.vesting > 0
    const vesting = data.filter(i => !i.isPresale && i.vesting > 0)
    set({
      data: vesting
    })
  },
}))