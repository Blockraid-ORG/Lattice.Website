import { TVerificationLogs } from '@/types/profile'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import dayjs from 'dayjs'

export function VerificationLog({ data }: { data?: TVerificationLogs[] }) {
  return (
    <div className='border p-4'>
      <div className='border-b pb-3'>
        <h2 className='font-semibold'>Verification History</h2>
      </div>
      {
        data && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Datetime</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{dayjs(item.createdAt).format('DD MMM YYYY HH:mm:ss')}</TableCell>
                  <TableCell>{item.note ?? '-'}</TableCell>
                  <TableCell className="text-right">{item.status}</TableCell>
                </TableRow>
              )):undefined}
            </TableBody>
          </Table>
        )
      }
    </div>
  )
}
