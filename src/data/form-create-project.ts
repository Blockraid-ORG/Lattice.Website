import { Step } from "@/types/form-create-project";
export const steps: Step[] = [
  {
    id: "intro",
    title: "Newbie Mode",
    description:
      "Mode — Choose how you want to start: I'm Web3 Native or I'm Web3 Newbie. In Newbie mode, friendly tips are enabled.",
  },
  {
    id: "cover",
    title: "Cover Image",
    description:
      "Can you set the scene with a wide banner that stays light so the page loads fast?",
  },
  {
    id: "logo",
    title: "Logo",
    description:
      "Will you add a crisp square logo so people recognize you at a glance?",
  },
  {
    id: "name",
    title: "Name",
    description: "What should we call your project?",
    validateFields: ["name"],
  },
  {
    id: "ticker",
    title: "Ticker",
    description: "e.g. SPN",
    validateFields: ["ticker"],
  },
  {
    id: "decimals",
    title: "Decimal",
    description: "Usually 18",
    validateFields: ["decimals"],
  },
  {
    id: "chainId",
    title: "Select Chain",
    description: "Start with BNB if you're new",
    validateFields: ["chainId"],
  },
  {
    id: "categoryId",
    title: "Select Category",
    description: "Pick the best fit",
    validateFields: ["categoryId"],
  },
  {
    id: "projectTypeId",
    title: "Select Type",
    description: "Equity, Debt, or Fund",
    validateFields: ["projectTypeId"],
  },
  {
    id: "totalSupply",
    title: "Total Supply",
    description: "e.g. 100000000",
    validateFields: ["totalSupply"],
  },
  {
    id: "detail",
    title: "Description",
    description: "One or two lines to introduce your project",
    validateFields: ["detail"],
  },
  {
    id: "socialPlatform",
    title: "Website / Social Media",
    description:
      "Add your site and social links so investors can check quickly. You can add multiple platforms and URLs.",
  },
  {
    id: "allocIntro",
    title: "Allocations",
    description:
      "Split your token supply into slices like Team, Community, Investors, Presale. You can add multiple allocations and manage them all in one place.",
  },
  {
    id: "presaleUnit",
    title: "Presales Info",
    description: "Unit — What will buyers pay with—USDT or another token?",
  },
  // {
  //   id: "presaleHardcap",
  //   title: "Presales Info",
  //   description:
  //     "Hard Cap — What’s the maximum you plan to raise this round—say 100000?",
  // },
  // {
  //   id: "presalePrice",
  //   title: "Presales Info",
  //   description: "Price Per Token — What’s the price for one token—like 0.01?",
  // },
  // {
  //   id: "presaleMaxContribution",
  //   title: "Presales Info",
  //   description:
  //     "Max Contribution — What’s the per-wallet cap to keep things fair—maybe 500?",
  // },
  // {
  //   id: "presaleStartDate",
  //   title: "Presales Info",
  //   description: "Start Date — When will the sale open?",
  // },
  // {
  //   id: "presaleDuration",
  //   title: "Presales Info",
  //   description:
  //     "Duration — How long will the sale window stay open—like 14 days?",
  // },
  // {
  //   id: "presaleClaimAfter",
  //   title: "Presales Info",
  //   description: "Claim Available After — When can buyers claim their tokens?",
  // },
  {
    id: "presaleWhitelist",
    title: "Presales Info",
    description:
      "Enable Whitelist — Do you want to restrict access so only approved wallets can join?",
  },
];
