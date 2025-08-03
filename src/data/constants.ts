export const detailProjectTabs = [
  {
    value: 0,
    label: 'Detail'
  },
  // {
  //   value: 1,
  //   label: 'Token Unlocks'
  // }
]

export const vestingCounts = [
  { value: '1', label: '1 Month' },
  { value: '2', label: '2 Month' },
  { value: '4', label: '4 Month' },
  { value: '10', label: '10 Month' },
  { value: '20', label: '20 Month' },
  { value: '30', label: '30 Month' },
  { value: '40', label: '40 Month' },
  { value: '50', label: '50 Month' },
  { value: '60', label: '60 Month' },
  { value: '70', label: '70 Month' },
  { value: '80', label: '80 Month' },
  { value: '90', label: '90 Month' },
  { value: '100', label: '100 Month' },
]

export const presaleDurationCount = (count: number) => {
  const x = Array.from({ length: count || 10 }, (_, i) => i + 1)
  return x.map(i => {
    return {
      value: `${i}`,
      label: `${i} Day`
    }
  })
};

export const presalesDurations = presaleDurationCount(100)