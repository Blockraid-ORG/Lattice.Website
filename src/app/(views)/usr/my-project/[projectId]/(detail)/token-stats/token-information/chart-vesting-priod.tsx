"use client";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import moment from "moment";
import TableVestingPeriod from "./table-vesting-priod";
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

  // We will generate x-axis categories using actual event dates (YYYY-MM-DD)

  const accumulate = (data: number[]): number[] => {
    const result: number[] = [];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
      result.push(sum);
    }
    return result;
  };

  // Build sorted unique event dates across all allocations
  const eventDatesSet = new Set<string>();
  for (const item of data) {
    let start = moment(item.startDate, ["YYYY-MM-DD", "YYYY-MM"], true);
    if (!start.isValid()) start = moment(item.startDate);
    if (!start.isValid()) continue;

    if (item.vestingMonths === 0) {
      eventDatesSet.add(start.format("YYYY-MM-DD"));
    } else {
      for (let i = 0; i < item.vestingMonths; i++) {
        eventDatesSet.add(start.clone().add(i, "months").format("YYYY-MM-DD"));
      }
    }
  }

  const eventDates = Array.from(eventDatesSet).sort(); // lexicographic works for YYYY-MM-DD

  const createVestingDataset = (item: TVestingData, dates: string[]) => {
    // Map increments per date for this allocation
    const increments = new Map<string, number>();
    let start = moment(item.startDate, ["YYYY-MM-DD", "YYYY-MM"], true);
    if (!start.isValid()) start = moment(item.startDate);
    if (start.isValid()) {
      if (item.vestingMonths === 0) {
        const key = start.format("YYYY-MM-DD");
        increments.set(key, (increments.get(key) || 0) + item.total);
      } else {
        const monthlyUnlock = item.total / item.vestingMonths;
        for (let i = 0; i < item.vestingMonths; i++) {
          const key = start.clone().add(i, "months").format("YYYY-MM-DD");
          increments.set(key, (increments.get(key) || 0) + monthlyUnlock);
        }
      }
    }

    const dataArray = dates.map((d) => increments.get(d) || 0);
    return {
      name: item.name,
      data: accumulate(dataArray),
    };
  };

  const series = data.map((item) => createVestingDataset(item, eventDates));
  const categories = eventDates.map((d) => moment(d).format("MMM D, YYYY"));
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
      <TableVestingPeriod data={data} totalSupply={totalSupply} />
    </div>
  );
}
