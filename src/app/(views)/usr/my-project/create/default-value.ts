export const defaultValues = {
  name: "",
  slug: "",
  logo: "logo.png",
  banner: "banner.png",
  ticker: "",
  decimals: "18",
  totalSupply: "0",
  detail: "",
  status: "PENDING",
  categoryId: "",
  projectTypeId: "",
  whitelistDuration: 0,
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
    },
  ],
  socials: [
    {
      socialId: "",
      url: "",
    },
  ],
};
