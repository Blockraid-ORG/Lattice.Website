"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface CopyableTextProps {
  text: string;
  displayText?: string;
  className?: string;
}

export function CopyableText({
  text,
  displayText,
  className = "",
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Contract address copied to clipboard!", {
        duration: 2000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted/70 rounded-lg border transition-colors cursor-pointer group ${className}`}
            onClick={handleCopy}
          >
            <code className="text-xs font-mono">
              {displayText || formatAddress(text)}
            </code>
            <Icon
              name={copied ? "mdi:check" : "mdi:content-copy"}
              className={`text-sm transition-all duration-200 ${
                copied
                  ? "text-green-500 scale-110"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Click to copy contract address"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
