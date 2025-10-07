"use client";

import React from "react";
import { TProject } from "@/types/project";
import TokenSats from "@/app/(views)/usr/my-project/[projectId]/(detail)/token-stats/token-information/content";
import TokenInfo from "../../[projectId]/token-info";

interface TabUnlocksProps {
  data: TProject;
}

const TabUnlocks = ({ data }: TabUnlocksProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Token Unlocks Schedule
      </h3>
      <div className="space-y-4">
        {data && <TokenInfo data={data} />}
        {data && (
          <div className="container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl mb-6">
            <TokenSats data={data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabUnlocks;
