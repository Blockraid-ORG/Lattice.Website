"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useUniswapIntegration } from "@/hooks/useUniswapIntegration";
import BigNumber from "bignumber.js";

interface PositionDisplayProps {
  userAddress?: string;
  chainId?: number;
  className?: string;
}

interface Position {
  tokenId: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  tokensOwed0: string;
  tokensOwed1: string;
}

export function PositionDisplay({
  userAddress,
  chainId = 56,
  className = "",
}: PositionDisplayProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, connect } = useWeb3AuthConnect();
  const { getUserPositions } = useUniswapIntegration();

  // Load positions
  const loadPositions = async () => {
    if (!isConnected || !userAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await connect();
      if (!walletClient) {
        throw new Error("Failed to connect wallet");
      }

      const userPositions = await getUserPositions(
        userAddress,
        chainId,
        walletClient
      );
      setPositions(userPositions);
    } catch (error: any) {
      console.error("Error loading positions:", error);
      setError(error.message || "Failed to load positions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress && isConnected) {
      loadPositions();
    }
  }, [userAddress, chainId, isConnected]);

  // Helper untuk format fee tier
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

  // Helper untuk format liquidity
  const formatLiquidity = (liquidity: string) => {
    const bn = new BigNumber(liquidity);
    if (bn.gte(1e9)) {
      return bn.div(1e9).decimalPlaces(2).toString() + "B";
    } else if (bn.gte(1e6)) {
      return bn.div(1e6).decimalPlaces(2).toString() + "M";
    } else if (bn.gte(1e3)) {
      return bn.div(1e3).decimalPlaces(2).toString() + "K";
    }
    return bn.decimalPlaces(2).toString();
  };

  // Helper untuk shorten address
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get chain name
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

  // Get explorer URL
  const getExplorerUrl = (chainId: number, tokenId: string) => {
    const baseUrls = {
      1: "https://etherscan.io",
      56: "https://bscscan.com",
      137: "https://polygonscan.com",
      42161: "https://arbiscan.io",
      43114: "https://snowtrace.io",
    };

    const baseUrl = baseUrls[chainId as keyof typeof baseUrls];
    if (!baseUrl) return null;

    // Uniswap V3 Position Manager address (same across most chains)
    const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
    return `${baseUrl}/token/${positionManagerAddress}?a=${tokenId}`;
  };

  if (!isConnected) {
    return (
      <div className={`${className}`}>
        <div className="p-6 text-center border border-dashed border-muted-foreground/30 rounded-lg">
          <Icon
            name="mdi:wallet-outline"
            className="w-8 h-8 mx-auto mb-3 text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground mb-3">
            Hubungkan wallet untuk melihat liquidity positions Anda
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Liquidity Positions</h3>
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <Icon name="mdi:alert-circle" className="w-5 h-5" />
            <p className="font-medium">Error loading positions</p>
          </div>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPositions}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Icon name="mdi:refresh" className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="p-6 text-center border border-dashed border-muted-foreground/30 rounded-lg">
          <Icon
            name="mdi:pool-off"
            className="w-8 h-8 mx-auto mb-3 text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground mb-2">
            Anda belum memiliki liquidity position di {getChainName(chainId)}
          </p>
          <p className="text-xs text-muted-foreground">
            Buat position pertama Anda untuk mulai earning fees dari trading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Liquidity Positions</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getChainName(chainId)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {positions.length} Position{positions.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {positions.map((position) => (
          <div
            key={position.tokenId}
            className="p-4 border rounded-lg hover:bg-muted/20 transition-colors"
          >
            {/* Position Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="mdi:pool" className="w-5 h-5 text-blue-600" />
                <span className="font-medium">
                  Position #{position.tokenId}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {formatFeeTier(position.fee)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getExplorerUrl(chainId, position.tokenId) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getExplorerUrl(chainId, position.tokenId)!,
                        "_blank"
                      )
                    }
                  >
                    <Icon name="mdi:open-in-new" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Position Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Token Pair</div>
                <div className="font-mono">
                  {shortenAddress(position.token0)} /{" "}
                  {shortenAddress(position.token1)}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Liquidity</div>
                <div className="font-mono">
                  {formatLiquidity(position.liquidity)}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Price Range</div>
                <div className="text-xs font-mono">
                  {position.tickLower} → {position.tickUpper}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Unclaimed Fees</div>
                <div className="text-xs space-y-1">
                  {new BigNumber(position.tokensOwed0).gt(0) && (
                    <div className="font-mono">
                      Token0: {new BigNumber(position.tokensOwed0).toFixed(6)}
                    </div>
                  )}
                  {new BigNumber(position.tokensOwed1).gt(0) && (
                    <div className="font-mono">
                      Token1: {new BigNumber(position.tokensOwed1).toFixed(6)}
                    </div>
                  )}
                  {new BigNumber(position.tokensOwed0).eq(0) &&
                    new BigNumber(position.tokensOwed1).eq(0) && (
                      <div className="text-muted-foreground">
                        No unclaimed fees
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
              <Button variant="outline" size="sm" disabled>
                <Icon name="mdi:plus" className="w-4 h-4 mr-1" />
                Add Liquidity
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Icon name="mdi:minus" className="w-4 h-4 mr-1" />
                Remove
              </Button>
              {(new BigNumber(position.tokensOwed0).gt(0) ||
                new BigNumber(position.tokensOwed1).gt(0)) && (
                <Button variant="outline" size="sm" disabled>
                  <Icon name="mdi:cash" className="w-4 h-4 mr-1" />
                  Collect Fees
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={loadPositions}
          disabled={isLoading}
        >
          <Icon name="mdi:refresh" className="w-4 h-4 mr-2" />
          Refresh Positions
        </Button>
      </div>
    </div>
  );
}
