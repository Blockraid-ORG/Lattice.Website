"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectDetail } from "@/modules/project/project.query";
import { ModalLiquidity, ConfirmationModal } from "@/components/liquidity-pool";

// interface UniswapIframeProps {
//   tokenA?: string;
//   tokenB?: string;
//   chain?: string;
//   contractAddress: string;
// }

export default function ActionsLiquidity() {
  const { projectId } = useParams();
  const { data: project, isLoading } = useProjectDetail(projectId.toString());
  const [open, setOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalData, setModalData] = useState<any>({
    rangeType: "full",
    minPrice: "0",
    maxPrice: "∞",
    startingPrice: "0",
    baseToken: "TokenA",
    tokenAAmount: "0",
    tokenBAmount: "0",
    tokenAData: null, // Tambahkan tokenAData
    tokenBData: null, // Tambahkan tokenBData
    tokenPrices: { TokenA: 0, TokenB: 0 },
    calculateUSDValue: () => "US$0",
    calculateTotalPoolValue: () => "US$0",
  });

  // 🎯 Extract chainId from project data safely
  const projectChainId = project?.chains?.[0]?.chain?.chainid;

  // 🚨 Don't show liquidity button if chainId not loaded yet
  const isChainIdReady = projectChainId !== undefined;

  // ✅ MANUAL ADDRESS OVERRIDE UNTUK TESTING - Updated from project info
  // 🎯 USDC/KS Pair Configuration for BSC
  const USDC_BSC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; // USDC BSC Official
  const KS_TOKEN_ADDRESS = "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc"; // KS Project Token (Verified)

  // Legacy constants for compatibility
  // const MANUAL_CONTRACT_ADDRESS = KS_TOKEN_ADDRESS;
  // const TEST_TOKEN_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT BSC Official

  // 🎯 Dynamic Token Configuration based on actual project chain
  // if (isChainIdReady && projectChainId) {
  //   const isArbitrum = projectChainId === 42161;
  //   const isBSC = projectChainId === 56;
  // }

  // 🔍 Loading states and safety checks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading project data...</div>
      </div>
    );
  }

  // 🚨 Don't show liquidity options if chainId not ready
  if (!isChainIdReady) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-amber-600">
          ⚠️ Waiting for project chain information...
        </div>
      </div>
    );
  }

  // 🚨 Project must be deployed to add liquidity
  if (project?.status === "DEPLOYED") {
    return (
      <>
        <Button
          size="sm"
          variant="default"
          className="flex items-center gap-2"
          onClick={() => {
            setOpen(true);
          }}
        >
          <Icon name="mdi:water-plus" className="text-sm" />
          Add Liquidity
        </Button>
        <ModalLiquidity
          open={open}
          setOpen={setOpen}
          setShowConfirmModal={setShowConfirmModal}
          setModalData={setModalData}
          projectData={
            project
              ? {
                  name: project.name,
                  ticker: project.ticker,
                  contractAddress: project.contractAddress,
                  chains: project.chains,
                  logo: project.logo,
                }
              : undefined
          }
        />
        {(() => {
          return null;
        })()}
        <ConfirmationModal
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          setOpen={setOpen}
          rangeType={modalData.rangeType}
          minPrice={modalData.minPrice}
          maxPrice={modalData.maxPrice}
          startingPrice={modalData.startingPrice}
          baseToken={modalData.baseToken}
          tokenAAmount={modalData.tokenAAmount}
          tokenBAmount={modalData.tokenBAmount}
          tokenAData={
            modalData.tokenAData
              ? {
                  symbol: modalData.tokenAData.symbol,
                  name: modalData.tokenAData.name,
                  icon: modalData.tokenAData.icon,
                  address: modalData.tokenAData.address,
                  isNative: modalData.tokenAData.isNative || false,
                  decimals: modalData.tokenAData.decimals || 18,
                }
              : {
                  symbol: "USDC",
                  name: "USD Coin",
                  icon: "cryptocurrency-color:usdc",
                  address: USDC_BSC_ADDRESS, // USDC BSC Official
                  isNative: false, // USDC adalah BEP20 token, bukan native
                  decimals: 18, // USDC BSC uses 18 decimals
                }
          }
          tokenBData={
            modalData.tokenBData
              ? {
                  symbol: modalData.tokenBData.symbol,
                  name: modalData.tokenBData.name,
                  icon: modalData.tokenBData.icon,
                  address: modalData.tokenBData.address,
                  isNative: modalData.tokenBData.isNative || false,
                  decimals: modalData.tokenBData.decimals || 18,
                }
              : project && project.status === "DEPLOYED" // ✅ VALIDASI STATUS DEPLOYED
              ? {
                  symbol: project.ticker,
                  name: project.name,
                  icon: "mdi:coin",
                  address: KS_TOKEN_ADDRESS, // ⚡ Back to KS contract for testing
                  isNative: false, // Project token selalu ERC20/BEP20
                  decimals: project.decimals || 18,
                }
              : {
                  symbol: "CAKE", // 🍰 FALLBACK: Using PancakeSwap CAKE token for testing
                  name: "PancakeSwap Token",
                  icon: "cryptocurrency:cake",
                  address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE BSC (widely used in BSC)
                  isNative: false,
                  decimals: 18,
                }
          }
          tokenPrices={modalData.tokenPrices}
          calculateUSDValue={modalData.calculateUSDValue}
          calculateTotalPoolValue={modalData.calculateTotalPoolValue}
          // Props tambahan untuk Uniswap integration
          feeTier={modalData.feeTier || "0.3"}
          chainId={projectChainId} // Use actual project chainId, not fallback
          userAddress={modalData.userAddress}
        />
      </>
    );
  }
  return null;
}
