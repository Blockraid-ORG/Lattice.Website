'use client'

import { useProjectDetail } from "@/modules/project/project.query"
import { useParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import FormWhitelistAddress from "./form-whitelist-address"
import PresaleHeader from "./presale-header"
import { useUserVerified } from "@/modules/user-verified/user-verified.query"

export default function ContentWhitelist() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  const { data: verifiedAddress } = useUserVerified()
  return (
    <div>
      {
        !isLoading && data ? (
          <div className="space-y-4">
            <PresaleHeader data={data} />
            <div className="text-end flex gap-2 justify-end flex-wrap my-4">
              <FormWhitelistAddress verifiedAddress={verifiedAddress} data={data} formType="REMOVE" />
              <FormWhitelistAddress verifiedAddress={verifiedAddress} data={data} formType="ADD" />
            </div>
            <div className="bg-background p-6 border rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.presales.whitelists.map((wl, index) => (
                    <TableRow key={wl.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="text-sm break-all">{wl.walletAddress}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div>Loading Data...</div>
        )
      }
    </div>
  )
}
