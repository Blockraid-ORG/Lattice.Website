import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

interface BalanceStatusDisplayProps {
  balancesLoading: boolean;
  balancesError: string | null;
  balancesInitialized: boolean;
  refetchBalances: () => void;
  setShowTokenHelper: (show: boolean) => void;
}

export default function BalanceStatusDisplay({
  balancesLoading,
  balancesError,
  balancesInitialized,
  refetchBalances,
  setShowTokenHelper,
}: BalanceStatusDisplayProps) {
  // Only show if there's a status to display
  if (!balancesLoading && !balancesError && balancesInitialized) {
    return null;
  }

  return (
    <div className="p-3 bg-muted/20 rounded-lg mb-3">
      {balancesLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Icon name="mdi:loading" className="w-4 h-4 animate-spin" />
          <span>Fetching token balance from wallet...</span>
        </div>
      )}
      {balancesError && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <Icon name="mdi:alert-circle" className="w-4 h-4" />
          <span>Failed to fetch balance: {balancesError}</span>
          <div className="flex gap-1 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={refetchBalances}
            >
              <Icon name="mdi:refresh" className="w-3 h-3 mr-1" />
              Try again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowTokenHelper(true)}
            >
              <Icon name="mdi:help-circle" className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>
        </div>
      )}
      {!balancesInitialized && !balancesLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="mdi:wallet" className="w-4 h-4" />
          <span>Connect wallet to view balance</span>
        </div>
      )}
    </div>
  );
}
