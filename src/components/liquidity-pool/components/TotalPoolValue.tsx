import { Icon } from "@/components/icon";
import BigNumber from "bignumber.js";

interface TotalPoolValueProps {
  tokenAAmount: string;
  tokenBAmount: string;
  calculateTotalPoolValue: () => string;
}

export default function TotalPoolValue({
  tokenAAmount,
  tokenBAmount,
  calculateTotalPoolValue,
}: TotalPoolValueProps) {
  // Check if any amount is greater than 0
  const tokenAAmountBN = new BigNumber(tokenAAmount || 0);
  const tokenBAmountBN = new BigNumber(tokenBAmount || 0);
  const shouldShow = tokenAAmountBN.gt(0) || tokenBAmountBN.gt(0);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="pt-3 border-t border-muted">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="mdi:pool" className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Total Pool Value</span>
        </div>
        <span className="font-mono text-sm font-bold">
          {calculateTotalPoolValue()}
        </span>
      </div>
    </div>
  );
}
