'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NumberComma } from '@/lib/utils'
import { useProjectDetail } from '@/modules/project/project.query'
import dayjs from "dayjs"
import { useParams } from 'next/navigation'
import PresaleHeader from './presale-header'
import FormCreatePresale from "./form-create-presale"
import FormEditPresale from "./form-edit-presale"
import FormDeletePresale from "./form-delete-presale"
import FormDetailPresale from "./form-detail-presale"
import FormActivatePresale from "./form-activate-presale"
export default function PresaleContent() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  return (
    <div>
      {
        !isLoading && data ? (
          <div className="space-y-4">
            <PresaleHeader data={data} />
            <div>
              <div className="bg-background p-6 border rounded-2xl">
                <div className="flex mb-2 justify-end">
                  <FormCreatePresale data={data} />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.presales.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.presaleSCID ?? '-'}</TableCell>
                        <TableCell>
                          <div className="text-sm break-all">
                            {NumberComma(Number(item.price))} {data.chains[0].chain.ticker}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm break-all">
                            {dayjs(item.startDate).format('YYYY-MM-DD HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm break-all">
                            {dayjs(item.endDate).format('YYYY-MM-DD HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end items-center">
                            <FormActivatePresale data={data} item={item} />
                            <FormDetailPresale data={data} item={item} />
                            <FormEditPresale data={data} item={item} />
                            <FormDeletePresale data={item} />
                          </div>
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
