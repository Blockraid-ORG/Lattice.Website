import { Icon } from "@/components/icon";
import BigNumber from "bignumber.js";
import TotalPoolValue from "./TotalPoolValue";

interface MarketPricesDisplayProps {
  tokenAIcon: string;
  tokenBIcon: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenPricesBN: Record<string, BigNumber>;
  displayProjectTokenPrice: BigNumber;
  formatUSDWithoutRounding: (value: BigNumber) => string;
  tokenAAmount: string;
  tokenBAmount: string;
  calculateTotalPoolValue: () => string;
}

export default function MarketPricesDisplay({
  tokenAIcon,
  tokenBIcon,
  tokenASymbol,
  tokenBSymbol,
  tokenPricesBN,
  displayProjectTokenPrice,
  formatUSDWithoutRounding,
  tokenAAmount,
  tokenBAmount,
  calculateTotalPoolValue,
}: MarketPricesDisplayProps) {
  return (
    <div className="p-3 bg-muted/20 rounded-lg">
      <div className="text-xs text-muted-foreground mb-2">
        Current Market Prices
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name={tokenAIcon} className="w-4 h-4" />
            <span>{tokenASymbol}</span>
          </div>
          <span className="font-mono">
            US$
            {formatUSDWithoutRounding(
              tokenPricesBN[tokenASymbol] || new BigNumber(0)
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name={tokenBIcon} className="w-4 h-4" />
            <span>{tokenBSymbol}</span>
          </div>
          <span className="font-mono">
            US$
            {formatUSDWithoutRounding(
              // Use calculated project price if available for project token
              !displayProjectTokenPrice.isZero() && tokenBSymbol
                ? displayProjectTokenPrice
                : (tokenBSymbol
                    ? tokenPricesBN[tokenBSymbol]
                    : new BigNumber(0)) || new BigNumber(0)
            )}
          </span>
        </div>
      </div>

      {/* Total Pool Value */}
      <TotalPoolValue
        tokenAAmount={tokenAAmount}
        tokenBAmount={tokenBAmount}
        calculateTotalPoolValue={calculateTotalPoolValue}
      />
    </div>
  );
}
