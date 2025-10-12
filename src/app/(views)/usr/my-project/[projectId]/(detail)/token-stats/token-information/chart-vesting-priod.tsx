"use client";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import moment from "moment";
import TableVestingPeriod from "./table-vesting-priod";
import {
  VestingData as TVestingData,
  buildAllIncrements,
  buildDayBuckets,
  buildSeriesForTimeline,
} from "./vesting-utils";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// TVestingData is imported from vesting-utils

/**
 * ChartVestingPeriod Component
 *
 * Displays a stacked area chart showing token unlock schedule over time.
 * Features:
 * - Real-time current date indicator (red dashed vertical line)
 * - Dark/light theme support
 * - Interactive tooltips with percentage calculations
 * - Responsive design
 *
 * @param data - Array of vesting data for different categories
 * @param totalSupply - Total supply of tokens for percentage calculations
 */
export default function ChartVestingPeriod({
  data,
  totalSupply,
}: {
  data: TVestingData[];
  totalSupply: number;
}) {
  const { theme } = useTheme();

  if (!data || data.length === 0) return <p>No data</p>;

  // Build increments and timeline
  const { perItemIncrements, allEventDates, minDateIso, maxDateIso } =
    buildAllIncrements(data);

  // You can change stepDays to any interval (e.g., 7 for weekly, 1 for daily, 0 to use exact event dates)
  const stepDays = 0; // dynamic: 0 means use exact event dates; >0 means bucket by N days

  const timelineDates = (() => {
    if (!minDateIso || !maxDateIso) return [] as string[];
    if (stepDays > 0) return buildDayBuckets(minDateIso, maxDateIso, stepDays);
    return allEventDates;
  })();

  const series = buildSeriesForTimeline(
    data,
    perItemIncrements,
    timelineDates,
    { stepDays }
  );
  const categories = timelineDates.map((d) => moment(d).format("MMM D, YYYY"));
  const colors = data.map((item) => item.color);

  // Get current date for the vertical line
  const currentDate = moment().format("MMM D, YYYY");
  const currentDateIndex = categories.findIndex((cat) => cat === currentDate);

  // If current date is not in categories, find the closest date
  let currentDateForLine = currentDate;
  if (currentDateIndex === -1 && categories.length > 0) {
    const currentMoment = moment();
    let closestDate = categories[0];
    let minDiff = Math.abs(
      moment(categories[0], "MMM D, YYYY").diff(currentMoment, "days")
    );

    for (let i = 1; i < categories.length; i++) {
      const diff = Math.abs(
        moment(categories[i], "MMM D, YYYY").diff(currentMoment, "days")
      );
      if (diff < minDiff) {
        minDiff = diff;
        closestDate = categories[i];
      }
    }
    currentDateForLine = closestDate;
  }

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
    annotations: {
      xaxis: [
        {
          x: currentDateForLine,
          borderColor: theme === "dark" ? "#ef4444" : "#dc2626",
          borderWidth: 2,
          strokeDashArray: 5,
          label: {
            text: currentDateIndex === -1 ? "Current Period" : "Today",
            style: {
              color: theme === "dark" ? "#ffffff" : "#000000",
              background: theme === "dark" ? "#ef4444" : "#dc2626",
              fontSize: "12px",
              fontWeight: "600",
            },
            orientation: "horizontal",
            offsetY: -10,
          },
        },
      ],
    },
  };

  return (
    <div className="w-full">
      <ApexChart type="area" options={options} series={series} height={400} />
      <TableVestingPeriod data={data} totalSupply={totalSupply} />
    </div>
  );
}
