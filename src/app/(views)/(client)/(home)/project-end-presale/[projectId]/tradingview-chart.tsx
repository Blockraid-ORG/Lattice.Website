"use client";

import React, { useEffect, useRef, memo } from "react";
import { useTheme } from "next-themes";

interface TradingViewChartProps {
  symbol?: string;
  tokenAddress?: string;
  pairAddress?: string;
  chainId?: string;
  height?: number;
  width?: string;
}

/**
 * TradingViewChart Component
 *
 * Embeds a TradingView advanced chart widget for displaying token price charts.
 * Automatically adapts to the current theme (dark/light mode).
 *
 * @param symbol - The trading symbol (e.g., "BTCUSD", "ETHUSD")
 * @param tokenAddress - The contract address of the token (for reference)
 * @param pairAddress - The pair address (for reference)
 * @param chainId - The blockchain network (for reference)
 * @param height - Height of the chart in pixels (default: 500)
 * @param width - Width of the chart (default: "100%")
 *
 * @example
 * <TradingViewChart
 *   symbol="BTCUSD"
 *   height={600}
 * />
 *
 * @note The chart theme automatically follows the app's theme using next-themes
 */

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "BTCUSD",
  tokenAddress,
  pairAddress,
  chainId,
  height = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Get the actual theme (resolved)
  const currentTheme = mounted
    ? theme === "system"
      ? resolvedTheme
      : theme
    : "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Clear existing widget
    const container = containerRef.current;
    container.innerHTML = "";

    // Create script element
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Configure the widget
    const config = {
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: currentTheme === "dark" ? "dark" : "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      studies: ["STD;Volume"],
      container_id: "tradingview_widget",
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, currentTheme, mounted]);

  if (!mounted) {
    return (
      <div
        className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          ref={containerRef}
          className="tradingview-widget-container"
          style={{ width: "100%", height: "100%" }}
        >
          <div
            id="tradingview_widget"
            className="tradingview-widget-container__widget"
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>

      {/* Reference info (hidden, can be used for debugging) */}
      {(tokenAddress || pairAddress || chainId) && (
        <div className="hidden">
          Token: {tokenAddress}, Pair: {pairAddress}, Chain: {chainId}
        </div>
      )}
    </div>
  );
};

export default memo(TradingViewChart);
