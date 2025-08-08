"use client";
import { TAllocation } from "@/types/project";
import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartAllocations({ data }: { data: TAllocation[] }) {
  const colors = data.map(
    (_, index) => `hsl(${(index * 360) / data.length}, 70%, 50%)`
  );
  const { theme } = useTheme();
  if (!data || data.length === 0) return <p>No data</p>;
  const series: number[] = data.map((i) => Number(i.supply));
  const labels: string[] = data.map((i) => i.name) || [];

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: "chart-allocation",
      type: "pie",
      width: "100%",
      background: "transparent",
    },
    colors: colors,
    theme: {
      mode: theme as "dark" | "light",
    },
    labels,
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
      position: "bottom",
    },
  };
  return (
    <div className="w-full">
      <ApexChart type="pie" options={options} series={series} />
    </div>
  );
}
