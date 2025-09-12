import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StepSidebarProps {
  projectChainId: number;
  currentStep: number;
}

export default function StepSidebar({
  projectChainId,
  currentStep,
}: StepSidebarProps) {
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 42161:
        return "Arbitrum One";
      case 56:
        return "BSC";
      default:
        return `Chain ${chainId}`;
    }
  };

  return (
    <div className="w-80 bg-muted/30 border-r p-6 flex flex-col h-full">
      <DialogHeader className="mb-8 flex-shrink-0">
        <DialogTitle className="text-xl font-semibold">
          New Position ({getChainName(projectChainId)})
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 flex-1">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">Step 1</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select token pair and fee tier
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">Step 2</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set price range and deposit amounts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
