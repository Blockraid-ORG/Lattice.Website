"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TVestingData {
  name: string;
  total: number;
  vestingMonths: number;
  startDate: string;
  color: string;
}

export default function ChartVestingPeriod({ data }: { data: TVestingData[] }) {
  const { theme } = useTheme();

  if (!data || data.length === 0) return <p>No data</p>;

  // Generate monthly labels starting from August 2025 for 49 months
  const generateMonthlyLabels = (start: string, months: number): string[] => {
    const labels: string[] = [];
    const [year, month] = start.split("-").map(Number);
    const date = new Date(year, month - 1);

    for (let i = 0; i < months; i++) {
      labels.push(
        date.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
      );
      date.setMonth(date.getMonth() + 1);
    }
    return labels;
  };

  // Get month offset between two dates
  const getMonthOffset = (base: string, target: string): number => {
    const [baseY, baseM] = base.split("-").map(Number);
    const [targetY, targetM] = target.split("-").map(Number);
    return (targetY - baseY) * 12 + (targetM - baseM);
  };

  // Accumulate data for cumulative chart
  const accumulate = (data: number[]): number[] => {
    const result: number[] = [];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
      result.push(sum);
    }
    return result;
  };

  // Create vesting dataset for each category
  const createVestingDataset = (item: TVestingData, maxVesting: number) => {
    const startIdx = getMonthOffset("2025-08", item.startDate);
    const dataArray = Array(maxVesting).fill(0);

    if (item.vestingMonths === 0) {
      // Immediate unlock
      dataArray[startIdx] = item.total;
    } else {
      // Gradual vesting
      const monthlyUnlock = item.total / item.vestingMonths;
      for (let i = 0; i < item.vestingMonths; i++) {
        if (startIdx + i < maxVesting) {
          dataArray[startIdx + i] = monthlyUnlock;
        }
      }
    }

    return {
      name: item.name,
      data: accumulate(dataArray),
    };
  };

  // Generate series data
  const maxVesting = Math.max(...data.map((item) => item.vestingMonths));
  const series = data.map((item) => createVestingDataset(item, maxVesting));
  const categories = generateMonthlyLabels("2025-08", maxVesting);
  const colors = data.map((item) => item.color);

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: "chart-vesting-schedule",
      type: "area",
      width: "100%",
      background: "transparent",
      stacked: true,
      zoom: {
        enabled: true,
      },
    },
    colors: colors,
    theme: {
      mode: theme as "dark" | "light",
    },
    stroke: {
      curve: "stepline",
      width: 0,
    },
    fill: {
      type: "solid",
      opacity: 0.8,
    },
    markers: {
      size: 0,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Time",
      },
      labels: {
        rotate: -45,
        maxHeight: 120,
      },
    },
    yaxis: {
      title: {
        text: "Tokens Unlocked",
      },
      labels: {
        formatter: (value: number) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(0) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "K";
          }
          return value.toFixed(0);
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          return value.toLocaleString() + " tokens";
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
    },
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
    },
    title: {
      text: "Unlock Schedule",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "600",
      },
    },
  };

  return (
    <div className="w-full">
      <ApexChart type="area" options={options} series={series} height={400} />
    </div>
  );
}
