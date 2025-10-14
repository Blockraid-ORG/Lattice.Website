'use client'

import { useProjectDetail } from "@/modules/project/project.query"
import { useParams } from "next/navigation"

import { Icon } from "@/components/icon"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cutString } from "@/lib/utils"
import { TAllocation } from "@/types/project"
import { ConfirmLocker } from "./confirm-locker"
import { FormAddress } from "./form-add-address"
import { LockerAddressList } from "./locker-address-list"
import ManageLockerHeader from "./manage-locker-header"

export default function ContentManageLocker() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  const dataLockers = data?.allocations.filter((i:TAllocation) => {
    if (!i.isPresale && i.name !== "Deployer")
      return i
  })
  return (
    <div>
      {
        !isLoading && data ? (
          <div className="space-y-4">
            <ManageLockerHeader data={data} />
            <div>
              <div className="bg-background p-6 border rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Addresses</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataLockers?.map((allocation, index) => (
                      <TableRow key={allocation.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="text-sm break-all">
                            {allocation.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="break-all">
                            {
                              allocation.contractAddress && (
                                <a className="font-semibold underline text-blue-500 block break-all" href={`${data.chains[0].chain.urlScanner}/address/${allocation.contractAddress}`} target="_blank" rel="noopener noreferrer">
                                  {cutString(allocation.contractAddress!, 6)}
                                </a>
                              )
                            }

                          </div>
                        </TableCell>
                        <TableCell>
                          {
                            allocation.isFinalized ?
                              <Icon name="lets-icons:check-fill" /> :
                              <Icon name="carbon:circle-dash" />}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold flex justify-between">
                            {allocation._count.addresses}
                            <LockerAddressList project={data} data={allocation} />
                          </div>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <ConfirmLocker project={data} data={allocation} />
                          <FormAddress data={data} allocation={allocation} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading Data...</div>
        )
      }
    </div>
  )
}
