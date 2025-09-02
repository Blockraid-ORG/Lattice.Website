"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
// Card components inline since UI card not available
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
// Badge component inline since UI badge not available
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      variant === "secondary"
        ? "bg-gray-100 text-gray-700"
        : "bg-blue-100 text-blue-700"
    } ${className}`}
  >
    {children}
  </span>
);
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useUniswapV3SDK } from "@/hooks/useUniswapV3SDK";
import type { EnhancedPositionInfo } from "@/types/uniswap";

interface PositionDisplayProps {
  userAddress?: string;
  chainId?: number;
  className?: string;
}

export function PositionDisplay({
  userAddress,
  chainId = 56,
  className = "",
}: PositionDisplayProps) {
  const [positions, setPositions] = useState<EnhancedPositionInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [collectingFees, setCollectingFees] = useState<number | null>(null);

  const { isConnected } = useWeb3AuthConnect();
  const {
    fetchEnhancedPositions,
    collectFees,
    isLoading,
    error,
    isReady,
    clearError,
  } = useUniswapV3SDK(chainId);

  // Load positions when component mounts
  useEffect(() => {
    const loadPositions = async () => {
      if (!isConnected || !userAddress || !isReady) {
        setPositions([]);
        return;
      }

      try {
        clearError();
        const userPositions = await fetchEnhancedPositions(userAddress);
        setPositions(userPositions);
      } catch (error) {
        "Error loading positions:", error;
        toast.error("Failed to load positions");
      }
    };

    loadPositions();
  }, [
    isConnected,
    userAddress,
    chainId,
    isReady,
    fetchEnhancedPositions,
    clearError,
  ]);

  // Refresh positions
  const handleRefresh = async () => {
    if (!isConnected || !userAddress || !isReady) return;

    setRefreshing(true);
    try {
      clearError();
      const userPositions = await fetchEnhancedPositions(userAddress);
      setPositions(userPositions);
      toast.success("Positions refreshed");
    } catch (error) {
      toast.error("Failed to refresh positions");
    } finally {
      setRefreshing(false);
    }
  };

  // Collect fees from position
  const handleCollectFees = async (tokenId: number) => {
    if (!userAddress) return;

    setCollectingFees(tokenId);
    try {
      const result = await collectFees({
        tokenId,
        recipient: userAddress,
      });

      toast.success("Fees collected successfully!", {
        description: `Transaction: ${result.hash}`,
      });

      // Refresh positions after collecting fees
      setTimeout(() => {
        handleRefresh();
      }, 2000);
    } catch (error) {
      "Error collecting fees:", error;
      toast.error("Failed to collect fees");
    } finally {
      setCollectingFees(null);
    }
  };

  // Format currency amount for display
  const formatAmount = (amount: any): string => {
    if (!amount) return "0";

    try {
      const value = parseFloat(
        amount.toFixed ? amount.toFixed() : amount.toString()
      );
      if (value > 1000) {
        return `${(value / 1000).toFixed(2)}K`;
      } else if (value > 1) {
        return value.toFixed(4);
      } else {
        return value.toFixed(8);
      }
    } catch {
      return "0";
    }
  };

  // Calculate total values
  const totalStats = useMemo(() => {
    if (positions.length === 0) {
      return {
        totalPositions: 0,
        activePositions: 0,
      };
    }

    return {
      totalPositions: positions.length,
      activePositions: positions.length, // Simplified - all positions considered active
    };
  }, [positions]);

  // Get position status based on current price vs range
  const getPositionStatus = (
    position: EnhancedPositionInfo
  ): "In Range" | "Out of Range" => {
    // Simplified status check - in real implementation, compare current tick with tickLower/tickUpper
    return "In Range"; // Placeholder
  };

  if (!isConnected) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6 text-center">
            <Icon
              name="mdi:wallet"
              className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
            />
            <h3 className="font-medium mb-2">Connect Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to view your liquidity positions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6 text-center">
            <Icon
              name="mdi:loading"
              className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin"
            />
            <h3 className="font-medium mb-2">Initializing SDK</h3>
            <p className="text-sm text-muted-foreground">
              Setting up Uniswap V3 integration...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-xl font-bold">{totalStats.totalPositions}</p>
              </div>
              <Icon name="mdi:pool" className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Positions
                </p>
                <p className="text-xl font-bold">
                  {totalStats.activePositions}
                </p>
              </div>
              <Icon name="mdi:trending-up" className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chain</p>
                <p className="text-xl font-bold">{chainId}</p>
              </div>
              <Icon name="mdi:link" className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Positions</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          <Icon
            name="mdi:refresh"
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <Icon
              name="mdi:alert-circle"
              className="w-12 h-12 mx-auto mb-4 text-red-500"
            />
            <h3 className="font-medium mb-2">Error Loading Positions</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Positions */}
      {!isLoading && !error && positions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Icon
              name="mdi:pool-off"
              className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
            />
            <h3 className="font-medium mb-2">No Positions Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have any liquidity positions yet on chain {chainId}
            </p>
            <p className="text-xs text-muted-foreground">
              Create your first position using the "Add Liquidity" button
            </p>
          </CardContent>
        </Card>
      )}

      {/* Positions List */}
      {!isLoading && positions.length > 0 && (
        <div className="space-y-4">
          {positions.map((position) => {
            const status = getPositionStatus(position);

            return (
              <Card key={position.tokenId} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Icon
                          name="mdi:coin"
                          className="w-8 h-8 text-blue-500"
                        />
                        <Icon
                          name="mdi:coin"
                          className="w-8 h-8 -ml-2 text-green-500"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {position.token0Instance.symbol} /{" "}
                          {position.token1Instance.symbol}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            NFT #{position.tokenId}
                          </Badge>
                          <Badge
                            variant={
                              status === "In Range" ? "default" : "secondary"
                            }
                            className={
                              status === "In Range"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {formatAmount(position.liquidity)} liquidity
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Liquidity
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {position.token0Instance.symbol} Amount
                      </p>
                      <p className="font-medium">
                        {formatAmount(position.amount0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {position.token1Instance.symbol} Amount
                      </p>
                      <p className="font-medium">
                        {formatAmount(position.amount1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pool Fee</p>
                      <p className="font-medium">
                        {(position.fee / 10000).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Icon
                                name="mdi:information-outline"
                                className="w-4 h-4"
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm max-w-xs">
                              <p>Position ID: {position.tokenId}</p>
                              <p>
                                Pool:{" "}
                                {position.token0Instance.address.slice(0, 6)}
                                .../
                                {position.token1Instance.address.slice(0, 6)}
                                ...
                              </p>
                              <p>Liquidity: {position.liquidity}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={collectingFees === position.tokenId}
                          >
                            {collectingFees === position.tokenId ? (
                              <Icon
                                name="mdi:loading"
                                className="w-4 h-4 mr-2 animate-spin"
                              />
                            ) : (
                              <Icon name="mdi:coins" className="w-4 h-4 mr-2" />
                            )}
                            Collect Fees
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Collect Fees</AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to collect accumulated fees from
                              your {position.token0Instance.symbol}/
                              {position.token1Instance.symbol} position (NFT #
                              {position.tokenId}). This action will collect all
                              available fees to your wallet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleCollectFees(position.tokenId)
                              }
                              disabled={collectingFees === position.tokenId}
                            >
                              Collect Fees
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button variant="outline" size="sm">
                        <Icon name="mdi:cog" className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
