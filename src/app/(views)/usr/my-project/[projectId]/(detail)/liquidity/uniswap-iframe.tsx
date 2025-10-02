"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useParams } from "next/navigation";
import { useProjectDetail } from "@/modules/project/project.query";

// interface UniswapIframeProps {
//   tokenA?: string;
//   tokenB?: string;
//   chain?: string;
//   contractAddress: string;
// }

// interface CopyableTextProps {
//   text: string;
//   displayText?: string;
//   className?: string;
// }

// function CopyableText({
//   text,
//   displayText,
//   className = "",
// }: CopyableTextProps) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(true);
//       toast.success("Contract address copied to clipboard!", {
//         duration: 2000,
//       });

//       // Reset copied state after 2 seconds
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       toast.error("Failed to copy to clipboard");
//       console.error("Failed to copy: ", err);
//     }
//   };

//   const formatAddress = (address: string) => {
//     if (address.length <= 12) return address;
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   };

//   return (
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <div
//             className={`inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted/70 rounded-lg border transition-colors cursor-pointer group ${className}`}
//             onClick={handleCopy}
//           >
//             <code className="text-xs font-mono">
//               {displayText || formatAddress(text)}
//             </code>
//             <Icon
//               name={copied ? "mdi:check" : "mdi:content-copy"}
//               className={`text-sm transition-all duration-200 ${
//                 copied
//                   ? "text-green-500 scale-110"
//                   : "text-muted-foreground group-hover:text-foreground"
//               }`}
//             />
//           </div>
//         </TooltipTrigger>
//         <TooltipContent>
//           <p>{copied ? "Copied!" : "Click to copy contract address"}</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// }

export default function ActionsLiquidity() {
  const { projectId } = useParams();
  const { data: project, isLoading } = useProjectDetail(projectId.toString());

  const handleOpen = () => {
    const chain = project?.chains[0].chain.name.split(" ")[0].toLowerCase();
    const contractAddress = project?.contractAddress;
    window.open(
      `https://app.uniswap.org/positions/create/v3?currencyA=NATIVE&currencyB=${contractAddress}&chain=${chain}&hook=undefined&priceRangeState={%22priceInverted%22:false,%22fullRange%22:true,%22minPrice%22:%22%22,%22maxPrice%22:%22%22,%22initialPrice%22:%22%22}&depositState={%22exactField%22:%22TOKEN0%22,%22exactAmounts%22:{}}
`,
      "_blank"
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (project?.status === "DEPLOYED") {
    return (
      // <UniswapIframe
      //   tokenA={"0xB8c77482e45F1F44dE1745F52C74426C631bDD52"} // BNB - TODO: ganti jadi dari database
      //   tokenB={project.contractAddress}
      //   contractAddress={project.contractAddress ?? ""}
      // />

      <Button
        onClick={handleOpen}
        size="sm"
        variant="default"
        className="flex items-center gap-2"
      >
        <Icon className="text-sm" name="mdi:water-plus" />
        Add Liquidity
      </Button>
    );
  }
  return null;
}

// NOTE: Uniswap iframe
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
