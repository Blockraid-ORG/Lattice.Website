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
    id: "presaleWhitelist",
    title: "Presales Info",
    description:
      "Enable Whitelist — Do you want to restrict access so only approved wallets can join?",
  },
];
