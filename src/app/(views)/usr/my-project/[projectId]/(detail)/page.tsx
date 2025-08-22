import React from "react";
import ProjectContent from "./content";
import PageContainer from "@/components/containers/page-container";
import UniswapIframe from "./liquidity/uniswap-iframe";

export default function ProjectDetail() {
  return (
    <PageContainer canBack actions={<UniswapIframe />}>
      <ProjectContent />
    </PageContainer>
  );
}
