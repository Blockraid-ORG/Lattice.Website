import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

interface ReviewButtonProps {
  getButtonState: () => {
    className: string;
    disabled: boolean;
    text: string;
    icon?: string;
  };
  processedTokenAData: any;
  projectData?: any;
  selectedTokenB: string;
  tokenAddressMap: Record<string, any>;
  tokenBData: any;
  getCorrectDecimals: (symbol: string, address?: string) => number;
  rangeType: string;
  minPrice: string;
  maxPrice: string;
  startingPrice: string;
  baseToken: string;
  tokenAAmount: string;
  tokenBAmount: string;
  tokenPrices: any;
  calculateUSDValue: any;
  calculateTotalPoolValue: any;
  selectedFeeTier: string;
  projectChainId: number;
  userAddress: string;
  setModalData: (data: any) => void;
  setOpen: (open: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
}

export default function ReviewButton({
  getButtonState,
  processedTokenAData,
  projectData,
  selectedTokenB,
  tokenAddressMap,
  tokenBData,
  getCorrectDecimals,
  rangeType,
  minPrice,
  maxPrice,
  startingPrice,
  baseToken,
  tokenAAmount,
  tokenBAmount,
  tokenPrices,
  calculateUSDValue,
  calculateTotalPoolValue,
  selectedFeeTier,
  projectChainId,
  userAddress,
  setModalData,
  setOpen,
  setShowConfirmModal,
}: ReviewButtonProps) {
  const buttonState = getButtonState();

  return (
    <Button
      className={buttonState.className}
      disabled={buttonState.disabled}
      onClick={
        !buttonState.disabled
          ? () => {
              // CRITICAL: Use pre-processed tokenAData
              const finalTokenAData = processedTokenAData;

              // Get correct decimals for tokenB
              const tokenBAddress =
                projectData?.contractAddress ||
                (selectedTokenB
                  ? tokenAddressMap[selectedTokenB]?.address
                  : undefined);
              const tokenBDecimals = getCorrectDecimals(
                selectedTokenB || tokenBData.symbol || "UNKNOWN",
                tokenBAddress
              );

              const finalTokenBData = {
                ...tokenBData,
                address: tokenBAddress,
                isNative: selectedTokenB
                  ? tokenAddressMap[selectedTokenB]?.isNative || false
                  : false,
                decimals: tokenBDecimals, // Use correct decimals per token
                name: tokenBData?.name || tokenBData?.symbol || "Unknown Token", // Add name fallback
              };

              setModalData({
                rangeType,
                minPrice,
                maxPrice,
                startingPrice,
                baseToken,
                tokenAAmount,
                tokenBAmount,
                tokenAData: finalTokenAData,
                tokenBData: finalTokenBData,
                tokenPrices,
                calculateUSDValue,
                calculateTotalPoolValue,
                // Data tambahan untuk Uniswap integration
                feeTier: selectedFeeTier,
                chainId: projectChainId, // Use project chain ID from hook
                userAddress,
              });
              setOpen(false); // Close main modal first
              setShowConfirmModal(true);
            }
          : undefined
      }
    >
      {buttonState.icon && (
        <Icon name={buttonState.icon} className="w-4 h-4 mr-2" />
      )}
      {buttonState.text}
    </Button>
  );
}
