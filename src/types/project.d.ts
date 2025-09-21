import {
  allocationSchema,
  formBaseProjectAllocationSchema,
  formBuyPresale,
  formCreateProjectSchema,
  formFilterProjectSchema,
  formProjectAllocationSchema,
  presalesSchema,
} from "@/modules/project/project.schema";
import { TCategory } from "./category";
import { TSocial } from "./social";
import { TChain } from "./chain";
import { TProjectType } from "./project-type";
import { formProjectAddressWhitelistSchema } from "@/modules/deploy/deploy.schema";

export type TFormProject = z.infer<typeof formCreateProjectSchema>;
export type TFormProjectAllocation = z.infer<typeof allocationSchema>;
export type TFormProjectPresale = z.infer<typeof presalesSchema>;
export type TFormFilterProject = z.infer<typeof formFilterProjectSchema>;
export type TFormBuyPresale = z.infer<typeof formBuyPresale>;

type TAddressWhitelist = {
  id: string;
  walletAddress: string;
};

export type TProjectAllocationAddress = {
  id: string
  amount: string
  address: string
  isClaimed: boolean
  isChecked?: boolean
}
type TAllocation = {
  id: string
  name: string
  supply: number,
  vesting: number
  startDate: string
  isPresale: boolean,
  contractAddress?: string
  isDeploying?: boolean
  addresses: TProjectAllocationAddress[] | [],
  isFinalized?: boolean
  _count: {
    addresses: number
  }
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
  contractAddress?: string | null,
  whitelistContract: string | null,
  whitelists: TAddressWhitelist[] | []
  whitelistDuration?: number
  sweepDuration?: number
  isActive?: boolean
  presaleSCID?: number | string
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
export type TUserAdditionalReward = {
  id: string
  address: string
  amount: string
  isClaimed: false,
  user?: {
    fullname: string
  }
}
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


  scheduleId: string | null
  userAdditionalReward: TUserAdditionalReward[] | []
  _count: {
    userAdditionalReward: number
  }
}

export type TProjectPresaleWhitelistAddressItem = {
  id: string
  walletAddress: string
  projectId: string
  isChecked?: boolean
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
  rewardContractAddress: string | null
  presaleAddress?: string
  whitelistsAddress?: string
  paused: boolean
  socials: {
    url: string;
    social: TSocial;
  }[];
  presales: TPresale[];
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
  ProjectPresaleWhitelistAddress: TProjectPresaleWhitelistAddressItem[] | []
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

// Eligible Airdrop List
export type TEligibleAirdrop = {
  id: string
  name: string
  ticker: string
  contractAddress: string
  rewardContractAddress: string | null
  decimals: number
  banner: string
  logo: string
  chains: {
    chain: TChain;
  }[];
  airdrop: TAirdropItem[]
  totalEligible: number
  isClaimedAll: boolean
}

export type TAirdropItem = {
  id: string
  address?: string
  amount?: number
  isClaimed: boolean
  schedileId?: string
}

export type TAddressAmount = {
  amount: string
  address: string
}
export type TFormContributePresale = {
  projectId: string;
  presaleId: string;
  price: string;
  count: number;
  transactionHash: string;
}
export type FormProjectAllocationAddress = z.infer<typeof formProjectAllocationSchema>
export type FormBaseProjectAllocationAddress = z.infer<typeof formBaseProjectAllocationSchema>
export type FormProjectAddressWhitelist = z.infer<typeof formProjectAddressWhitelistSchema>
