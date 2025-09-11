'use client'
import dayjs from "dayjs";
import { cn, cutString, NumberComma } from "@/lib/utils";
import { TAdditionalReward } from "@/types/project";
import { ColumnDef } from "@tanstack/react-table";
import ConfirmDeployAirdrop from "../confirm-deploy-airdrop";
import { FormAddress } from "../form-add-address";
import FormRemoveAddress from "../form-remove-address";


export const columns: ColumnDef<TAdditionalReward>[] = [
  {
    accessorKey: 'project.name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div>{row.original?.project?.name}</div>
        {
          row.original.contactAddress && (
            <div className="flex-1 text-xs break-all">
              <a
                className="text-sm font-semibold underline text-blue-500 block break-all"
                href={`${row.original.project.chains[0].chain.urlScanner}/address/${row.original.contactAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cutString(row.original.contactAddress, 4)}
              </a>
            </div>
          )
        }
      </div>
    )
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => <div>{NumberComma(Number(row.original.amount))} {row.original?.project?.ticker}</div>
  },
  {
    accessorKey: 'startClaim',
    header: 'Date Claim',
    cell: ({ row }) => (
      <div className="text-xs font-semibold">
        <div className="flex py-1 items-center">
          <div className={cn(
            'shrink-0 w-12',
          )}>Start</div>
          <div className='w-3 shrink-0'>:</div>
          <div>{dayjs(row.original.startDateClaim).format('YYYY-MM-DD HH:mm')}</div>
        </div>
        <div className="flex py-1 items-center">
          <div className={cn(
            'shrink-0 w-12',
          )}>End</div>
          <div className='w-3 shrink-0'>:</div>
          <div>{dayjs(row.original.endDateClaim).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div>{row.original.contactAddress ? 'DEPLOYED' : 'OUT STANDING'}</div>
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-1 flex-wrap">
          <ConfirmDeployAirdrop data={row.original} />
          <FormAddress data={row.original} />
          <FormRemoveAddress data={row.original} />
        </div>
      )
    }
  }
]

