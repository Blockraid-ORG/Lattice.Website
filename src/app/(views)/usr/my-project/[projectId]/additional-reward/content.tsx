'use client'

import { useProjectDetail } from "@/modules/project/project.query"
import { useParams } from "next/navigation"

import PresaleHeader from "./presale-header"
import Table from "./table"
import { useEffect } from "react"
import { useSwitchChain } from "wagmi"
export default function ContectAddressReward() {
    const { switchChain } = useSwitchChain();
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  useEffect(() => {
    if (data && data.chains.length > 0) {
      switchChain({
        chainId: data?.chains[0].chain.chainid,
      });
    }
  }, [data, switchChain]);
  return (
    <div>
      {
        !isLoading && data ? (
          <div className="space-y-4">
            <PresaleHeader data={data} />
            <Table projectId={projectId.toString()} />
          </div>
        ) : (
          <div>Loading Data...</div>
        )
      }
    </div>
  )
}
