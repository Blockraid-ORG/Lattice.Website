"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useParams } from "next/navigation";
import { useProjectDetail } from "@/modules/project/project.query";

export default function ActionsLiquidity() {
  const { projectId } = useParams();
  const { data: project, isLoading } = useProjectDetail(projectId.toString());

  const handleOpen = () => {
    const chain = project?.chains[0].chain.name.split(" ")[0].toLowerCase();
    const contractAddress = project?.contractAddress;
    if (chain === "bnb" || chain === "bsc") {
      window.open(
        `https://pancakeswap.finance/liquidity/select/bsc/v3/BNB/${contractAddress}?chain=${chain}`,
        "_blank"
      );
    } else {
      window.open(
        `https://app.uniswap.org/positions/create/v3?currencyA=NATIVE&currencyB=${contractAddress}&chain=${chain}&hook=undefined&priceRangeState={%22priceInverted%22:false,%22fullRange%22:true,%22minPrice%22:%22%22,%22maxPrice%22:%22%22,%22initialPrice%22:%22%22}&depositState={%22exactField%22:%22TOKEN0%22,%22exactAmounts%22:{}}
      `,
        "_blank"
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (project?.status === "DEPLOYED") {
    return (
      <Button
        onClick={handleOpen}
        size="sm"
        variant="default"
        className="flex items-center gap-2"
      >
        <Icon className="text-sm" name="mdi:water-plus" />
        Add Liquidity
      </Button>
    );
  }
  return null;
}
