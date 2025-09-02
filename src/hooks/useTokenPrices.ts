"use client";

import { useState, useEffect, useCallback } from "react";
import { CoinGeckoService } from "@/services/coingecko.service";
import BigNumber from "bignumber.js";

interface TokenPriceData {
  price: BigNumber;
  priceNumber: number;
  change24h: number;
  formatted: string;
}

interface UseTokenPricesReturn {
  prices: Record<string, TokenPriceData>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

interface UseTokenPricesOptions {
  refreshInterval?: number; // dalam milidetik, default 5 menit
  autoRefresh?: boolean; // default true
  enabled?: boolean; // default true
}

/**
 * Hook untuk mengambil harga token dari CoinGecko API
 */
export function useTokenPrices(
  symbols: string[],
  options: UseTokenPricesOptions = {}
): UseTokenPricesReturn {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 menit
    autoRefresh = true,
    enabled = true,
  } = options;

  const [prices, setPrices] = useState<Record<string, TokenPriceData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!enabled || symbols.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const tokenPrices = await CoinGeckoService.getTokenPrices(symbols);
      setPrices(tokenPrices);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mengambil harga token";
      setError(errorMessage);
      "Error fetching token prices:", err;
    } finally {
      setLoading(false);
    }
  }, [symbols, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled && symbols.length > 0) {
      fetchPrices();
    }
  }, [fetchPrices, enabled, symbols]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !enabled || symbols.length === 0) return;

    const interval = setInterval(() => {
      fetchPrices();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, enabled, symbols, refreshInterval, fetchPrices]);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
    lastUpdated,
  };
}

/**
 * Hook untuk mengambil harga satu token
 */
export function useTokenPrice(
  symbol: string,
  options: UseTokenPricesOptions = {}
): UseTokenPricesReturn & { price: TokenPriceData | null } {
  const result = useTokenPrices([symbol], options);

  return {
    ...result,
    price: result.prices[symbol] || null,
  };
}

/**
 * Hook untuk mengambil harga beberapa token dengan mapping yang mudah digunakan
 */
export function useMultipleTokenPrices(
  tokenMap: Record<string, string[]>,
  options: UseTokenPricesOptions = {}
) {
  const allSymbols = Object.values(tokenMap).flat();
  const { prices, loading, error, refetch, lastUpdated } = useTokenPrices(
    allSymbols,
    options
  );

  const groupedPrices = Object.keys(tokenMap).reduce((acc, key) => {
    acc[key] = tokenMap[key].reduce((tokenAcc, symbol) => {
      tokenAcc[symbol] = prices[symbol] || {
        price: new BigNumber(0),
        priceNumber: 0,
        change24h: 0,
        formatted: "$0",
      };
      return tokenAcc;
    }, {} as Record<string, TokenPriceData>);
    return acc;
  }, {} as Record<string, Record<string, TokenPriceData>>);

  return {
    prices: groupedPrices,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}
