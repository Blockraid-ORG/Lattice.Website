import { Icon } from "@/components/icon";

interface SDKStatusDisplayProps {
  isWalletConnected: boolean;
  isSDKConnecting: boolean;
  sdkError: string | null;
  isSDKReady: boolean;
  projectChainId: number;
}

export default function SDKStatusDisplay({
  isWalletConnected,
  isSDKConnecting,
  sdkError,
  isSDKReady,
  projectChainId,
}: SDKStatusDisplayProps) {
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
        <div className="flex items-center gap-2 text-sm text-red-600">
          <Icon name="mdi:alert-circle" className="w-4 h-4" />
          <span>SDK Error: {sdkError}</span>
        </div>
      )}
      {!isSDKReady && !isSDKConnecting && !sdkError && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <Icon name="mdi:alert" className="w-4 h-4" />
          <span>Uniswap SDK not ready</span>
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
