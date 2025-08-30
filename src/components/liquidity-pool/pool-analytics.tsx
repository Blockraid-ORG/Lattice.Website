"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniswapPoolService } from "@/services/uniswap/uniswap-pool.service";
import { useUniswapIntegration } from "@/hooks/useUniswapIntegration";
import BigNumber from "bignumber.js";

interface PoolAnalyticsProps {
  tokenA?: {
    address: string;
    symbol: string;
    name: string;
  };
  tokenB?: {
    address: string;
    symbol: string;
    name: string;
  };
  feeTier?: string; // "0.05", "0.3", "1"
  chainId?: number;
  className?: string;
}

interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  liquidity: string;
  tick: number;
  sqrtPriceX96: string;
}

export function PoolAnalytics({
  tokenA,
  tokenB,
  feeTier = "0.3",
  chainId = 56,
  className = "",
}: PoolAnalyticsProps) {
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  const { checkPoolExists, getPoolInfo, convertFeeTier } =
    useUniswapIntegration();

  // Load pool analytics
  const loadPoolAnalytics = async () => {
    if (!tokenA?.address || !tokenB?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if pool exists
      const poolAddress = await checkPoolExists(
        tokenA.address,
        tokenB.address,
        feeTier,
        chainId
      );

      if (poolAddress) {
        setExists(true);

        // Get detailed pool info
        const info = await getPoolInfo(poolAddress, chainId);
        if (info) {
          setPoolInfo(info);
        }
      } else {
        setExists(false);
        setPoolInfo(null);
      }
    } catch (error: any) {
      console.error("Error loading pool analytics:", error);
      setError(error.message || "Failed to load pool information");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenA?.address && tokenB?.address) {
      loadPoolAnalytics();
    }
  }, [tokenA?.address, tokenB?.address, feeTier, chainId]);

  // Helper functions
  const formatFeeTier = (fee: number) => {
    switch (fee) {
      case 500:
        return "0.05%";
      case 3000:
        return "0.30%";
      case 10000:
        return "1.00%";
      default:
        return `${fee / 10000}%`;
    }
  };

  const formatLiquidity = (liquidity: string) => {
    const bn = new BigNumber(liquidity);
    if (bn.gte(1e18)) {
      return bn.div(1e18).decimalPlaces(2).toString() + "E";
    } else if (bn.gte(1e15)) {
      return bn.div(1e15).decimalPlaces(2).toString() + "P";
    } else if (bn.gte(1e12)) {
      return bn.div(1e12).decimalPlaces(2).toString() + "T";
    } else if (bn.gte(1e9)) {
      return bn.div(1e9).decimalPlaces(2).toString() + "B";
    } else if (bn.gte(1e6)) {
      return bn.div(1e6).decimalPlaces(2).toString() + "M";
    } else if (bn.gte(1e3)) {
      return bn.div(1e3).decimalPlaces(2).toString() + "K";
    }
    return bn.decimalPlaces(2).toString();
  };

  const calculatePrice = (sqrtPriceX96: string) => {
    try {
      const price = new BigNumber(sqrtPriceX96)
        .div(new BigNumber(2).pow(96))
        .pow(2);
      return price.toFixed(8);
    } catch {
      return "0";
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    const chainNames = {
      1: "Ethereum",
      56: "BSC",
      137: "Polygon",
      42161: "Arbitrum",
      43114: "Avalanche",
    };
    return chainNames[chainId as keyof typeof chainNames] || "Unknown";
  };

  const getExplorerUrl = (chainId: number, address: string) => {
    const baseUrls = {
      1: "https://etherscan.io",
      56: "https://bscscan.com",
      137: "https://polygonscan.com",
      42161: "https://arbiscan.io",
      43114: "https://snowtrace.io",
    };

    const baseUrl = baseUrls[chainId as keyof typeof baseUrls];
    return baseUrl ? `${baseUrl}/address/${address}` : null;
  };

  if (!tokenA?.address || !tokenB?.address) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Icon
              name="mdi:chart-line"
              className="w-8 h-8 mx-auto mb-3 text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Pilih kedua token untuk melihat analytics pool
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="mdi:chart-line" className="w-5 h-5" />
            Pool Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Icon
              name="mdi:alert-circle"
              className="w-8 h-8 mx-auto mb-3 text-red-500"
            />
            <p className="text-sm font-medium text-red-700 mb-2">
              Error loading pool analytics
            </p>
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={loadPoolAnalytics}>
              <Icon name="mdi:refresh" className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exists) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="mdi:chart-line" className="w-5 h-5" />
            Pool Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 border border-dashed border-orange-300 rounded-lg bg-orange-50">
            <Icon
              name="mdi:pool-off"
              className="w-8 h-8 mx-auto mb-3 text-orange-600"
            />
            <p className="text-sm font-medium text-orange-700 mb-2">
              Pool Belum Ada
            </p>
            <p className="text-xs text-orange-600 mb-4">
              Pool untuk {tokenA.symbol}/{tokenB.symbol} dengan fee tier{" "}
              {feeTier}% belum dibuat di {getChainName(chainId)}
            </p>
            <div className="space-y-2 text-xs text-orange-600">
              <div>
                • Pool akan dibuat otomatis saat Anda menambahkan liquidity
              </div>
              <div>• Anda dapat mengatur starting price untuk pool baru</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="mdi:chart-line" className="w-5 h-5" />
            Pool Analytics
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {getChainName(chainId)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatFeeTier(poolInfo?.fee || convertFeeTier(feeTier))}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {poolInfo && (
          <>
            {/* Pool Address & External Links */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Pool Address
                </div>
                <div className="font-mono text-sm">
                  {shortenAddress(poolInfo.address)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getExplorerUrl(chainId, poolInfo.address) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getExplorerUrl(chainId, poolInfo.address)!,
                        "_blank"
                      )
                    }
                  >
                    <Icon name="mdi:open-in-new" className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://app.uniswap.org/pools/${poolInfo.address}`,
                      "_blank"
                    )
                  }
                >
                  <Icon name="cryptocurrency-color:uni" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Token Pair Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Token 0
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="mdi:coin" className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-sm">{tokenA.symbol}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {shortenAddress(poolInfo.token0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Token 1
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="mdi:coin" className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-sm">{tokenB.symbol}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {shortenAddress(poolInfo.token1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pool Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Current Price
                </div>
                <div className="font-mono text-lg font-bold">
                  {calculatePrice(poolInfo.sqrtPriceX96)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tokenA.symbol}/{tokenB.symbol}
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Total Liquidity
                </div>
                <div className="font-mono text-lg font-bold">
                  {formatLiquidity(poolInfo.liquidity)}
                </div>
                <div className="text-xs text-muted-foreground">Units</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Current Tick
                </div>
                <div className="font-mono text-lg font-bold">
                  {poolInfo.tick.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Position</div>
              </div>
            </div>

            {/* Technical Data */}
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Icon name="mdi:code-tags" className="w-4 h-4" />
                Technical Data
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">sqrtPriceX96:</span>
                  <span>
                    {new BigNumber(poolInfo.sqrtPriceX96).toExponential(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Tier:</span>
                  <span>{formatFeeTier(poolInfo.fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain:</span>
                  <span>
                    {getChainName(chainId)} (ID: {chainId})
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPoolAnalytics}
            disabled={isLoading}
          >
            <Icon name="mdi:refresh" className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
