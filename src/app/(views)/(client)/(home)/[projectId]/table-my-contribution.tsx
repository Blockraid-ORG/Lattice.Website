import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { NumberComma } from "@/lib/utils"
import { useMyContribution } from '@/modules/transaction-presale/transaction-presale.query'
import { TProject } from '@/types/project'
import Link from "next/link"

export default function TableMyContribution({ data }: { data: TProject }) {
  const { data: myContributions } = useMyContribution(data.id, data.presales.id)
  const totalAmount = myContributions?.reduce(
    (acc: number, item: any) => acc + Number(item.count),
    0
  ) ?? 0

  const totalToken = myContributions?.reduce((acc: number, item: any) => {
    const tokenAmount =
      (Number(item.count) * (10 ** data.decimals)) /
      (Number(data.presales.price) * (10 ** data.decimals))
    return acc + tokenAmount
  }, 0) ?? 0
  return (
    <div>
      <div className="py-4 border-b">
        <h2 className='text-lg md:text-xl mb-3 font-semibold'>Contrubution Info</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 w-full'>
          <div>
            <p className='text-sm text-neutral-500'>Total Contribution</p>
            <div className='flex gap-2 items-center'>
              <h2 className='font-bold'>{NumberComma(totalAmount)}</h2>
              <p className='text-xs font-medium'>{data.presales.unit.split('/').pop()}</p>
            </div>
          </div>
          <div>
            <p className='text-sm text-neutral-500'>Total Token</p>
            <div className='flex gap-2 items-center'>
              <h2 className='font-bold'>{NumberComma(totalToken)}</h2>
              <p className='text-xs font-medium'>{data.ticker}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button size={'lg'}>Claim Token { `Under Develop` }</Button>
        </div>
      </div>
      <div className="pt-4">
        <h2 className="mb-3">Contribution History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Token</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myContributions?.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{item.count} {data.chains[0].chain.ticker}</TableCell>
                <TableCell>
                  {NumberComma(+(item.count * (10 ** data.decimals)) / (+data.presales.price * (10 ** data.decimals)))} {data.ticker}
                </TableCell>
                <TableCell className="text-end">
                  <Link
                    className="text-sm font-semibold underline text-blue-500 block break-all"
                    target="_blank" rel="noopener noreferrer"
                    href={`${data.chains[0].chain.urlScanner}/tx/${item.transactionHash}`}>
                    {item.transactionHash}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

