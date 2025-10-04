"use client";

import React from "react";
import { TProject } from "@/types/project";

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
        {data.allocations.map((allocation) => (
          <div
            key={allocation.id}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {allocation.name}
              </h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {allocation.supply}% Supply
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Vesting:
                </span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {allocation.vesting} months
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Start Date:
                </span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {new Date(allocation.startDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    allocation.isFinalized
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {allocation.isFinalized ? "Finalized" : "Active"}
                </span>
              </div>
            </div>
            {allocation.contractAddress && (
              <div className="mt-2 text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Contract:
                </span>
                <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono break-all">
                  {allocation.contractAddress}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabUnlocks;
