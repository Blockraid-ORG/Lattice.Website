'use client'

import { useProjectDetail } from "@/modules/project/project.query"
import { useParams } from "next/navigation"

import Table from "./table"
import { useEffect } from "react"
import { useSwitchChain } from "wagmi"
import RewardHeader from "./reward-header"
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
            <RewardHeader data={data} />
            <Table projectId={projectId.toString()} />
          </div>
        ) : (
          <div>Loading Data...</div>
        )
      }
    </div>
  )
}
