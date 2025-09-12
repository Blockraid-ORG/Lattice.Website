import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import BigNumber from "bignumber.js";

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
}: StartingPriceProps) {
  // Format number sesuai requirement user menggunakan BigNumber
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
      // Untuk angka < 1, tampilkan full precision (0.2315423423, 0.0000045)
      return valueBN.toFixed();
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Set Starting Price</h3>
      <p className="text-sm text-muted-foreground mb-4">
        When creating a new pool, you must set the initial exchange rate for
        both tokens. This will reflect the initial market price.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Starting Price
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={startingPrice}
              onChange={(e) => handleStartingPriceChange(e.target.value)}
              className={`flex-1 h-12 px-4 bg-background border rounded-lg text-lg font-mono ${(() => {
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
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  baseToken === "TokenA"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => {
                  setBaseToken("TokenA");
                }}
              >
                <Icon name={tokenAIcon} className="w-4 h-4" />
                <span>{tokenASymbol}</span>
              </button>
              <button
                type="button"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  baseToken === "TokenB"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => {
                  setBaseToken("TokenB");
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

                return `${formattedRate} ${tokenASymbol} = 1 ${tokenBSymbol} (US$${formatUSDWithoutRounding(
                  usdPrice
                )})`;
              } else {
                // TokenB selected: "rate TokenB = 1 TokenA"
                // Contoh: 181.818 BU = 1 BNB → 1 BNB = $865.24 (tokenA price)
                usdPrice = tokenAPrice;

                return `${formattedRate} ${tokenBSymbol} = 1 ${tokenASymbol} (US$${formatUSDWithoutRounding(
                  usdPrice
                )})`;
              }
            })()}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
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

                handleStartingPriceChange(marketRate.toFixed());
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
