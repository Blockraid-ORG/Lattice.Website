import { TProject } from "@/types/project";
import React, { useEffect, useMemo } from "react";
import ChartVestingPeriod from "./chart-vesting-priod";

export default function TokenSats({ data }: { data: TProject }) {
  console.log({ data });

  // Color palette for allocations (memoized to prevent re-creation)
  const allocationColors = useMemo(
    () => [
      "rgba(34,197,94,0.7)", // Green
      "rgba(168,85,247,0.7)", // Purple
      "rgba(239,68,68,0.7)", // Red
      "rgba(59,130,246,0.7)", // Blue
      "rgba(251,191,36,0.7)", // Yellow
      "rgba(236,72,153,0.7)", // Pink
      "rgba(20,184,166,0.7)", // Teal
      "rgba(245,158,11,0.7)", // Amber
      "rgba(139,69,19,0.7)", // Brown
      "rgba(75,85,99,0.7)", // Gray
    ],
    []
  );

  // Function to get color for allocation
  const getAllocationColor = React.useCallback(
    (index: number, name: string): string => {
      // You can customize color assignment based on allocation name
      const colorMap: Record<string, string> = {
        team: "rgba(34,197,94,0.7)", // Green for team
        advisor: "rgba(168,85,247,0.7)", // Purple for advisor
        presale: "rgba(239,68,68,0.7)", // Red for presale
        community: "rgba(59,130,246,0.7)", // Blue for community
        reward: "rgba(251,191,36,0.7)", // Yellow for reward
        marketing: "rgba(236,72,153,0.7)", // Pink for marketing
        treasury: "rgba(20,184,166,0.7)", // Teal for treasury
        liquidity: "rgba(245,158,11,0.7)", // Amber for liquidity
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
        total: allocation.supply,
        vestingMonths: allocation.vesting,
        startDate: allocation.startDate,
        color: getAllocationColor(index, allocation.name),
      }));
  }, [data?.allocations, getAllocationColor]);

  useEffect(() => {}, []);

  return (
    <div>
      {mappedAllocations.length > 0 ? (
        <ChartVestingPeriod data={mappedAllocations} />
      ) : (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <p>No allocation data available</p>
        </div>
      )}
    </div>
  );
}
