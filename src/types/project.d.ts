import {
  allocationSchema,
  formBuyPresale,
  formCreateProjectSchema,
  formFilterProjectSchema,
  presalesSchema,
} from "@/modules/project/project.schema";
import { TCategory } from "./category";
import { TSocial } from "./social";
import { TChain } from "./chain";
import { TProjectType } from "./project-type";

export type TFormProject = z.infer<typeof formCreateProjectSchema>;
export type TFormProjectAllocation = z.infer<typeof allocationSchema>;
export type TFormProjectPresale = z.infer<typeof presalesSchema>;
export type TFormFilterProject = z.infer<typeof formFilterProjectSchema>;
export type TFormBuyPresale = z.infer<typeof formBuyPresale>;

type TAddressWhitelist = {
  id: string;
  walletAddress: string;
};

type TAllocation = {
  id: string
  name: string
  supply: number,
  vesting: number
  startDate: string
  isPresale: boolean,
  contractAddress?: string
  isDeploying?: boolean
}
export type TPresale = {
  id: string
  hardcap: string
  price: string
  maxContribution: string
  duration: string
  unit: string
  claimTime: number,
  startDate: string,
  endDate?: string,
  contractAddress: string | null,
  whitelistContract: string | null,
  whitelists: TAddressWhitelist[] | []
  whitelistDuration?: number
  sweepDuration?: number
}
type TProjectOwner = {
  id: string;
  fullname: string;
  walletAddress: string | null;
  verifications: { status: string }[];
};

export type TProjectReviewLog = {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
  createdBy: string;
};

export type TAdditionalReward = {
  id: string
  address: string
  amount: string
  type: {
    id: string
    name: string
  },
  project: TProject,
  user: {
    id: string
    walletAddress: string
  },
  startDateClaim: string 
  endDateClaim: string
  isClaimed: boolean
  contactAddress: string
}
export type TProject = {
  id: string
  name: string
  slug: string
  logo: string
  banner: string
  ticker: string
  decimals: number
  totalSupply: string
  detail: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "DEPLOYED",
  allocations: TAllocation[]
  contractAddress?: string
  factoryAddress?: string
  lockerDistributed?: boolean,
  lockerDistributeHash?: string,
  socials: {
    url: string;
    social: TSocial;
  }[];
  presales: TPresale;
  category: TCategory;
  projectType: TProjectType;
  chains: {
    chain: TChain;
  }[];
  Presales: TPresale[];
  user: TProjectOwner;
  reviewLogs: TReviewLog[];
  isHashAirdrop?: boolean
  additionalReward?: TAdditionalReward[] | []
};

export type TProjectCounter = {
  status: "PENDING" | "APPROVED" | "REJECTED" | "DEPLOYED";
  count: number;
};

export type TFormContribuePresale = {
  projectId: string
  presaleId: string
  price: string
  count: number
  transactionHash: string
}

export type TFormClaimPresale = {
  presaleId: string
  amount: string
  transactionHash: string
}

export type TResponsePresale = TPresale & {
  project: TProject
}
