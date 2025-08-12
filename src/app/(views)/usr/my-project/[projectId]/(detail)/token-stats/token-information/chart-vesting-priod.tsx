"use client";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import moment from "moment";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TVestingData {
  name: string;
  total: number;
  vestingMonths: number;
  startDate: string;
  color: string;
}

export default function ChartVestingPeriod({
  data,
  totalSupply,
}: {
  data: TVestingData[];
  totalSupply: number;
}) {
  const { theme } = useTheme();

  if (!data || data.length === 0) return <p>No data</p>;

  const generateMonthlyLabels = (start: string, months: number): string[] => {
    const labels: string[] = [];
    const [year, month] = start.split("-").map(Number);
    const date = new Date(year, month - 1);

    for (let i = 0; i < months; i++) {
      labels.push(moment(date).format("MMM YYYY"));
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

  // Find the earliest start date from all data
  const earliestStartDate = data.reduce((earliest, item) => {
    return item.startDate < earliest ? item.startDate : earliest;
  }, data[0].startDate);

  const createVestingDataset = (item: TVestingData, timelineMonths: number) => {
    const startIdx = getMonthOffset(earliestStartDate, item.startDate);
    const dataArray = Array(timelineMonths).fill(0);
    if (item.vestingMonths === 0) {
      if (startIdx < timelineMonths) dataArray[startIdx] = item.total;
    } else {
      const monthlyUnlock = item.total / item.vestingMonths;
      for (let i = 0; i < item.vestingMonths; i++) {
        if (startIdx + i < timelineMonths) {
          dataArray[startIdx + i] = monthlyUnlock;
        }
      }
    }

    const result = {
      name: item.name,
      data: accumulate(dataArray),
    };
    return result;
  };

  const timelineMonths = Math.max(
    ...data.map(
      (item) =>
        getMonthOffset(earliestStartDate, item.startDate) +
        (item.vestingMonths === 0 ? 1 : item.vestingMonths)
    )
  );
  const series = data.map((item) => createVestingDataset(item, timelineMonths));
  const categories = generateMonthlyLabels(earliestStartDate, timelineMonths);
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
      categories: categories,
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
        formatter: (value: number) => {
          const percentage = (value / totalSupply) * 100;
          return (
            value.toLocaleString() + " tokens / " + percentage.toFixed(1) + "%"
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
