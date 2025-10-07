"use client";

import React from "react";
import { TProject } from "@/types/project";
import BubblemapChart from "./bubblemap-chart";

interface TabHoldersProps {
  data: TProject;
}

const TabHolders: React.FC<TabHoldersProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Token Holders Distribution
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This visualization shows the distribution of token holders and their
          holdings. Each bubble represents a holder, with size indicating the
          amount of tokens held.
        </p>
      </div>

      {/* Bubblemap Chart */}
      <div className="mt-6">
        <BubblemapChart
          tokenAddress={
            data.contractAddress || "0xf0a949d3d93b833c183a27ee067165b6f2c9625e"
          }
          chainId={data.chains?.[0]?.chain?.name?.toLowerCase() || "bsc"}
          height={700}
        />
      </div>
    </div>
  );
};

export default TabHolders;
