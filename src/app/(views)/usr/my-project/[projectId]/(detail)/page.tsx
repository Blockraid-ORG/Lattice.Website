"use client";

import React from "react";
import ProjectContent from "./content";
import PageContainer from "@/components/containers/page-container";
import ActionsLiquidity from "./liquidity/uniswap-iframe";

export default function ProjectDetail() {
  return (
    <PageContainer canBack actions={<ActionsLiquidity />}>
      <ProjectContent />
    </PageContainer>
  );
}
