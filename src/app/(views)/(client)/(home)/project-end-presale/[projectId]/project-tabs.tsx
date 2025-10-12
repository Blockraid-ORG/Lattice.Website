"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import TabProjectToken from "./tab-project-token";
import TabAssetToken from "./tab-asset-token";
import TabUnlocks from "./tab-unlocks";
import { TProject } from "@/types/project";
// import TabHolders from "./tab-holders";

interface ProjectTabsProps {
  data: TProject;
}

const ProjectTabs = ({ data }: ProjectTabsProps) => {
  return (
    <Tabs.Root defaultValue="performance-token">
      <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700">
        <Tabs.Trigger
          value="performance-token"
          className="text-lg px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Performance Token
        </Tabs.Trigger>
        <Tabs.Trigger
          value="asset-token"
          className="text-lg px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Asset Token
        </Tabs.Trigger>
        <Tabs.Trigger
          value="unlocks"
          className="text-lg px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Unlocks
        </Tabs.Trigger>
        {/* <Tabs.Trigger
          value="holders"
          className="text-lg px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Holders
        </Tabs.Trigger> */}
      </Tabs.List>

      <div className="pt-3">
        <Tabs.Content value="performance-token">
          <TabProjectToken data={data} />
        </Tabs.Content>

        <Tabs.Content value="asset-token">
          <TabAssetToken data={data} />
        </Tabs.Content>

        <Tabs.Content value="unlocks">
          <TabUnlocks data={data} />
        </Tabs.Content>

        {/* <Tabs.Content value="holders">
          <TabHolders data={data} />
        </Tabs.Content> */}
      </div>
    </Tabs.Root>
  );
};

export default ProjectTabs;
