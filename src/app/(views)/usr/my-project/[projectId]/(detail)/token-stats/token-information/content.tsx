import { TProject } from "@/types/project";
import React, { useMemo } from "react";
import ChartVestingPeriod from "./chart-vesting-priod";

export default function TokenSats({ data }: { data: TProject }) {
  const allocationColors = useMemo(
    () => [
      "rgba(34,197,94,1)", // Green
      "rgba(168,85,247,1)", // Purple
      "rgba(239,68,68,1)", // Red
      "rgba(59,130,246,1)", // Blue
      "rgba(251,191,36,1)", // Yellow
      "rgba(236,72,153,1)", // Pink
      "rgba(20,184,166,1)", // Teal
      "rgba(245,158,11,1)", // Amber
      "rgba(139,69,19,1)", // Brown
      "rgba(75,85,99,1)", // Gray
    ],
    []
  );

  const getAllocationColor = React.useCallback(
    (index: number, name: string): string => {
      const colorMap: Record<string, string> = {
        team: "rgba(34,197,94,1)", // Green for team
        advisor: "rgba(168,85,247,1)", // Purple for advisor
        presale: "rgba(239,68,68,1)", // Red for presale
        community: "rgba(59,130,246,1)", // Blue for community
        reward: "rgba(251,191,36,1)", // Yellow for reward
        marketing: "rgba(236,72,153,1)", // Pink for marketing
        treasury: "rgba(20,184,166,1)", // Teal for treasury
        liquidity: "rgba(245,158,11,1)", // Amber for liquidity
      };

      const nameLower = name.toLowerCase();
      return (
        colorMap[nameLower] || allocationColors[index % allocationColors.length]
      );
    },
    [allocationColors]
  );

  // Map allocation data to VestingData format
  const mappedAllocations = useMemo(() => {
    // Handle edge cases
    if (!data?.allocations || data.allocations.length === 0) {
      return [];
    }

    return data.allocations
      .filter(
        (allocation) =>
          allocation &&
          allocation.name &&
          typeof allocation.supply === "number" &&
          allocation.supply > 0 &&
          typeof allocation.vesting === "number" &&
          allocation.startDate
      )
      .map((allocation, index) => ({
        name: allocation.name,
        total: Number(data.totalSupply) * (allocation.supply / 100),
        vestingMonths: allocation.vesting,
        startDate: allocation.startDate,
        color: getAllocationColor(index, allocation.name),
      }));
  }, [data?.allocations, getAllocationColor]);

  return (
    <div>
      {mappedAllocations.length > 0 ? (
        <>
          <ChartVestingPeriod
            data={mappedAllocations}
            totalSupply={Number(data.totalSupply)}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <p>No allocation data available</p>
        </div>
      )}
    </div>
  );
}
