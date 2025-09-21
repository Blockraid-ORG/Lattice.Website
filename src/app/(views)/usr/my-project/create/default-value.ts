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
  projectTypeId: '',
  allocations: [
    {
      name: "Deployer",
      supply: 0,
      vesting: 0,
      startDate: new Date().toISOString(),
      isPresale: false,
    },
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
      hardcap: 1,
      price: 1,
      maxContribution: 1,
      startDate: new Date().toISOString(),
      whitelistDuration: 1,
      sweepDuration: 1,
      duration: 1,
      claimTime: 0,
      unit: '',
    }
  ],
}