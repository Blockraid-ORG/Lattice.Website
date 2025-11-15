export type StepId =
  | "intro"
  | "cover"
  | "logo"
  | "name"
  | "ticker"
  | "decimals"
  | "chainId"
  | "categoryId"
  | "projectTypeId"
  | "totalSupply"
  | "detail"
  | "socialPlatform"
  | "socialUrl"
  | "socialAddMore"
  | "allocIntro"
  | "allocSupply"
  | "allocName"
  | "allocVesting"
  | "allocStartDate"
  | "allocAddMore"
  | "allocTotal"
  | "presaleHardcap"
  | "presalePrice"
  | "presaleMaxContribution"
  | "presaleStartDate"
  | "presaleDuration"
  | "presaleClaimAfter"
  | "presaleWhitelist";

export type Step = {
  id: StepId;
  title: string;
  description?: string;
  validateFields?: string[];
};
