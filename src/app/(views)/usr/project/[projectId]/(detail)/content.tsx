'use client'

import { detailProjectTabs } from "@/data/constants"
import { cn } from "@/lib/utils"
import { useProjectDetail } from "@/modules/project/project.query"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSwitchChain } from "wagmi"
import TokenInformation from "./token-detail/token-information/content"
import LoadingTokenInformation from "./token-detail/token-information/loading"
import TokenSats from "./token-stats/token-information/content"


export default function ProjectContent() {
  const { projectId } = useParams()
  const { data: project, isLoading } = useProjectDetail(projectId.toString())
  const { switchChain } = useSwitchChain()
  const [tabActive, setTabActive] = useState(0)

  function handleChangeTab(value: number) {
    setTabActive(value)
  }
  useEffect(() => {
    if (project && project.chains.length > 0) {
      switchChain({
        chainId: project?.chains[0].chain.chainid
      })
    }
  }, [project, switchChain])
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
        isLoading ? <LoadingTokenInformation /> : (
          <>
            {
              tabActive === 0 && project && (
                <TokenInformation
                  data={project}
                />
              )
            }
            {
              tabActive === 1 && project && <TokenSats
                data={project}
              />
            }
          </>
        )
      }
    </>
  )
}
