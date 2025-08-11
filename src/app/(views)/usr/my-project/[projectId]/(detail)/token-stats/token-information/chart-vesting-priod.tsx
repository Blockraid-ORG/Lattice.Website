"use client";
import dayjs from "dayjs";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
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
  const getMonthOffset = (base: string, target: string): number => {
    const [baseY, baseM] = base.split("-").map(Number);
    const [targetY, targetM] = target.split("-").map(Number);
    return (targetY - baseY) * 12 + (targetM - baseM);
  };

  const accumulate = (data: number[]): number[] => {
    const result: number[] = [];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
      result.push(sum);
    }
    return result;
  };

  const createVestingDataset = (item: TVestingData, maxVesting: number) => {
    const startIdx = getMonthOffset("2025-08", item.startDate);
    const dataArray = Array(maxVesting).fill(0);

    if (item.vestingMonths === 0) {
      dataArray[startIdx] = item.total;
    } else {
      const monthlyUnlock = item.total / item.vestingMonths;
      for (let i = 0; i < item.vestingMonths; i++) {
        if (startIdx + i < maxVesting) {
          dataArray[startIdx + i] = monthlyUnlock;
        }
      }
    }

    const result = {
      name: item.name,
      data: accumulate(dataArray),
    };
    console.log("createVestingDataset", result);
    return result;
  };

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
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
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
      type: "category",
      categories: categories.map((i) => dayjs(i).format("YYYY-MM-DD")),
      title: {
        text: "Time",
      },
      labels: {
        rotate: -45,
        maxHeight: 120,
      },
      tooltip: {
        enabled: false,
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
        formatter: (
          value: number,
          { series, seriesIndex }: { series: number[][]; seriesIndex: number }
        ) => {
          const total = series[seriesIndex].reduce(
            (acc: number, curr: number) => acc + curr,
            0
          );
          const percentage = (value / total) * 100;
          return (
            value.toLocaleString() + " tokens / " + percentage.toFixed(2) + "%"
          );
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
