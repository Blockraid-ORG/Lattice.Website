interface FeeTierSelectionProps {
  selectedFeeTier: string;
  feeTiers: Array<{
    value: string;
    label: string;
    description?: string;
    recommended?: boolean;
  }>;
}

export default function FeeTierSelection({
  selectedFeeTier,
  feeTiers,
}: FeeTierSelectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Fee Tier</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Amount earned from providing liquidity. Choose a fee tier that matches
        your risk tolerance and strategy.
      </p>

      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">
              Fee Tier{" "}
              {feeTiers.find((t) => t.value === selectedFeeTier)?.label}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              % you&apos;ll earn in fees
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
