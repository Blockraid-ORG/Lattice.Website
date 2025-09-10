export const detailProjectTabs = [
  {
    value: 0,
    label: 'Detail'
  },
  {
    value: 1,
    label: 'Token Unlocks'
  }
]

export const vestingCounts = [
  { value: '0', label: '0 Month' },
  { value: '1', label: '1 Month' },
  { value: '2', label: '2 Month' },
  { value: '3', label: '3 Month' },
  { value: '4', label: '4 Month' },
  { value: '5', label: '5 Month' },
  { value: '6', label: '6 Month' },
  { value: '7', label: '7 Month' },
  { value: '8', label: '8 Month' },
  { value: '9', label: '9 Month' },
  { value: '10', label: '10 Month' },
  { value: '20', label: '20 Month' },
  { value: '40', label: '30 Month' },
  { value: '30', label: '40 Month' },
  { value: '50', label: '50 Month' },
  { value: '80', label: '80 Month' },
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