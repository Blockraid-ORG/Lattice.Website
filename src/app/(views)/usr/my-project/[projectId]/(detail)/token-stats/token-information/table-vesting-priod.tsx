"use client";

import React from "react";
import moment from "moment";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildTableEvents, VestingData as TVestingData } from "./vesting-utils";

// TVestingData is imported from vesting-utils

type TUnlockEvent = {
  dateLabel: string;
  dateIso: string;
  totalUnlocked: number;
  percent: number;
  contributors: { name: string; amount: number }[];
};

// no helpers needed; we will aggregate by actual calendar day using moment

export default function TableVestingPeriod({
  data,
  totalSupply,
}: {
  data: TVestingData[];
  totalSupply: number;
}) {
  const [hideSmall, setHideSmall] = React.useState(false);
  const smallUnlockThresholdPct = 0.5; // percent
  const [tab, setTab] = React.useState<"upcoming" | "past">("upcoming");
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  if (!data || data.length === 0) return null;

  // Build events using shared util for consistency with chart
  const events: TUnlockEvent[] = buildTableEvents(data, totalSupply).map(
    (e) => ({
      dateLabel: moment(e.dateIso).format("MMM D, YYYY"),
      dateIso: e.dateIso,
      totalUnlocked: e.totalUnlocked,
      percent: e.percent,
      contributors: e.contributors,
    })
  );

  const nowIso = moment().format("YYYY-MM-DD");
  const filtered = events.filter((e) => {
    if (hideSmall && e.percent < smallUnlockThresholdPct) return false;
    if (tab === "upcoming") return e.dateIso >= nowIso;
    return e.dateIso < nowIso;
  });

  // sort ascending by date
  filtered.sort((a, b) => (a.dateIso < b.dateIso ? -1 : 1));

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * rowsPerPage;
  const end = Math.min(filtered.length, start + rowsPerPage);
  const pageItems = filtered.slice(start, end);

  const handleChangePage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-muted-foreground cursor-help">
                    Small Unlocks
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Hide events smaller than {smallUnlockThresholdPct}% of max
                  supply
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Switch
              checked={hideSmall}
              onCheckedChange={(v) => setHideSmall(Boolean(v))}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                tab === "upcoming"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onClick={() => setTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                tab === "past"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onClick={() => setTab("past")}
            >
              Past
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show rows</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => {
              const n = Number(v);
              setRowsPerPage(n);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Total Unlocked</TableHead>
            <TableHead>% Max Supply</TableHead>
            <TableHead className="text-right">Allocations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((ev) => (
            <TableRow key={ev.dateIso}>
              <TableCell className="whitespace-nowrap">
                {ev.dateLabel}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {ev.totalUnlocked.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>{ev.percent.toFixed(2)}%</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-1 text-primary">
                    <span>{ev.contributors.length} allocations</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Allocations</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ev.contributors.map((c) => (
                      <DropdownMenuItem
                        key={c.name}
                        className="flex items-center justify-between"
                      >
                        <span>{c.name}</span>
                        <span className="text-muted-foreground">
                          {c.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
        <div>
          Showing {filtered.length === 0 ? 0 : start + 1} - {end} out of{" "}
          {filtered.length}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  handleChangePage(currentPage - 1)
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  className="cursor-pointer"
                  isActive={currentPage === idx + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    handleChangePage(idx + 1)
                  }}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  handleChangePage(currentPage + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
