'use client'

import { useDetailPresale } from "@/modules/presales/presale.query"
import { useParams } from "next/navigation"
import DetailHeader from "./header"
import PresaleInfo from "./presale-info"
import { useSwitchChain } from "wagmi"
import { useEffect } from "react"

export default function PresaleDetailContent() {
  const param = useParams()
  const { data } = useDetailPresale(String(param.id))
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
      {data && <DetailHeader data={data} />}
      {data && <PresaleInfo data={data} />}
    </div>
  )
}
