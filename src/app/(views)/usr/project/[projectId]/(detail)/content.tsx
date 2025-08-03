'use client'

import { useState } from "react"
import TokenInformation from "./token-detail/token-information/content"
import { detailProjectTabs } from "@/data/constants"
import { cn } from "@/lib/utils"
import TokenSats from "./token-stats/token-information/content"



export default function ProjectContent() {
  const [tabActive, setTabActive] = useState(0)

  function handleChangeTab(value: number) {
    setTabActive(value)
  }
  return (
    <>
      <div className="flex sticky top-[70px] backdrop-blur border-b mb-3 z-20">
        {
          detailProjectTabs.map(item => (
            <button
              onClick={() => handleChangeTab(item.value)}
              className={cn(
                'min-w-36 border-b-4 -mb-[2px] py-1 px-2 text-sm font-semibold',
                'duration-300',
                item.value === tabActive ? 'border-blue-500' : 'border-transparent'
              )}
              key={item.value}>
              {item.label}
            </button>
          ))
        }
      </div>
      {
        tabActive === 0 && <TokenInformation />
      }
      {
        tabActive === 1 && <TokenSats />
      }
    </>
  )
}
