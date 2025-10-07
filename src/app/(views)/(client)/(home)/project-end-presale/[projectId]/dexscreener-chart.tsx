"use client";

import React from "react";
import { useTheme } from "next-themes";

interface DexScreenerChartProps {
  tokenAddress?: string;
  pairAddress?: string;
  chainId?: string;
  height?: number;
  width?: string;
}

/**
 * DexScreenerChart Component
 *
 * Embeds a DexScreener chart iframe for displaying token price charts.
 * Automatically adapts to the current theme (dark/light mode).
 *
 * @param tokenAddress - The contract address of the token
 * @param pairAddress - The pair address (if available, takes priority over tokenAddress)
 * @param chainId - The blockchain network (e.g., "ethereum", "bsc", "polygon")
 * @param height - Height of the chart in pixels (default: 400)
 * @param width - Width of the chart (default: "100%")
 *
 * @example
 * <DexScreenerChart
 *   tokenAddress="0x1234..."
 *   chainId="ethereum"
 *   height={500}
 * />
 *
 * @note The chart theme automatically follows the app's theme using next-themes
 */

const DexScreenerChart: React.FC<DexScreenerChartProps> = ({
  tokenAddress,
  pairAddress,
  chainId = "ethereum",
  height = 400,
  width = "100%",
}) => {
  const { theme } = useTheme();

  // Generate DexScreener embed URL with theme support
  const generateEmbedUrl = () => {
    const themeParam = theme === "dark" ? "dark" : "light";

    if (pairAddress) {
      // If we have pair address, use it directly
      return `https://dexscreener.com/${chainId}/${pairAddress}?embed=1&theme=${themeParam}&trades=0&info=0`;
    } else if (tokenAddress) {
      // If we only have token address, use token-based URL
      return `https://dexscreener.com/${chainId}/${tokenAddress}?embed=1&theme=${themeParam}&trades=0&info=0`;
    } else {
      // Fallback to a default chart (you can change this to any popular token)
      return `https://dexscreener.com/ethereum/0xa0b86a33e6441b8c4c8c0e4b8c4c8c0e4b8c4c8c0?embed=1&theme=${themeParam}&trades=0&info=0`;
    }
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
          title="DexScreener Chart"
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
          href="https://dexscreener.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          DexScreener
        </a>
      </div>
    </div>
  );
};

export default DexScreenerChart;
