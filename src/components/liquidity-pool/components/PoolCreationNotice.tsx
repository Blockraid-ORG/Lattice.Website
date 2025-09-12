import { Icon } from "@/components/icon";

export default function PoolCreationNotice() {
  return (
    <div className="p-4 border rounded-lg bg-muted/20 mb-6">
      <div className="flex items-start gap-3">
        <Icon name="mdi:information" className="text-muted-foreground mt-0.5" />
        <div>
          <h3 className="font-medium mb-2">Creating new pool</h3>
          <p className="text-sm text-muted-foreground">
            Your selection will create a new liquidity pool, which may result in
            lower initial liquidity and increased volatility. Consider adding
            liquidity to an existing pool to minimize this risk.
          </p>
        </div>
      </div>
    </div>
  );
}
