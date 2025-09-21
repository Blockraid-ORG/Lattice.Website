'use client'

import { useDetailPresale } from "@/modules/presales/presale.query"
import { useParams } from "next/navigation"
import DetailHeader from "./header"
import PresaleInfo from "./presale-info"

export default function PresaleDetailContent() {
  const param = useParams()
  const { data } = useDetailPresale(String(param.id))
  return (
    <div>
      {data && <DetailHeader data={data} />}
      {data && <PresaleInfo data={data} />}
    </div>
  )
}
