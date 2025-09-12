import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TokenPairSelectionProps {
  tokenASymbol: string;
  tokenAIcon: string;
  tokenBSymbol: string;
  tokenBIcon: string;
  projectData?: any;
  setShowTokenAModal: (show: boolean) => void;
  setShowTokenBModal: (show: boolean) => void;
  hookEnabled: boolean;
  setHookEnabled: (enabled: boolean) => void;
}

export default function TokenPairSelection({
  tokenASymbol,
  tokenAIcon,
  tokenBSymbol,
  tokenBIcon,
  projectData,
  setShowTokenAModal,
  setShowTokenBModal,
  hookEnabled,
  setHookEnabled,
}: TokenPairSelectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Select Pair</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Choose tokens you&apos;d like to provide liquidity for. You can select
        tokens across all supported networks.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Token A */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowTokenAModal(true)}
            className={`h-14 px-4 w-full justify-start ${
              !tokenASymbol ? "text-muted-foreground" : ""
            }`}
          >
            {tokenASymbol ? (
              <div className="flex items-center gap-3">
                <Icon name={tokenAIcon} className="w-6 h-6" />
                <span className="font-medium">{tokenASymbol}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Icon
                  name="mdi:help-circle-outline"
                  className="w-6 h-6 text-muted-foreground"
                />
                <span>Select first token</span>
              </div>
            )}
          </Button>
        </div>

        {/* Token B */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowTokenBModal(true)}
            className={`h-14 px-4 w-full justify-start ${
              !!projectData
                ? "bg-muted/30 cursor-not-allowed opacity-60"
                : !tokenBSymbol
                ? "text-muted-foreground"
                : ""
            }`}
            disabled={!!projectData} // Disable when project data is available
          >
            {tokenBSymbol ? (
              <div className="flex items-center gap-3">
                <Icon name={tokenBIcon} className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{tokenBSymbol}</span>
                  {!!projectData && (
                    <span className="text-xs text-muted-foreground">
                      Project Token
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Icon
                  name="mdi:help-circle-outline"
                  className="w-6 h-6 text-muted-foreground"
                />
                <span>
                  {projectData
                    ? "Project token will be auto-selected"
                    : "Select second token"}
                </span>
              </div>
            )}
          </Button>
          {!!projectData && tokenBSymbol && (
            <p className="text-xs text-muted-foreground">
              Project token automatically selected
            </p>
          )}
        </div>
      </div>

      {/* Hook Option */}
      {!hookEnabled ? (
        <div className="mt-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setHookEnabled(true)}
          >
            <Icon name="mdi:hook" className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Add Hook (Advanced)
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Icon
                    name="mdi:information-outline"
                    className="text-muted-foreground cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hooks enable custom functionality for this pool</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter hook address"
              className="flex-1 h-12 px-4 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setHookEnabled(false)}
            >
              <Icon name="mdi:close" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
