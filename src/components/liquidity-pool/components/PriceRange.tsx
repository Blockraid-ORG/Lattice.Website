import { Button } from "@/components/ui/button";

interface PriceRangeProps {
  rangeType: string;
  setRangeType: (type: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  tokenASymbol: string;
  tokenBSymbol: string;
}

export default function PriceRange({
  rangeType,
  setRangeType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  tokenASymbol,
  tokenBSymbol,
}: PriceRangeProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Set Price Range</h3>

      <div className="flex gap-2 mb-4">
        <Button
          variant={rangeType === "full" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setRangeType("full")}
        >
          Full Range
        </Button>
        <Button
          variant={rangeType === "custom" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setRangeType("custom")}
        >
          Custom Range
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Full range liquidity provision during pool creation ensures continuous
        market participation across all possible prices. The process is simpler,
        but potential impermanent loss is higher.
      </p>

      {rangeType === "custom" && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <label className="text-sm text-muted-foreground mb-2 block">
              Minimum Price
            </label>
            <input
              type="text"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-12 px-4 bg-background border-0 rounded-lg text-xl font-mono mb-2 focus:outline-none"
              placeholder="0"
            />
            <div className="text-sm text-muted-foreground">
              {tokenBSymbol} = 1 {tokenASymbol}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <label className="text-sm text-muted-foreground mb-2 block">
              Maximum Price
            </label>
            <input
              type="text"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-12 px-4 bg-background border-0 rounded-lg text-xl font-mono mb-2 focus:outline-none"
              placeholder="∞"
            />
            <div className="text-sm text-muted-foreground">
              {tokenBSymbol} = 1 {tokenASymbol}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
