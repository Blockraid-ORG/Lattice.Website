import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import BigNumber from "bignumber.js";
import { useState, useEffect, useRef } from "react";

interface StartingPriceProps {
  startingPrice: string;
  baseToken: string;
  tokenAIcon: string;
  tokenBIcon: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenPricesBN: Record<string, BigNumber>;
  handleStartingPriceChange: (value: string) => void;
  setBaseToken: (token: string) => void;
  formatUSDWithoutRounding: (value: BigNumber) => string;
  poolExists?: boolean;
  isCheckingPool?: boolean;
  poolAddress?: string | null;
}

export default function StartingPrice({
  startingPrice,
  baseToken,
  tokenAIcon,
  tokenBIcon,
  tokenASymbol,
  tokenBSymbol,
  tokenPricesBN,
  handleStartingPriceChange,
  setBaseToken,
  formatUSDWithoutRounding,
  poolExists = false,
  isCheckingPool = false,
  poolAddress = null,
}: StartingPriceProps) {
  // Local state untuk input value (formatted untuk display)
  const [displayValue, setDisplayValue] = useState(startingPrice);
  const isUserTypingRef = useRef(false);

  // Sync display value dengan startingPrice prop
  useEffect(() => {
    // Skip sync jika user sedang mengetik
    if (isUserTypingRef.current) {
      return;
    }

    if (poolExists || isCheckingPool) {
      // Format untuk display jika pool exists
      const valueBN = new BigNumber(startingPrice || 0);
      if (!valueBN.isZero() && !valueBN.isNaN()) {
        setDisplayValue(
          valueBN.decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed()
        );
      } else {
        setDisplayValue(startingPrice);
      }
    } else {
      // Untuk editable mode, sync jika value berubah dari luar (misalnya dari "Use market price" button)
      setDisplayValue(startingPrice);
    }
  }, [startingPrice, poolExists, isCheckingPool]);

  // Format number untuk display dengan maksimal 8 decimal places
  const formatPriceForDisplay = (value: number | BigNumber | string) => {
    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero() || valueBN.isNaN()) return "0";

    // Batasi ke maksimal 8 decimal places
    return valueBN.decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed();
  };

  // Format USD price dengan maksimal 8 decimal places
  const formatUSDPrice = (value: number | BigNumber) => {
    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero() || valueBN.isNaN()) return "0";

    // Batasi ke maksimal 8 decimal places
    return valueBN.decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed();
  };

  // Format number sesuai requirement user menggunakan BigNumber (untuk market price display)
  const formatRateWithoutRounding = (value: number | BigNumber) => {
    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero()) return "0";

    // Rule: untuk crypto precision berdasarkan requirement user
    if (valueBN.gte(1)) {
      // Untuk angka >= 1, batasi ke 2 decimal places (12.53, 1.32)
      if (valueBN.gte(1000)) {
        return valueBN.decimalPlaces(2).toFormat();
      } else {
        return valueBN.decimalPlaces(2).toFixed();
      }
    } else {
      // Untuk angka < 1, tampilkan maksimal 8 decimal places
      return valueBN.decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed();
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Set Starting Price</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {poolExists
          ? "Pool already exists. The current pool price is displayed below and cannot be modified."
          : "When creating a new pool, you must set the initial exchange rate for both tokens. This will reflect the initial market price."}
      </p>

      {/* Pool Exists Notice */}
      {poolExists && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon
              name="mdi:information"
              className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-500 mb-1">
                Pool Already Exists
              </p>
              <p className="text-xs text-muted-foreground">
                This token pair already has a liquidity pool. The price shown
                below is the current pool price and cannot be changed.
                {poolAddress && (
                  <span className="block mt-1 font-mono text-xs">
                    Pool: {poolAddress.slice(0, 6)}...{poolAddress.slice(-4)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isCheckingPool && (
        <div className="mb-4 p-3 bg-muted/20 border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="mdi:loading" className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Checking if pool exists...
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Starting Price
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                if (poolExists || isCheckingPool) return;

                // Mark bahwa user sedang mengetik
                isUserTypingRef.current = true;

                // Allow user to input, but clean invalid characters
                const inputValue = e.target.value;
                // Remove non-numeric characters except decimal point
                const cleaned = inputValue.replace(/[^0-9.]/g, "");

                // Update display value (formatted)
                setDisplayValue(cleaned);

                // Update parent state dengan value asli (full precision)
                // Ini memastikan payload ke API menggunakan value asli, tidak terpotong
                handleStartingPriceChange(cleaned);
              }}
              onBlur={(e) => {
                if (poolExists || isCheckingPool) return;

                // Mark bahwa user sudah selesai mengetik
                isUserTypingRef.current = false;

                // Format display value untuk tampilan (max 8 decimal places)
                const valueBN = new BigNumber(e.target.value || 0);
                if (!valueBN.isNaN() && !valueBN.isZero()) {
                  const formatted = valueBN
                    .decimalPlaces(8, BigNumber.ROUND_DOWN)
                    .toFixed();
                  setDisplayValue(formatted);
                  // PENTING: Jangan update parent state dengan value yang sudah diformat
                  // Biarkan parent state tetap menyimpan value asli (full precision)
                  // handleStartingPriceChange(formatted); // REMOVED - jangan potong value di state
                }
              }}
              onFocus={() => {
                // Reset flag saat focus (untuk memastikan sync bisa terjadi jika perlu)
                isUserTypingRef.current = false;
              }}
              disabled={poolExists || isCheckingPool}
              className={`flex-1 h-12 px-4 bg-background border rounded-lg text-lg font-mono ${
                poolExists || isCheckingPool
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              } ${(() => {
                const priceBN = new BigNumber(startingPrice || 0);
                return !startingPrice || priceBN.isZero() || priceBN.isNaN()
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-primary focus:ring-primary";
              })()}`}
              placeholder="0.00"
            />
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                disabled={poolExists || isCheckingPool}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  poolExists || isCheckingPool
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                } ${
                  baseToken === "TokenA"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => {
                  if (!poolExists && !isCheckingPool) {
                    setBaseToken("TokenA");
                  }
                }}
              >
                <Icon name={tokenAIcon} className="w-4 h-4" />
                <span>{tokenASymbol}</span>
              </button>
              <button
                type="button"
                disabled={poolExists || isCheckingPool}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  poolExists || isCheckingPool
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                } ${
                  baseToken === "TokenB"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => {
                  if (!poolExists && !isCheckingPool) {
                    setBaseToken("TokenB");
                  }
                }}
              >
                <Icon name={tokenBIcon} className="w-4 h-4" />
                <span>{tokenBSymbol}</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {baseToken === "TokenA"
              ? `Price expressed as: X ${tokenASymbol} = 1 ${tokenBSymbol}`
              : `Price expressed as: X ${tokenBSymbol} = 1 ${tokenASymbol}`}
          </p>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-sm">
            Market price:{" "}
            {(() => {
              const rate = new BigNumber(startingPrice || 0);
              if (rate.isNaN() || rate.isZero()) {
                return baseToken === "TokenA"
                  ? `0 ${tokenASymbol} = 1 ${tokenBSymbol} (US$0)`
                  : `0 ${tokenBSymbol} = 1 ${tokenASymbol} (US$0)`;
              }

              const formattedRate = formatRateWithoutRounding(rate);

              // Calculate USD price berdasarkan baseToken
              const tokenAPrice =
                tokenPricesBN[tokenASymbol] || new BigNumber(0);
              let usdPrice;

              if (baseToken === "TokenA") {
                // TokenA selected: "rate TokenA = 1 TokenB"
                // Contoh: 0.0055 BNB = 1 BU → 1 BU = 0.0055 × $865.24 = $4.75
                usdPrice = rate.multipliedBy(tokenAPrice);

                return `${formattedRate} ${tokenASymbol} = 1 ${tokenBSymbol} (US$${formatUSDPrice(
                  usdPrice
                )})`;
              } else {
                // TokenB selected: "rate TokenB = 1 TokenA"
                // Contoh: 181.818 BU = 1 BNB → 1 BNB = $865.24 (tokenA price)
                usdPrice = tokenAPrice;

                return `${formattedRate} ${tokenBSymbol} = 1 ${tokenASymbol} (US$${formatUSDPrice(
                  usdPrice
                )})`;
              }
            })()}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={poolExists || isCheckingPool}
            onClick={() => {
              if (poolExists || isCheckingPool) return;

              // Calculate market price berdasarkan baseToken
              const tokenAPrice =
                (tokenASymbol
                  ? tokenPricesBN[tokenASymbol]
                  : new BigNumber(0)) || new BigNumber(0);
              const tokenBPrice =
                (tokenBSymbol
                  ? tokenPricesBN[tokenBSymbol]
                  : new BigNumber(0)) || new BigNumber(0);

              if (!tokenAPrice.isZero() && !tokenBPrice.isZero()) {
                let marketRate;
                if (baseToken === "TokenA") {
                  // TokenA selected: rate = price_TokenB / price_TokenA
                  // Contoh: BU = $0.0001375, BNB = $865.24 → rate = $0.0001375 / $865.24
                  marketRate = tokenBPrice.dividedBy(tokenAPrice);
                } else {
                  // TokenB selected: rate = price_TokenA / price_TokenB
                  // Contoh: BNB = $865.24, BU = $0.0001375 → rate = $865.24 / $0.0001375
                  marketRate = tokenAPrice.dividedBy(tokenBPrice);
                }

                // PENTING: Gunakan toString() untuk mempertahankan full precision
                handleStartingPriceChange(marketRate.toString());
                // Market price button logging removed to prevent infinite loops
              }
            }}
          >
            Use market price
          </Button>
        </div>
      </div>
    </div>
  );
}
