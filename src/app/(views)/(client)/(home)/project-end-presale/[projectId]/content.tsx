"use client";

import React from "react";
import GaugeSmartContractAudit from "./gauge-smart-contract-audit";
import TrustScoreDisplay from "./trust-score-display";
import ProjectTabs from "./project-tabs";
import HeaderContent from "./header-content";
import { TProject } from "@/types/project";

interface ProjectContentProps {
  data: TProject;
}

const ProjectContent = ({ data }: ProjectContentProps) => {
  return (
    <main className="container mx-auto px-4 pt-24 pb-24">
      <div className="relative container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl my-6">
        <div className="flex gap-6">
          <HeaderContent data={data} />
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Smart Contract Audit
            </h4>
            <div className="flex gap-6 items-center">
              <div className="flex justify-center items-center">
                <GaugeSmartContractAudit value={data?.trustScore || 0} />
              </div>
              <div className="flex-1">
                <TrustScoreDisplay
                  score={data?.trustScore || 0}
                  riskLevel={
                    data?.trustScore || 0 >= 80
                      ? "High"
                      : data?.trustScore || 0 >= 50
                      ? "Medium"
                      : "Low"
                  }
                  description="The contract code has been analyzed and found to have a low-level risk of vulnerabilities"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <ProjectTabs data={data} />
        </div>
      </div>
    </main>
  );
};

export default ProjectContent;
