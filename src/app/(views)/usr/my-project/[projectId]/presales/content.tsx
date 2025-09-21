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
import FormAddAddressWhitelist from "./whitelists/form-add-address-whitelist"
import { WhitelistAddressList } from "./whitelists/whitelist-address-list"
import { useSwitchChain } from "wagmi"
import { useEffect } from "react"
export default function PresaleContent() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  const unit = data?.chains[0].chain.ticker;
    const { switchChain } = useSwitchChain();
    useEffect(() => {
      if (data && data.chains.length > 0) {
        switchChain({
          chainId: data?.chains[0].chain.chainid,
        });
      }
    }, [data, switchChain]);
  return (
    <div>
      {
        !isLoading && data ? (
          <div className="space-y-4">
            <PresaleHeader data={data} />
            <div>
              <div className="bg-background p-6 border rounded-2xl">
                <div className="flex mb-2 justify-end gap-2">
                  <FormCreatePresale data={data} />
                  <FormAddAddressWhitelist data={data} />
                  <WhitelistAddressList data={data} />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
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
                          <div className="flex">
                            <div className="w-14">Start</div>
                            <div className="w-1">:</div>
                            <div className="text-sm break-all">
                              {dayjs(item.startDate).format('YYYY-MM-DD HH:mm')}
                            </div>
                          </div>
                          <div className="flex">
                            <div className="w-14">End</div>
                            <div className="w-1">:</div>
                            <div className="text-sm break-all">
                              {dayjs(item.endDate).format('YYYY-MM-DD HH:mm')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <div className="w-32">Max Contr.</div>
                            <div className="w-1">:</div>
                            <div className="text-sm break-all">
                              {NumberComma(Number(item.maxContribution))} {unit}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-32">Hardcap</div>
                            <div className="w-1">:</div>
                            <div className="text-sm break-all">
                              {NumberComma(Number(item.hardcap))} {unit}
                            </div>
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
