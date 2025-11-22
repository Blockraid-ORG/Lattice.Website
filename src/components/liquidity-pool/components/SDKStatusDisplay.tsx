import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SDKStatusDisplayProps {
  isWalletConnected: boolean;
  isSDKConnecting: boolean;
  sdkError: string | null;
  isSDKReady: boolean;
  projectChainId: number;
  refreshSDK?: () => Promise<void>;
}

export default function SDKStatusDisplay({
  isWalletConnected,
  isSDKConnecting,
  sdkError,
  isSDKReady,
  projectChainId,
  refreshSDK,
}: SDKStatusDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!refreshSDK || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshSDK();
    } catch (error) {
      console.error("Error refreshing SDK:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  // Only show if wallet is connected
  if (!isWalletConnected) {
    return null;
  }

  return (
    <div className="p-3 bg-muted/20 rounded-lg mb-3">
      {isSDKConnecting && (
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Icon name="mdi:loading" className="w-4 h-4 animate-spin" />
          <span>Initializing Uniswap V3 SDK...</span>
        </div>
      )}
      {sdkError && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <Icon name="mdi:alert-circle" className="w-4 h-4" />
            <span>SDK Error: {sdkError}</span>
          </div>
          {refreshSDK && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isSDKConnecting}
              className="h-8 w-8 p-0"
              title="Refresh SDK"
            >
              <Icon
                name="mdi:refresh"
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      )}
      {!isSDKReady && !isSDKConnecting && !sdkError && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Icon name="mdi:alert" className="w-4 h-4" />
            <span>Uniswap SDK not ready</span>
          </div>
          {refreshSDK && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isSDKConnecting}
              className="h-8 w-8 p-0"
              title="Refresh SDK"
            >
              <Icon
                name="mdi:refresh"
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      )}
      {isSDKReady && !isSDKConnecting && !sdkError && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Icon name="mdi:check-circle" className="w-4 h-4" />
          <span>Uniswap V3 SDK Ready · Chain {projectChainId}</span>
        </div>
      )}
    </div>
  );
}
