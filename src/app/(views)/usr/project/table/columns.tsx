'use client'
import { Icon } from "@/components/icon";
import ImagePopover from "@/components/image-popover";
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
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return (
        <div>{row.original.category.name}</div>
      )
    }
  },
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
    accessorKey: 'logo',
    header: 'Logo',
    cell: ({ row }) => {
      return (
        <ImagePopover className="border h-8 w-8" src={toUrlAsset(row.original.logo)} />
      )
    }
  },
  {
    accessorKey: 'banner',
    header: 'Banner',
    cell: ({ row }) => {
      return (
        <ImagePopover className="border h-8 w-auto" src={toUrlAsset(row.original.banner)} />
      )
    }
  },
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
                <Link href={`/usr/project/${row.original.id}`}>
                  <Icon className="text-lg" name="mage:box-3d-upload-fill" /> Deploy
                </Link>
              </DropdownMenuItem>


              <DropdownMenuItem asChild>
                <Link href={`/usr/project/${row.original.id}/whitelist`}>
                  <Icon className="text-lg" name="stash:list-add" /> Whitelist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                {
                  row.original.status === 'DEPLOYED' || row.original.status === 'APPROVED' ? (
                    <div className="cursor-not-allowed">
                      <Icon className="text-sm" name="akar-icons:pencil" /> Edit
                    </div>
                  ) : (
                    <Link href={`/usr/project/${row.original.id}/edit`}>
                      <Icon className="text-sm" name="akar-icons:pencil" /> Edit
                    </Link>

                  )
                }
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/usr/project/${row.original.id}`}>
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

