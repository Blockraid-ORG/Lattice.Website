'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { cutString, NumberComma } from "@/lib/utils"
import { useClientMyVesting } from "@/modules/client-project/client-project.query"
import ConfirmClaimVesting from "./confirm-claim"
import Link from "next/link"

export default function VestingContent() {
  const { data } = useClientMyVesting()
  console.log({ data })
  return (
    <div className="bg-form-token-gradient p-4 md:p-8 rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Locker Name</TableHead>
            <TableHead>Claimable</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>{item?.project?.name}</div>
                {
                  item.contractAddress && (
                    <Link
                      className="text-sm font-semibold underline text-blue-500 block break-all"
                      target="_blank" rel="noopener noreferrer"
                      href={`${item.project.chains[0].chain.urlScanner}/address/${item.contractAddress}`}>
                      {cutString(item.contractAddress, 5)}
                    </Link>
                  )
                }
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="font-medium">{item.addresses.map(i => NumberComma(+i.amount))} {item?.project?.ticker}</TableCell>
              <TableCell className="text-right">
                <ConfirmClaimVesting locker={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
