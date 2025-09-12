import { Icon } from "@/components/icon";

interface TokenPairHeaderProps {
  tokenAIcon: string;
  tokenBIcon: string;
  tokenASymbol: string;
  tokenBSymbol: string;
}

export default function TokenPairHeader({
  tokenAIcon,
  tokenBIcon,
  tokenASymbol,
  tokenBSymbol,
}: TokenPairHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        {tokenAIcon ? (
          <Icon name={tokenAIcon} className="w-6 h-6" />
        ) : (
          <Icon
            name="mdi:help-circle-outline"
            className="w-6 h-6 text-muted-foreground"
          />
        )}
        {tokenBIcon ? (
          <Icon name={tokenBIcon} className="w-6 h-6" />
        ) : (
          <Icon
            name="mdi:help-circle-outline"
            className="w-6 h-6 text-muted-foreground"
          />
        )}
      </div>
      <span className="font-semibold text-lg">
        {tokenASymbol && tokenBSymbol
          ? `${tokenASymbol} / ${tokenBSymbol}`
          : "Select Token Pair"}
      </span>
      <div className="flex items-center gap-2">
        <span className="bg-muted px-2 py-1 rounded text-xs">v3</span>
        <span className="bg-muted px-2 py-1 rounded text-xs">0.3%</span>
      </div>
    </div>
  );
}
