'use client'

import { useProjectDetail } from "@/modules/project/project.query"
import { useParams } from "next/navigation"

import PresaleHeader from "./presale-header"
import FormAddressAmount from "./form-address-amount"
export default function ContectAddressReward() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  return (
    <div>
      {
        !isLoading && data ? (
          <div className="space-y-4">
            <PresaleHeader data={data} />
            <div className="bg-background p-6 border rounded-2xl">
              <FormAddressAmount data={data} />
            </div>
          </div>
        ) : (
          <div>Loading Data...</div>
        )
      }
    </div>
  )
}
