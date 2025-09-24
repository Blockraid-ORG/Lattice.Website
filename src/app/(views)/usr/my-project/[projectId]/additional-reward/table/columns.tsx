'use client'
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn, cutString, NumberComma } from "@/lib/utils";
import { TAdditionalReward } from "@/types/project";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import ConfirmDeployAirdrop from "../confirm-deploy-airdrop";
import { FormAddress } from "../form-add-address";
import FormRemoveAddress from "../form-remove-address";


export const columns: ColumnDef<TAdditionalReward>[] = [
  {
    accessorKey: 'scheduleId',
    header: 'SID',
  },
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
    accessorKey: '_count',
    header: 'Eligible Wallet',
    cell: ({ row }) => <div className="font-semibold">{row.original._count.userAdditionalReward}</div>
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Popover>
          <PopoverTrigger>
            <Button variant="outline" size="icon">
              <Icon name="material-symbols:more-horiz" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44" side="left" align="start">
            <div className="text-center text-sm font-semibold mb-2">Actions</div>
            <Separator className="mb-4" />
            <div className="flex flex-col gap-2">
              <ConfirmDeployAirdrop data={row.original} />
              <FormAddress data={row.original} />
              <FormRemoveAddress data={row.original} />
            </div>
          </PopoverContent>
        </Popover>
      )
    }
  }
]

