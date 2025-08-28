"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { TokenBalanceService } from "@/services/token-balance.service";
import BigNumber from "bignumber.js";

interface TokenConfig {
  symbol: string;
  address?: string;
  isNative?: boolean;
  useWalletBalance?: boolean; // false untuk project tokens (akan pakai total supply)
}

interface TokenBalanceData {
  symbol: string;
  balance: BigNumber;
  totalSupply?: BigNumber;
  decimals: number;
  isNative: boolean;
  formatted: string;
  isLoading: boolean;
}

interface UseTokenBalancesOptions {
  refreshInterval?: number; // dalam milidetik, default 30 detik
  autoRefresh?: boolean; // default true
  enabled?: boolean; // default true
}

interface UseTokenBalancesReturn {
  balances: Record<string, TokenBalanceData>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isInitialized: boolean;
  lastUpdated: Date | null;
}

/**
 * Hook untuk mengelola balance token dari wallet dan total supply project tokens
 */
export function useTokenBalances(
  tokens: TokenConfig[],
  options: UseTokenBalancesOptions = {}
): UseTokenBalancesReturn {
  const {
    refreshInterval = 30 * 1000, // 30 detik
    autoRefresh = true,
    enabled = true,
  } = options;

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [balances, setBalances] = useState<Record<string, TokenBalanceData>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Memoized token configuration untuk optimasi - stabilized without JSON.stringify
  const tokenConfigString = useMemo(() => {
    return tokens
      .map(
        (t) =>
          `${t.symbol}-${
            t.address?.toLowerCase() || "native"
          }-${!!t.isNative}-${!!t.useWalletBalance}`
      )
      .sort()
      .join("|");
  }, [tokens]);

  const tokenConfig = useMemo(() => {
    // Sort dan stabilize untuk prevent unnecessary re-renders
    return tokens
      .map((token) => ({
        symbol: token.symbol,
        address: token.address?.toLowerCase(), // normalize address
        isNative: Boolean(token.isNative),
        useWalletBalance: Boolean(token.useWalletBalance ?? true),
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [tokenConfigString]);

  // Initialize service when wallet is connected
  useEffect(() => {
    const initializeService = async () => {
      if (walletClient && address && enabled) {
        try {
          const success = await TokenBalanceService.initialize(
            walletClient,
            address
          );
          setIsInitialized(success);
          if (!success) {
            setError("Gagal menginisialisasi service balance token");
          }
        } catch (err) {
          setError("Error saat menginisialisasi service balance token");
          setIsInitialized(false);
        }
      } else {
        setIsInitialized(false);
        TokenBalanceService.reset();
      }
    };

    initializeService();
  }, [walletClient, address, enabled]);

  // Debounced fetch untuk prevent terlalu banyak calls
  const [fetchTimeoutId, setFetchTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isFetching, setIsFetching] = useState(false);

  // Fetch token balances dengan debouncing dan rate limiting
  const fetchBalances = useCallback(async () => {
    if (!isInitialized || !enabled || tokenConfig.length === 0 || isFetching) {
      return;
    }

    // Clear existing timeout
    if (fetchTimeoutId) {
      clearTimeout(fetchTimeoutId);
    }

    // Debounce fetch calls
    const timeoutId = setTimeout(async () => {
      try {
        setIsFetching(true);
        setLoading(true);
        setError(null);

        // Moved detailed fetch logging to separate useEffect to prevent render cycles

        // Validate token configs sebelum fetch
        const validTokenConfigs = tokenConfig.filter((token) => {
          if (token.isNative) return true;
          if (!token.address) {
            console.warn(`⚠️ Token ${token.symbol} tidak memiliki address`);
            return false;
          }
          // Basic address validation (harus dimulai dengan 0x dan panjang 42 karakter)
          if (!token.address.match(/^0x[a-fA-F0-9]{40}$/)) {
            console.warn(
              `⚠️ Token ${token.symbol} memiliki address tidak valid: ${token.address}`
            );
            return false;
          }
          return true;
        });

        if (validTokenConfigs.length === 0) {
          throw new Error("Tidak ada token valid untuk diambil balancenya");
        }

        const tokenBalances =
          await TokenBalanceService.getMultipleTokenBalances(validTokenConfigs);

        const formattedBalances: Record<string, TokenBalanceData> = {};

        Object.entries(tokenBalances).forEach(([symbol, tokenInfo]) => {
          const formattedBalance = TokenBalanceService.formatBalance(
            tokenInfo.balance
          );

          formattedBalances[symbol] = {
            symbol: tokenInfo.symbol,
            balance: tokenInfo.balance,
            totalSupply: tokenInfo.totalSupply,
            decimals: tokenInfo.decimals,
            isNative: tokenInfo.isNative,
            formatted: formattedBalance,
            isLoading: false,
          };

          // Debug logging moved to separate useEffect to prevent render cycles
        });

        // Tambahkan invalid tokens dengan balance 0
        tokenConfig.forEach((token) => {
          if (!formattedBalances[token.symbol]) {
            formattedBalances[token.symbol] = {
              symbol: token.symbol,
              balance: new BigNumber(0),
              decimals: 18,
              isNative: token.isNative || false,
              formatted: "0",
              isLoading: false,
            };
          }
        });

        setBalances(formattedBalances);
        setLastUpdated(new Date());
        console.log("✅ Balance fetch completed successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal mengambil balance token";
        setError(errorMessage);
        console.error("❌ Error fetching token balances:", err);

        // Set loading state untuk semua tokens ke false saat error
        const errorBalances: Record<string, TokenBalanceData> = {};
        tokenConfig.forEach((token) => {
          errorBalances[token.symbol] = {
            symbol: token.symbol,
            balance: new BigNumber(0),
            decimals: 18,
            isNative: token.isNative || false,
            formatted: "0",
            isLoading: false,
          };
        });
        setBalances(errorBalances);
      } finally {
        setLoading(false);
        setIsFetching(false);
        setFetchTimeoutId(null);
      }
    }, 500); // 500ms debounce

    setFetchTimeoutId(timeoutId);
  }, [isInitialized, enabled, tokenConfig, isFetching, fetchTimeoutId]);

  // Initial fetch
  useEffect(() => {
    if (isInitialized && enabled && tokenConfig.length > 0) {
      fetchBalances();
    }
  }, [fetchBalances, isInitialized, enabled, tokenConfig]);

  // Auto refresh dengan rate limiting
  useEffect(() => {
    if (
      !autoRefresh ||
      !isInitialized ||
      !enabled ||
      tokenConfig.length === 0
    ) {
      return;
    }

    // Minimum interval 10 seconds untuk prevent spam
    const actualInterval = Math.max(refreshInterval, 10000);

    const interval = setInterval(() => {
      // Only refresh if not currently fetching
      if (!isFetching && !loading) {
        console.log("🔄 Auto-refreshing token balances...");
        fetchBalances();
      } else {
        console.log("⏭️ Skipping auto-refresh - already fetching");
      }
    }, actualInterval);

    return () => {
      console.log("🧹 Cleaning up auto-refresh interval");
      clearInterval(interval);
    };
  }, [
    autoRefresh,
    isInitialized,
    enabled,
    tokenConfig.length, // Only depend on length, not full array
    refreshInterval,
    isFetching,
    loading,
    fetchBalances,
  ]);

  // Debug logging for balance updates (separate to prevent render cycles)
  useEffect(() => {
    if (Object.keys(balances).length > 0) {
      Object.entries(balances).forEach(([symbol, tokenData]) => {
        // Special logging for project tokens
        const isProjectToken =
          symbol === "BU" || (!tokenData.isNative && tokenData.totalSupply);

        if (isProjectToken) {
          console.log(`🎯 PROJECT TOKEN Balance updated for ${symbol}:`, {
            symbol: tokenData.symbol,
            isNative: tokenData.isNative,
            balance: tokenData.balance.toString(),
            formatted: tokenData.formatted,
            totalSupply: tokenData.totalSupply?.toString(),
            decimals: tokenData.decimals,
            expectedForBU: "Should show 10,000",
            isProjectToken: true,
          });
        } else {
          console.log(`💰 Regular token balance updated for ${symbol}:`, {
            symbol: tokenData.symbol,
            isNative: tokenData.isNative,
            balance: tokenData.balance.toString(),
            formatted: tokenData.formatted,
            decimals: tokenData.decimals,
          });
        }
      });
    }
  }, [balances]);

  // Reset balances when wallet disconnects dan cleanup
  useEffect(() => {
    if (!address || !walletClient) {
      console.log("🔌 Wallet disconnected - cleaning up balances");

      // Clear any pending fetch timeouts
      if (fetchTimeoutId) {
        clearTimeout(fetchTimeoutId);
        setFetchTimeoutId(null);
      }

      setBalances({});
      setIsInitialized(false);
      setError(null);
      setLastUpdated(null);
      setIsFetching(false);
      setLoading(false);
      TokenBalanceService.reset();
    }
  }, [address, walletClient, fetchTimeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 useTokenBalances cleanup");
      if (fetchTimeoutId) {
        clearTimeout(fetchTimeoutId);
      }
    };
  }, [fetchTimeoutId]);

  return {
    balances,
    loading,
    error,
    refetch: fetchBalances,
    isInitialized,
    lastUpdated,
  };
}

/**
 * Hook untuk single token balance
 */
export function useTokenBalance(
  tokenConfig: TokenConfig,
  options: UseTokenBalancesOptions = {}
): UseTokenBalancesReturn & { balance: TokenBalanceData | null } {
  const result = useTokenBalances([tokenConfig], options);

  return {
    ...result,
    balance: result.balances[tokenConfig.symbol] || null,
  };
}

/**
 * Hook khusus untuk token pairs di liquidity pool
 */
export function useLiquidityTokenBalances(
  tokenA: TokenConfig,
  tokenB: TokenConfig,
  options: UseTokenBalancesOptions = {}
) {
  // Stable token array to prevent infinite re-renders
  const tokensString = useMemo(() => {
    const sorted = [tokenA, tokenB].sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
    return sorted
      .map(
        (t) =>
          `${t.symbol}-${
            t.address?.toLowerCase() || "native"
          }-${!!t.isNative}-${!!t.useWalletBalance}`
      )
      .join("|");
  }, [tokenA, tokenB]);

  const tokens = useMemo(() => [tokenA, tokenB], [tokensString]);

  const { balances, loading, error, refetch, isInitialized, lastUpdated } =
    useTokenBalances(tokens, options);

  return {
    tokenA: balances[tokenA.symbol] || null,
    tokenB: balances[tokenB.symbol] || null,
    balances,
    loading,
    error,
    refetch,
    isInitialized,
    lastUpdated,
    // Helper untuk memeriksa apakah kedua balance sudah dimuat
    bothLoaded: !!(balances[tokenA.symbol] && balances[tokenB.symbol]),
  };
}
