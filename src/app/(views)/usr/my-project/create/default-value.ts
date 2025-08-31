export const defaultValues = {
  name: '',
  slug: '',
  logo: 'logo.png',
  banner: 'banner.png',
  ticker: '',
  decimals: '18',
  totalSupply: '0',
  detail: '',
  status: 'PENDING',
  categoryId: '',
  allocations: [
    {
      name: "Presale",
      supply: 0,
      vesting: 0,
      startDate: new Date().toISOString(),
      isPresale: false,
    }
  ],
  socials: [
    {
      socialId: '',
      url: '',
    },
  ],
  presales: [
    {
      hardcap: '',
      price: '',
      maxContribution: '',
      startDate: new Date().toISOString(),
      whitelistDuration: 0,
      sweepDuration: 0,
      duration: 0,
      claimTime: 0,
      unit: '',
    }
  ],
}