"use client";
import { useProjectDetail } from "@/modules/project/project.query";
import { useParams } from "next/navigation";
import DetailHeader from "./header";
import PresaleInfo from "./presale-info";
import TokenInfo from "./token-info";
import TokenSats from "@/app/(views)/usr/my-project/[projectId]/(detail)/token-stats/token-information/content";
import ContentLoader from "./content-loader";
import { useSwitchChain } from "wagmi";
import { useEffect } from "react";

export default function DetailProjectContent() {
  const { projectId } = useParams();
  const { data, isLoading } = useProjectDetail(projectId as string);
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (data && data.chains.length > 0) {
      switchChain({
        chainId: data?.chains[0].chain.chainid,
      });
    }
  }, [data, switchChain]);
  return (
    <div>
      {isLoading ? (
        <ContentLoader />
      ) : (
        <>
          {data && <DetailHeader data={data} />}
          <div className="-mt-16">
            {data && <PresaleInfo data={data} />}
            {data && <TokenInfo data={data} />}
            {data && (
              <div className="container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl">
                <TokenSats data={data} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
