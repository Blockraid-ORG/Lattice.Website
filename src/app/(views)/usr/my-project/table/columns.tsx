'use client'
import { Icon } from "@/components/icon";
// import ImagePopover from "@/components/image-popover";
import { Button } from "@/components/ui/button";
import { toUrlAsset } from "@/lib/utils";
import { TProject } from "@/types/project";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

import BadgeProjectStatus from "@/components/badges/badge-project-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<TProject>[] = [
  {
    accessorKey: 'chain',
    header: 'Chain',
    cell: ({ row }) => {
      return (
        <div>{row.original.chains.map((i, index) => (
          <div key={index} className="flex gap-1 items-center">
            <Image alt="chain" width={20} height={20} src={toUrlAsset(i.chain.logo)} />
            <div className="text-sm">{i.chain.name}</div>
          </div>
        ))}</div>
      )
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return (
        <div>{row.original.category.name}</div>
      )
    }
  },
  {
    accessorKey: 'projectType',
    header: 'Type',
    cell: ({ row }) => {
      return (
        <div>{row.original.projectType?.name ?? "-"}</div>
      )
    }
  },

  // {
  //   accessorKey: 'logo',
  //   header: 'Logo',
  //   cell: ({ row }) => {
  //     return (
  //       <ImagePopover className="border h-8 w-8" src={toUrlAsset(row.original.logo)} />
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'banner',
  //   header: 'Banner',
  //   cell: ({ row }) => {
  //     return (
  //       <ImagePopover className="border h-8 w-auto" src={toUrlAsset(row.original.banner)} />
  //     )
  //   }
  // },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'ticker',
    header: 'Ticker',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <BadgeProjectStatus status={row.original.status} />
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={'icon'} variant={'outline'}>
                <Icon name="pepicons-pop:dots-x" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="start" side="left">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                {
                  row.original.status === 'DEPLOYED' ? (
                    <div className="cursor-not-allowed">
                      <Icon className="text-lg" name="mage:box-3d-upload-fill" /> Deploy
                    </div>
                  ) : (
                    <Link href={`/usr/my-project/${row.original.id}`}>
                      <Icon className="text-lg" name="mage:box-3d-upload-fill" /> Deploy
                    </Link>
                  )
                }

              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {
                  row.original.status === 'DEPLOYED' ? (
                    <Link href={`/usr/my-project/${row.original.id}/manage-locker`}>
                      <Icon className="text-lg" name="pepicons-pop:list" /> Manage Locker
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed">
                      <Icon className="text-lg" name="pepicons-pop:list" /> Manage Locker
                    </div>
                  )
                }
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {row.original.status === 'DEPLOYED' ? (
                  <Link href={`/usr/my-project/${row.original.id}/additional-reward`}>
                    <Icon className="text-lg" name="tabler:gift-filled" /> Reward
                  </Link>
                ) : (
                  <div className="cursor-not-allowed">
                    <Icon className="text-lg" name="tabler:gift-filled" /> Reward
                  </div>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {
                  row.original.status === 'DEPLOYED' ? (
                    <Link href={`/usr/my-project/${row.original.id}/presales`}>
                      <Icon className="text-lg" name="carbon:sales-ops" /> Presale
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed">
                      <Icon className="text-lg" name="carbon:sales-ops" /> Presale
                    </div>
                  )
                }

              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                {
                  row.original.status === 'DEPLOYED' || row.original.status === 'APPROVED' ? (
                    <div className="cursor-not-allowed">
                      <Icon className="text-sm" name="akar-icons:pencil" /> Edit
                    </div>
                  ) : (
                    <Link href={`/usr/my-project/${row.original.id}/edit`}>
                      <Icon className="text-sm" name="akar-icons:pencil" /> Edit
                    </Link>

                  )
                }
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/usr/my-project/${row.original.id}`}>
                  <Icon className="text-lg" name="entypo:info" /> Detail
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  }
]

