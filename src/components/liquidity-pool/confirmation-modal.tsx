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

interface ConfirmationModalProps {
  showConfirmModal: boolean;
  setShowConfirmModal: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  rangeType: string;
  minPrice: string;
  maxPrice: string;
  startingPrice: string;
  baseToken: string;
  bnbAmount: string;
  buAmount: string;
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
  tokenPrices?: {
    BNB: number;
    BU: number;
  };
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
  bnbAmount,
  buAmount,
  tokenAData = {
    symbol: "BNB",
    name: "Binance Coin",
    icon: "cryptocurrency-color:bnb",
  },
  tokenBData = {
    symbol: "BU",
    name: "Bakso Urat",
    icon: "mdi:food",
  },
  tokenPrices = { BNB: 625.34, BU: 0.0001375 },
  calculateUSDValue = (symbol: string, amount: string) => {
    // Default implementation menggunakan formatting yang sama
    const tokenAmount = parseFloat(amount);
    if (isNaN(tokenAmount) || tokenAmount === 0) return "US$0";

    const price = symbol === "BNB" ? 625.34 : 0.0001375;
    const usdValue = tokenAmount * price;

    // Smart formatting sesuai requirement user
    const formatSmartDecimal = (num: number): string => {
      if (num === 0) return "0";
      if (num < 0.01) {
        const str = num.toFixed(20);
        return str.replace(/\.?0+$/, "");
      } else {
        return num.toFixed(2);
      }
    };

    return `US$${formatSmartDecimal(usdValue)}`;
  },
  calculateTotalPoolValue = () => "US$0",
}: ConfirmationModalProps) {
  // Helper function untuk format USD tanpa pembulatan - sama seperti di modal-liquidity
  const formatUSDWithoutRounding = (value: number) => {
    if (value === 0) return "0.00";

    // Smart formatting sesuai requirement user
    const formatSmartDecimal = (num: number): string => {
      if (num === 0) return "0";

      // Rule: jika < 0.01 tampil utuh, jika >= 0.01 tampil 2 decimal places
      if (num < 0.01) {
        // Untuk angka kecil, tampil semua digit signifikan
        const str = num.toFixed(20);
        return str.replace(/\.?0+$/, "");
      } else {
        // Untuk angka >= 0.01, tampil 2 decimal places
        return num.toFixed(2);
      }
    };

    return formatSmartDecimal(value);
  };

  // Format rate untuk starting price display
  const formatRateWithoutRounding = (value: number) => {
    if (value === 0) return "0";

    // Rule: jika < 0.01 tampil utuh, jika >= 0.01 tampil 2 decimal places
    let result;
    if (value < 0.01) {
      // Untuk angka kecil, tampil semua digit signifikan
      const str = value.toFixed(20);
      result = str.replace(/\.?0+$/, "");
    } else {
      // Untuk angka >= 0.01, tampil 2 decimal places
      result = value.toFixed(2);
    }

    // Jika angka >= 1000, gunakan toLocaleString untuk formatting
    const numValue = parseFloat(result);
    if (numValue >= 1000) {
      return numValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return result;
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
                Membuat posisi
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground"
                >
                  <Icon name="mdi:help-circle" className="w-4 h-4 mr-2" />
                  Minta bantuan
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
                <span className="bg-muted px-2 py-1 rounded text-xs">v4</span>
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
                <div className="text-sm text-muted-foreground mb-1">Maks</div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "∞" : maxPrice} {tokenBData.symbol}/
                  {tokenAData.symbol}
                </div>
              </div>
            </div>

            {/* Starting Price */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Harga awal
              </div>
              <div className="font-mono text-lg">
                {(() => {
                  const rate = parseFloat(startingPrice);
                  if (isNaN(rate) || rate === 0) {
                    return baseToken === "BNB"
                      ? `0 ${tokenAData.symbol} = 1 ${tokenBData.symbol}`
                      : `0 ${tokenBData.symbol} = 1 ${tokenAData.symbol}`;
                  }

                  const formattedRate = formatRateWithoutRounding(rate);

                  // Format display berdasarkan baseToken - sama seperti di modal-liquidity
                  if (baseToken === "BNB") {
                    // BNB selected: input X BNB = 1 BU
                    return `${formattedRate} ${tokenAData.symbol} = 1 ${tokenBData.symbol}`;
                  } else {
                    // BU selected: input X BU = 1 BNB
                    return `${formattedRate} ${tokenBData.symbol} = 1 ${tokenAData.symbol}`;
                  }
                })()}
              </div>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const rate = parseFloat(startingPrice);
                  if (isNaN(rate) || rate === 0) return "US$0.00";

                  // Calculate USD price berdasarkan baseToken logic
                  let usdPrice;
                  if (baseToken === "BNB") {
                    // BNB selected: rate BNB = 1 BU → 1 BU = rate * BNB_price
                    usdPrice = rate * tokenPrices!.BNB;
                  } else {
                    // BU selected: rate BU = 1 BNB → 1 BNB = tokenPrices.BNB (tidak berubah)
                    usdPrice = tokenPrices!.BNB;
                  }

                  return `US$${formatUSDWithoutRounding(usdPrice)}`;
                })()}
              </div>
            </div>

            {/* Deposit Amounts */}
            <div>
              <div className="text-sm text-muted-foreground mb-3">
                Menyetorkan
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={tokenAData.icon} className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {bnbAmount || "0"} {tokenAData.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateUSDValue(tokenAData.symbol, bnbAmount || "0")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={tokenBData.icon} className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {buAmount || "0"} {tokenBData.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateUSDValue(tokenBData.symbol, buAmount || "0")}
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
                <span className="text-sm font-medium">Total Nilai Pool</span>
              </div>
              <span className="font-mono text-lg font-bold text-primary">
                {calculateTotalPoolValue()}
              </span>
            </div>

            {/* Network Fee */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Biaya jaringan
              </div>
              <div className="flex items-center gap-2">
                <Icon name="mdi:alert" className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">&lt;US$0,01</span>
              </div>
            </div>

            {/* Create Button */}
            <Button
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => {
                toast.success("Posisi berhasil dibuat!");
                setShowConfirmModal(false);
                // Don't need setOpen(false) here since main modal is already closed
              }}
            >
              Buat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
