'use client'

import { usePresaleActive } from "@/modules/presales/presale.query"
import ActivePresale from "./active-presale"

export default function PresaleContent() {
  const {data: presales} = usePresaleActive()
  return (
    <div>
      {
        presales?.data && (<ActivePresale data={presales?.data} />)
      }
    </div>
  )
}
