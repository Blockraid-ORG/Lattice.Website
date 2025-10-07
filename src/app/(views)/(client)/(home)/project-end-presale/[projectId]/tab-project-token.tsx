"use client";

import React from "react";
import { TProject } from "@/types/project";
import DexScreenerChart from "./dexscreener-chart";

interface TabProjectTokenProps {
  data: TProject;
}

const TabProjectToken = ({ data }: TabProjectTokenProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Token Info
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Token Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ticker:</span>
              <span className="text-gray-900 dark:text-gray-100 font-mono">
                {data.ticker}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Decimals:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.decimals}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Supply:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {data.totalSupply}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Contract Address
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Main Contract:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">
                {data.contractAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Factory:</span>
              <span className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">
                {data.factoryAddress}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DexScreener Chart */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Price Chart
        </h3>
        {/* <DexScreenerChart
          tokenAddress={data.contractAddress}
          chainId={data.chains?.[0]?.chain?.name?.toLowerCase() || "ethereum"}
        /> */}
        <DexScreenerChart
          tokenAddress={"0xf0a949d3d93b833c183a27ee067165b6f2c9625e"}
          chainId={"bsc"}
        />
      </div>
    </div>
  );
};

export default TabProjectToken;
