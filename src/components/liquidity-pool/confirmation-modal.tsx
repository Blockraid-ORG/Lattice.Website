"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import BigNumber from "bignumber.js";
import { useState, useEffect } from "react";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useUniswapIntegration } from "@/hooks/useUniswapIntegration";

interface ConfirmationModalProps {
  showConfirmModal: boolean;
  setShowConfirmModal: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  rangeType: string;
  minPrice: string;
  maxPrice: string;
  startingPrice: string;
  baseToken: string;
  tokenAAmount: string;
  tokenBAmount: string;
  tokenAData?: {
    symbol: string;
    name: string;
    icon: string;
    address?: string; // Add address for Uniswap
  };
  tokenBData?: {
    symbol: string;
    name: string;
    icon: string;
    address?: string; // Add address for Uniswap
  };
  tokenPrices?: { [key: string]: number };
  calculateUSDValue?: (symbol: string, amount: string) => string;
  calculateTotalPoolValue?: () => string;
  // New props for Uniswap integration
  feeTier?: string; // "0.05", "0.3", "1"
  chainId?: number;
  userAddress?: string;
}

export function ConfirmationModal({
  showConfirmModal,
  setShowConfirmModal,
  setOpen,
  rangeType,
  minPrice,
  maxPrice,
  startingPrice,
  baseToken,
  tokenAAmount,
  tokenBAmount,
  tokenAData = {
    symbol: "BNB",
    name: "Binance Coin",
    icon: "cryptocurrency-color:bnb",
  },
  tokenBData = {
    symbol: "BU",
    name: "Bakso Urat",
    icon: "mdi:coin",
  },
  tokenPrices = { BNB: 625.34, BU: 0.0001375 },
  calculateUSDValue = (symbol: string, amount: string) => {
    const tokenAmount = new BigNumber(amount || 0);
    if (tokenAmount.isZero()) return "US$0";

    const price = new BigNumber(tokenPrices?.[symbol] || 0);
    const usdValue = tokenAmount.multipliedBy(price);

    return `US$${formatUSDWithoutRounding(usdValue)}`;
  },
  calculateTotalPoolValue = () => "US$0",
  // New props with defaults
  feeTier = "0.3",
  chainId = 56, // Default to BSC
  userAddress,
}: ConfirmationModalProps) {
  // Hooks
  const [isCreatingPosition, setIsCreatingPosition] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [nftTokenId, setNftTokenId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { connect, isConnected } = useWeb3AuthConnect();
  const {
    checkPoolExists,
    createPool,
    addLiquidity,
    poolExists,
    poolAddress,
    isLoading,
    isChecking,
    isCreating,
    error,
    clearError,
  } = useUniswapIntegration();

  // Debug log
  console.log("🎯 ConfirmationModal received data:", {
    tokenAData: {
      ...tokenAData,
      isNative_received: (tokenAData as any)?.isNative,
      isNative_type: typeof (tokenAData as any)?.isNative,
    },
    tokenBData,
    tokenAAmount,
    tokenBAmount,
    feeTier,
    chainId,
    userAddress,
  });

  // CRITICAL DEBUG: Show exact props received
  console.log("🚨 CRITICAL DEBUG - Exact props:", {
    tokenAData_full: tokenAData,
    tokenAData_keys: Object.keys(tokenAData || {}),
    tokenAData_hasIsNative: "isNative" in (tokenAData || {}),
    tokenAData_isNative_value: (tokenAData as any)?.isNative,
    showConfirmModal,
  });

  // Debug: Track prop changes to see where data gets lost
  useEffect(() => {
    console.log("🔍 ConfirmationModal props changed:", {
      showConfirmModal,
      tokenAData: {
        fullObject: tokenAData,
        objectKeys: Object.keys(tokenAData || {}),
        isEmpty: Object.keys(tokenAData || {}).length === 0,
        hasAddress: !!tokenAData?.address,
        isNative: !!(tokenAData as any)?.isNative,
      },
      tokenBData: {
        fullObject: tokenBData,
        hasAddress: !!tokenBData?.address,
        isNative: !!(tokenBData as any)?.isNative,
      },
      triggerSource: "useEffect",
    });
  }, [showConfirmModal, tokenAData, tokenBData]);

  // Validasi data yang diperlukan
  useEffect(() => {
    if (showConfirmModal) {
      console.log("📋 Detailed Validation check:");
      console.log("  - userAddress:", userAddress);
      console.log("  - chainId:", chainId);
      console.log("  - isConnected:", isConnected);
      console.log("  - tokenAData:", {
        symbol: tokenAData?.symbol,
        name: tokenAData?.name,
        address: tokenAData?.address,
        isNative: (tokenAData as any)?.isNative,
        icon: tokenAData?.icon,
      });
      console.log("  - tokenBData:", {
        symbol: tokenBData?.symbol,
        name: tokenBData?.name,
        address: tokenBData?.address,
        isNative: (tokenBData as any)?.isNative,
        icon: tokenBData?.icon,
      });
    }
  }, [
    showConfirmModal,
    userAddress,
    chainId,
    tokenAData,
    tokenBData,
    isConnected,
  ]);

  // Handler untuk create position
  const handleCreatePosition = async () => {
    if (!isConnected) {
      toast.error(
        "Wallet tidak terhubung. Silakan hubungkan wallet terlebih dahulu."
      );
      return;
    }

    // Try to get user address directly if not available
    let finalUserAddress = userAddress;
    if (!finalUserAddress) {
      try {
        console.log("🔄 Trying to get user address directly from wallet...");
        const walletClient = await connect();
        if (walletClient) {
          const result = await walletClient.request({ method: "eth_accounts" });
          const accounts = Array.isArray(result) ? (result as string[]) : [];
          if (accounts.length > 0) {
            finalUserAddress = accounts[0];
            console.log("✅ Retrieved user address:", finalUserAddress);
          }
        }
      } catch (error) {
        console.error("Failed to get user address directly:", error);
      }
    }

    if (!finalUserAddress) {
      toast.error(
        "User address tidak tersedia. Silakan hubungkan ulang wallet Anda."
      );
      return;
    }

    // ROBUST VALIDATION: Native tokens (no address) OR Contract tokens (has address) are both valid
    const tokenAValid =
      !!tokenAData?.address || !!(tokenAData as any)?.isNative;
    const tokenBValid =
      !!tokenBData?.address || !!(tokenBData as any)?.isNative;

    // Additional validation: Token harus punya symbol minimal
    const tokenAHasSymbol = !!tokenAData?.symbol;
    const tokenBHasSymbol = !!tokenBData?.symbol;

    const tokenAFinalValid = tokenAValid && tokenAHasSymbol;
    const tokenBFinalValid = tokenBValid && tokenBHasSymbol;

    console.log("🔍 ROBUST Pre-validation state:", {
      tokenAData: tokenAData,
      tokenBData: tokenBData,
      basicValidation: {
        tokenAValid,
        tokenBValid,
        tokenAHasSymbol,
        tokenBHasSymbol,
      },
      finalValidation: {
        tokenAFinalValid,
        tokenBFinalValid,
      },
      conditions: {
        tokenA_hasAddress: !!tokenAData?.address,
        tokenA_isNative: !!(tokenAData as any)?.isNative,
        tokenA_hasSymbol: !!tokenAData?.symbol,
        tokenB_hasAddress: !!tokenBData?.address,
        tokenB_isNative: !!(tokenBData as any)?.isNative,
        tokenB_hasSymbol: !!tokenBData?.symbol,
      },
      logic: {
        tokenA: `(${!!tokenAData?.address} || ${!!(tokenAData as any)
          ?.isNative}) && ${!!tokenAData?.symbol} = ${tokenAFinalValid}`,
        tokenB: `(${!!tokenBData?.address} || ${!!(tokenBData as any)
          ?.isNative}) && ${!!tokenBData?.symbol} = ${tokenBFinalValid}`,
      },
    });

    if (!tokenAFinalValid || !tokenBFinalValid) {
      console.error("❌ ROBUST Token validation failed:", {
        tokenAData: {
          symbol: tokenAData?.symbol,
          address: tokenAData?.address,
          isNative: (tokenAData as any)?.isNative,
        },
        tokenBData: {
          symbol: tokenBData?.symbol,
          address: tokenBData?.address,
          isNative: (tokenBData as any)?.isNative,
        },
        validation: {
          tokenAFinalValid,
          tokenBFinalValid,
          reasons: {
            tokenA_missing: !tokenAValid
              ? "No address and not native"
              : !tokenAHasSymbol
              ? "No symbol"
              : "OK",
            tokenB_missing: !tokenBValid
              ? "No address and not native"
              : !tokenBHasSymbol
              ? "No symbol"
              : "OK",
          },
        },
      });
      toast.error("Token data tidak lengkap atau tidak valid");
      return;
    }

    setIsCreatingPosition(true);
    clearError();

    try {
      // Connect wallet to get provider
      const walletClient = await connect();
      if (!walletClient) {
        throw new Error("Failed to connect wallet");
      }

      // Helper function to resolve token addresses (handle native tokens)
      const getTokenAddress = (tokenData: any, chainId: number) => {
        if (tokenData.isNative) {
          // Return wrapped native token address based on chain
          const WETH_ADDRESSES = {
            1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
            56: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB on BSC
            137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
            42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
            43114: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX on Avalanche
          };
          return (
            WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES] ||
            tokenData.address
          );
        }
        return tokenData.address;
      };

      const tokenAAddress = getTokenAddress(tokenAData, chainId);
      const tokenBAddress = getTokenAddress(tokenBData, chainId);

      console.log("🔧 Token address resolution:", {
        tokenA: {
          original: tokenAData,
          resolved: tokenAAddress,
          isNative: (tokenAData as any).isNative,
        },
        tokenB: {
          original: tokenBData,
          resolved: tokenBAddress,
          isNative: (tokenBData as any).isNative,
        },
        chainId,
      });

      // Step 1: Check if pool exists
      toast.info("Mengecek apakah pool sudah ada...");
      const existingPool = await checkPoolExists(
        tokenAAddress,
        tokenBAddress,
        feeTier,
        chainId
      );

      let poolAddr = existingPool;

      // Step 2: Create pool if it doesn't exist
      if (!existingPool) {
        toast.info("Pool belum ada, membuat pool baru...");
        // Use resolved addresses for pool creation too
        poolAddr = await createPool(
          tokenAAddress,
          tokenBAddress,
          feeTier,
          startingPrice || "1",
          chainId,
          walletClient
        );

        if (!poolAddr) {
          throw new Error("Failed to create pool");
        }
      }

      // Step 3: Add liquidity
      toast.info("Menambahkan liquidity ke pool...");

      const liquidityInput = {
        tokenAAddress,
        tokenBAddress,
        tokenASymbol: tokenAData.symbol,
        tokenBSymbol: tokenBData.symbol,
        tokenAAmount,
        tokenBAmount,
        feeTier,
        startingPrice,
        chainId,
        userAddress: finalUserAddress,
        slippageTolerance: 0.01, // 1% default
      };

      const result = await addLiquidity(liquidityInput, walletClient);

      if (result) {
        setTransactionHash(result.transactionHash);
        setNftTokenId(result.tokenId);
        setShowSuccess(true);

        toast.success("Position berhasil dibuat!", {
          description: `Transaction Hash: ${result.transactionHash}`,
          action: {
            label: "Lihat di Explorer",
            onClick: () => {
              // TODO: Add explorer link based on chainId
              window.open(
                `https://bscscan.com/tx/${result.transactionHash}`,
                "_blank"
              );
            },
          },
        });

        // Close modals after success
        setTimeout(() => {
          setShowConfirmModal(false);
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error creating position:", error);
      toast.error(`Gagal membuat position: ${error.message}`);
    } finally {
      setIsCreatingPosition(false);
    }
  };

  // Helper function untuk format USD tanpa pembulatan menggunakan BigNumber
  const formatUSDWithoutRounding = (value: number | BigNumber | undefined) => {
    // Handle undefined, null values
    if (value == null) return "0";

    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero() || valueBN.isNaN()) return "0";

    // Smart formatting untuk dunia crypto sesuai requirement user
    if (valueBN.gte(1)) {
      // Untuk angka >= 1, batasi ke 2 decimal places
      return valueBN.decimalPlaces(2).toFixed();
    } else {
      // Untuk angka < 1, tampilkan full precision
      return valueBN.toFixed();
    }
  };

  // Format rate untuk starting price display menggunakan BigNumber
  const formatRateWithoutRounding = (value: number | BigNumber | undefined) => {
    // Handle undefined, null values
    if (value == null) return "0";

    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero() || valueBN.isNaN()) return "0";

    // Rule: untuk crypto precision berdasarkan requirement user
    if (valueBN.gte(1)) {
      // Untuk angka >= 1, batasi ke 2 decimal places (12.53, 1.32)
      if (valueBN.gte(1000)) {
        return valueBN.decimalPlaces(2).toFormat();
      } else {
        return valueBN.decimalPlaces(2).toFixed();
      }
    } else {
      // Untuk angka < 1, tampilkan full precision (0.2315423423, 0.0000045)
      return valueBN.toFixed();
    }
  };

  return (
    <Dialog
      open={showConfirmModal}
      onOpenChange={(open) => {
        setShowConfirmModal(open);
        if (!open) {
          setOpen(true); // Reopen main modal when closing confirmation
        }
      }}
    >
      <DialogContent className="max-w-md w-full p-2">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Create Position
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground"
                >
                  <Icon name="mdi:help-circle" className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Pair Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Icon name={tokenAData.icon} className="w-6 h-6" />
                  <Icon name={tokenBData.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">
                    {tokenAData.symbol} / {tokenBData.symbol}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded text-xs">v3</span>
                <span className="bg-muted px-2 py-1 rounded text-xs">0.3%</span>
              </div>
            </div>

            {/* Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Minimum
                </div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "0" : minPrice} {tokenBData.symbol}/
                  {tokenAData.symbol}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Maximum
                </div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "∞" : maxPrice} {tokenBData.symbol}/
                  {tokenAData.symbol}
                </div>
              </div>
            </div>

            {/* Starting Price */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Starting Price
              </div>
              <div className="font-mono text-lg">
                {(() => {
                  const rate = parseFloat(startingPrice);
                  if (isNaN(rate) || rate === 0) {
                    return baseToken === "TokenA"
                      ? `0 ${tokenAData.symbol} = 1 ${tokenBData.symbol}`
                      : `0 ${tokenBData.symbol} = 1 ${tokenAData.symbol}`;
                  }

                  const formattedRate = formatRateWithoutRounding(rate);

                  // Format display berdasarkan baseToken - sama seperti di modal-liquidity
                  if (baseToken === "TokenA") {
                    // TokenA selected: input X TokenA = 1 TokenB
                    return `${formattedRate} ${tokenAData.symbol} = 1 ${tokenBData.symbol}`;
                  } else {
                    // TokenB selected: input X TokenB = 1 TokenA
                    return `${formattedRate} ${tokenBData.symbol} = 1 ${tokenAData.symbol}`;
                  }
                })()}
              </div>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const rate = parseFloat(startingPrice);
                  if (isNaN(rate) || rate === 0) return "US$0.00";

                  // Calculate USD price berdasarkan baseToken logic menggunakan BigNumber
                  let usdPrice = new BigNumber(0);

                  // Safely get TokenA price with fallback
                  const tokenAPrice = new BigNumber(
                    tokenPrices?.[tokenAData.symbol] || 0
                  );
                  const rateBN = new BigNumber(rate);

                  if (baseToken === "TokenA") {
                    // TokenA selected: rate TokenA = 1 TokenB → 1 TokenB = rate * TokenA_price
                    usdPrice = rateBN.multipliedBy(tokenAPrice);
                  } else {
                    // TokenB selected: rate TokenB = 1 TokenA → 1 TokenA = tokenPrices.TokenA (tidak berubah)
                    usdPrice = tokenAPrice;
                  }

                  return `US$${formatUSDWithoutRounding(usdPrice)}`;
                })()}
              </div>
            </div>

            {/* Deposit Amounts */}
            <div>
              <div className="text-sm text-muted-foreground mb-3">
                Depositing
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={tokenAData.icon} className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {tokenAAmount || "0"} {tokenAData.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateUSDValue(
                          tokenAData.symbol,
                          tokenAAmount || "0"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={tokenBData.icon} className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {tokenBAmount || "0"} {tokenBData.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateUSDValue(
                          tokenBData.symbol,
                          tokenBAmount || "0"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Pool Value */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="mdi:pool" className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Total Pool Value</span>
              </div>
              <span className="font-mono text-lg font-bold text-primary">
                {calculateTotalPoolValue()}
              </span>
            </div>

            {/* Network Fee */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Network Fee</div>
              <div className="flex items-center gap-2">
                <Icon name="mdi:alert" className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">&lt;US$0,01</span>
              </div>
            </div>

            {/* Status Messages */}
            {/* {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <Icon name="mdi:alert-circle" className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )} */}

            {error &&
              (() => {
                console.log("error", error);
                return null;
              })()}

            {showSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Icon name="mdi:check-circle" className="w-4 h-4" />
                  <span className="text-sm">Position berhasil dibuat!</span>
                </div>
                {transactionHash && (
                  <div className="mt-2 text-xs text-green-600 font-mono">
                    TX: {transactionHash.slice(0, 20)}...
                  </div>
                )}
                {nftTokenId && (
                  <div className="text-xs text-green-600">
                    NFT Token ID: {nftTokenId}
                  </div>
                )}
              </div>
            )}

            {/* Create Button */}
            <Button
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreatePosition}
              disabled={
                isCreatingPosition ||
                isLoading ||
                isChecking ||
                isCreating ||
                !isConnected
              }
            >
              {isCreatingPosition || isLoading ? (
                <>
                  <Icon
                    name="mdi:loading"
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                  {isChecking && "Mengecek Pool..."}
                  {isCreating && "Membuat Pool..."}
                  {(isCreatingPosition || isLoading) &&
                    !isChecking &&
                    !isCreating &&
                    "Membuat Position..."}
                </>
              ) : !isConnected ? (
                <>
                  <Icon name="mdi:wallet" className="w-4 h-4 mr-2" />
                  Hubungkan Wallet
                </>
              ) : (
                <>
                  <Icon name="mdi:plus" className="w-4 h-4 mr-2" />
                  Create Position
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
