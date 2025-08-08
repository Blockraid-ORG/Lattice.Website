import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import dayjs from 'dayjs';
import { TAllocation } from '@/types/project'
import { Icon } from "@/components/icon";
import { NumberComma } from "@/lib/utils";
export default function Allocations({ data, totalSupply }: { data: TAllocation[], totalSupply?: string }) {
  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">Allocation Info</h2>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>AMOUNT</TableHead>
              <TableHead>VESTING</TableHead>
              <TableHead className="text-right">START DATE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              data.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {
                      item.contractAddress ? (
                        <Icon className="text-lg text-blue-500" name="lets-icons:check-fill" />
                      ) : (
                        <>
                          {
                            item.isDeploying ? (
                              <Icon className="text-sm animate-spin" name="streamline-ultimate:loading-bold" />
                            ) : (
                              <Icon className="text-lg" name="fluent:circle-hint-24-filled" />
                            )
                          }
                        </>
                      )
                    }
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{NumberComma(Number(totalSupply) * (item.supply / 100))}</TableCell>
                  <TableCell>{item.vesting} Month</TableCell>
                  <TableCell className="text-right">{dayjs(item.startDate).format('MMM DD, YYYY')}</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </>

  )
}
