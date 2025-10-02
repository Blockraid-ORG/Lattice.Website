"use client";

import { useProjectDetail } from "@/modules/project/project.query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useSwitchChain } from "wagmi";
import TokenInformation from "./token-detail/token-information/content";
import LoadingTokenInformation from "./token-detail/token-information/loading";
import { useAddressPoolPayment } from "@/modules/payment/payment.query";

export default function ProjectContent() {
  const { projectId } = useParams();
  const { data: project, isLoading } = useProjectDetail(projectId.toString());
  const { data: addressPool } = useAddressPoolPayment()
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (project && project.chains.length > 0) {
      switchChain({
        chainId: project?.chains[0].chain.chainid,
      });
    }
  }, [project, switchChain]);

  return (
    <>
      {!isLoading && project ? (
        <TokenInformation data={project} addressPool={addressPool} />
      ) : (
        <LoadingTokenInformation />
      )}
    </>
  );
}
