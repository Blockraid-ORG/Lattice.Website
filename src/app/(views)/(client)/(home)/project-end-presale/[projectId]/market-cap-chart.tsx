"use client";

import React, { useState, useMemo, useRef } from "react";
import { Download } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { optionsChartMarketCap } from "./options-chart-market-cap";

const MarketCapChart = () => {
  const [selectedRange, setSelectedRange] = useState("ALL");
  const chartRef = useRef<any>(null);

  // Generate sample data based on the chart pattern
  const generateMarketCapData = (range: string) => {
    const data = [];
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);
    let intervalDays = 1; // Daily data points

    // Set date range based on selection
    switch (range) {
      case "7D":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervalDays = 1;
        break;
      case "30D":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        intervalDays = 1;
        break;
      case "1Y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        intervalDays = 7;
        break;
      case "ALL":
      default:
        startDate = new Date("2024-01-01");
        endDate = new Date("2025-10-31");
        intervalDays = 7;
        break;
    }

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const timeProgress =
        (currentDate.getTime() - startDate.getTime()) /
        (endDate.getTime() - startDate.getTime());

      // Simulate the market cap trend from the chart
      let value;
      if (timeProgress < 0.25) {
        // Early period: Steady rise to ~$2B
        value = 0.25 + (timeProgress / 0.25) * 1.75;
      } else if (timeProgress < 0.4) {
        // Mid period: Dip to ~$1B
        value = 2 - ((timeProgress - 0.25) / 0.15) * 1;
      } else if (timeProgress < 0.6) {
        // Late period: Strong rise to peak ~$5B
        value = 1 + ((timeProgress - 0.4) / 0.2) * 4;
      } else if (timeProgress < 0.7) {
        // Recent period: Sharp decline to ~$2.5B
        value = 5 - ((timeProgress - 0.6) / 0.1) * 2.5;
      } else {
        // Current period: Stabilize around $2.5B-$3.5B
        value = 2.5 + Math.sin((timeProgress - 0.7) * Math.PI * 2) * 0.5;
      }

      // Add some random noise
      value += (Math.random() - 0.5) * 0.1;
      value = Math.max(0, value); // Ensure non-negative

      data.push({
        x: currentDate.getTime(),
        y: value,
      });

      currentDate.setDate(currentDate.getDate() + intervalDays);
    }

    return data;
  };

  const chartData = useMemo(
    () => generateMarketCapData(selectedRange),
    [selectedRange]
  );

  const timeRangeOptions = [
    { value: "7D", label: "7D" },
    { value: "30D", label: "30D" },
    { value: "1Y", label: "1Y" },
    { value: "ALL", label: "ALL" },
  ];

  const series = [
    {
      name: "Market Capitalization",
      data: chartData,
    },
  ];

  // Function to download chart as PNG
  const handleDownloadChart = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.chart;
      if (chartInstance) {
        const dataURI = chartInstance.dataURI({
          type: "png",
          quality: 1.0,
          width: 1200,
          height: 600,
        });

        // Create download link
        const link = document.createElement("a");
        link.download = `market-cap-chart-${selectedRange.toLowerCase()}-${
          new Date().toISOString().split("T")[0]
        }.png`;
        link.href = dataURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRange(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedRange === option.value
                  ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleDownloadChart}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Download chart as PNG"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <ReactApexChart
          ref={chartRef}
          options={optionsChartMarketCap as ApexOptions}
          series={series}
          type="area"
          height={400}
        />
      </div>
    </div>
  );
};

export default MarketCapChart;
