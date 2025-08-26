"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectDetail } from "@/modules/project/project.query";
import {
  CopyableText,
  ModalLiquidity,
  ConfirmationModal,
} from "@/components/liquidity-pool";

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
  const [modalData, setModalData] = useState({
    rangeType: "full",
    minPrice: "0",
    maxPrice: "∞",
    startingPrice: "0.00000022",
    baseToken: "BU",
    bnbAmount: "0",
    buAmount: "0",
    tokenPrices: { BNB: 625.34, BU: 0.0001375 },
    calculateUSDValue: () => "US$0",
    calculateTotalPoolValue: () => "US$0",
  });

  console.log(project);
  if (isLoading) return <div>Loading...</div>;
  if (project?.status === "DEPLOYED") {
    return (
      <>
        <Button
          size="sm"
          variant="default"
          className="flex items-center gap-2"
          onClick={() => {
            setOpen(true);
            console.log("open", open);
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
        />
        <ConfirmationModal
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          setOpen={setOpen}
          rangeType={modalData.rangeType}
          minPrice={modalData.minPrice}
          maxPrice={modalData.maxPrice}
          startingPrice={modalData.startingPrice}
          baseToken={modalData.baseToken}
          bnbAmount={modalData.bnbAmount}
          buAmount={modalData.buAmount}
          tokenAData={{
            symbol: "BNB",
            name: "Binance Coin",
            icon: "cryptocurrency-color:bnb",
          }}
          tokenBData={{
            symbol: "BU",
            name: "Bakso Urat",
            icon: "mdi:food",
          }}
          tokenPrices={modalData.tokenPrices}
          calculateUSDValue={modalData.calculateUSDValue}
          calculateTotalPoolValue={modalData.calculateTotalPoolValue}
        />
      </>
    );
  }
  return null;
}

// function UniswapIframe({
//   tokenA = "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT Base
//   tokenB = "0x833589fCD6eDb6E08f4c7C32D4f71b54bDA02913", // USDC Base
//   contractAddress,
//   chain = "base",
// }: UniswapIframeProps) {
//   const [open, setOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Construct Uniswap URL with proper parameters
//   const uniswapUrl = `https://app.uniswap.org/#/add/v2/${tokenA}/${tokenB}?chain=${chain}&theme=dark`;

//   const handleIframeLoad = () => {
//     setIsLoading(false);
//   };

//   const handleOpenChange = (isOpen: boolean) => {
//     setOpen(isOpen);
//     if (isOpen) {
//       setIsLoading(true);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         <Button size="sm" variant="default" className="flex items-center gap-2">
//           <Icon className="text-sm" name="mdi:water-plus" />
//           Add Liquidity
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0">
//         <DialogHeader className="p-6 pb-0">
//           <DialogTitle className="flex items-center gap-3 flex-wrap">
//             <div className="flex items-center gap-2">
//               <Icon className="text-lg" name="simple-icons:uniswap" />
//               Add Liquidity - Uniswap
//             </div>
//             <CopyableText text={contractAddress} className="flex-shrink-0" />
//           </DialogTitle>
//           <p className="text-sm text-muted-foreground">
//             Provide liquidity to earn trading fees. Click the contract address
//             to copy it.
//           </p>
//         </DialogHeader>

//         <div className="relative w-full h-full p-6 pt-0">
//           {isLoading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
//               <div className="flex flex-col items-center gap-3">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                 <p className="text-sm text-muted-foreground">
//                   Loading Uniswap...
//                 </p>
//               </div>
//             </div>
//           )}

//           <iframe
//             src={uniswapUrl}
//             className="w-full h-full rounded-lg border-0"
//             style={{ minHeight: "600px" }}
//             allow="clipboard-write; accelerometer; autoplay; camera; gyroscope; payment; web-share"
//             sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
//             loading="lazy"
//             onLoad={handleIframeLoad}
//             title="Uniswap Add Liquidity"
//           />
//         </div>

//         {/* Footer with external link */}
//         <div className="p-4 border-t bg-muted/50">
//           <div className="flex items-center justify-between text-xs text-muted-foreground">
//             <span>Powered by Uniswap Protocol</span>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-auto p-1 text-xs"
//               onClick={() => window.open(uniswapUrl, "_blank")}
//             >
//               <Icon className="text-sm mr-1" name="mdi:open-in-new" />
//               Open in new tab
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
