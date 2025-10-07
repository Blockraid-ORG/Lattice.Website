"use client";

import React from "react";
import { TProject } from "@/types/project";

interface TabAssetTokenProps {
  data: TProject;
}

const TabAssetToken = ({ data }: TabAssetTokenProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Asset Token Details
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Information about the underlying asset token.
      </p>

      {/* Add your asset token content here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Asset Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Asset Type:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.projectType.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Category:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.category.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Chain:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.chains[0].chain.name}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Additional Info
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Paused:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.paused ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabAssetToken;
