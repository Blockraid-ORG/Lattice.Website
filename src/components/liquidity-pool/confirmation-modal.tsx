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
  };
  tokenBData?: {
    symbol: string;
    name: string;
    icon: string;
  };
  tokenPrices?: { [key: string]: number };
  calculateUSDValue?: (symbol: string, amount: string) => string;
  calculateTotalPoolValue?: () => string;
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
    icon: "mdi:coin", // Ubah dari mdi:food ke mdi:coin agar konsisten
  },
  tokenPrices = { BNB: 625.34, BU: 0.0001375 },
  calculateUSDValue = (symbol: string, amount: string) => {
    // Default implementation menggunakan BigNumber untuk precision
    const tokenAmount = new BigNumber(amount || 0);
    if (tokenAmount.isZero()) return "US$0";

    // Use real-time token prices from CoinGecko
    const price = new BigNumber(tokenPrices?.[symbol] || 0);
    const usdValue = tokenAmount.multipliedBy(price);

    return `US$${formatUSDWithoutRounding(usdValue)}`;
  },
  calculateTotalPoolValue = () => "US$0",
}: ConfirmationModalProps) {
  // Debug log untuk memastikan data yang benar diterima
  console.log("🎯 ConfirmationModal received data:", {
    tokenAData,
    tokenBData,
    tokenAAmount,
    tokenBAmount,
  });

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

            {/* Create Button */}
            <Button
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => {
                toast.success("Position successfully created!");
                setShowConfirmModal(false);
                // Don't need setOpen(false) here since main modal is already closed
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
