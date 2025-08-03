'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Pagination, PaginationContent,
  PaginationEllipsis,
  PaginationItem, PaginationLink
} from "@/components/ui/pagination"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, LucideSettings2 } from "lucide-react"
import React, { useState } from 'react'
import TableLoader from './loader'
import { PageSizeSelector } from './page-size-selector'
import { SearchForm } from './search-form'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPageChange?: (pageIndex: number) => void
  isLoading?: boolean
  manualPagination?: boolean
  actions?: React.ReactNode
}

const DOTS = '...'

function getPaginationRange(current: number, total: number, siblingCount = 1): (number | string)[] {
  const totalPageNumbers = siblingCount * 2 + 5
  if (total <= totalPageNumbers) {
    return Array.from({ length: total }, (_, i) => i)
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1)
  const rightSiblingIndex = Math.min(current + siblingCount, total - 2)

  const showLeftDots = leftSiblingIndex > 1
  const showRightDots = rightSiblingIndex < total - 2

  const pagination: (number | string)[] = [0]

  if (showLeftDots) pagination.push(DOTS)
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pagination.push(i)
  if (showRightDots) pagination.push(DOTS)

  pagination.push(total - 1)
  return pagination
}

export default function DataTable<TData>({
  data,
  columns,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  isLoading = false,
  manualPagination = true,
  actions,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    manualPagination,
    state: {
      ...(manualPagination && {
        pagination: {
          pageIndex,
          pageSize,
        }
      }),
      columnVisibility
    },
    onPaginationChange: manualPagination && onPageChange
      ? (updater) => {
        const newState = typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
        onPageChange(newState.pageIndex)
      }
      : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
  })

  return (
    <>
      {isLoading ? <TableLoader /> : (
        <div className='bg-white dark:bg-primary-foreground/50 p-4 rounded-lg'>
          <div className='flex flex-col md:flex-row items-center gap-2'>
            <div className='w-full mb-2 flex justify-end gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <LucideSettings2 className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table.getAllColumns()
                    .filter(col => col.getCanHide())
                    .map(col => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={val => col.toggleVisibility(!!val)}
                      >
                        {col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <SearchForm placeholder="Search..." paramKey="search" />
            </div>
            <div className='mb-2 flex justify-center'>
              {actions}
            </div>
          </div>
          <Table className='w-full rounded overflow-hidden'>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className=''>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {manualPagination && (
            <div className='flex justify-between pt-3'>
              <PageSizeSelector />
              <Pagination className='justify-end items-center'>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft />
                    </Button>
                  </PaginationItem>
                  <div className='hidden md:flex gap-1'>
                    {getPaginationRange(pageIndex, pageCount).map((page, idx) => (
                      <PaginationItem key={idx}>
                        {page === DOTS ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={pageIndex === page}
                            onClick={(e) => {
                              e.preventDefault()
                              table.setPageIndex(+page)
                            }}
                          >
                            {+page + 1}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                  </div>
                  <PaginationItem>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </>
  )
}
