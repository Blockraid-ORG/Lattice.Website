"use client";

import React from "react";

interface BubblemapChartProps {
  tokenAddress?: string;
  chainId?: string;
  height?: number;
  width?: string;
}

/**
 * BubblemapChart Component
 *
 * Embeds a Bubblemap chart iframe for displaying token holder distribution.
 * Automatically adapts to the current theme (dark/light mode).
 *
 * @param tokenAddress - The contract address of the token
 * @param chainId - The blockchain network (e.g., "ethereum", "bsc", "polygon")
 * @param height - Height of the chart in pixels (default: 600)
 * @param width - Width of the chart (default: "100%")
 *
 * @example
 * <BubblemapChart
 *   tokenAddress="0x1234..."
 *   chainId="ethereum"
 *   height={700}
 * />
 *
 * @note The chart theme automatically follows the app's theme using next-themes
 */

const BubblemapChart: React.FC<BubblemapChartProps> = ({
  tokenAddress = "0xbc5b59ea1b6f8da8258615ee38d40e999ec5d74f",
  chainId = "bsc",
  height = 600,
  width = "100%",
}) => {
  // Generate Bubblemap embed URL with theme support
  const generateEmbedUrl = () => {
    return `https://app.bubblemaps.io/${chainId}/token/${tokenAddress}`;
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <iframe
          src={generateEmbedUrl()}
          width={width}
          height={height}
          frameBorder="0"
          allowTransparency={true}
          title="Bubblemap Chart"
          className="w-full"
          style={{
            border: "none",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Attribution */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Powered by{" "}
        <a
          href="https://bubblemap.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Bubblemap
        </a>
      </div>
    </div>
  );
};

export default BubblemapChart;
