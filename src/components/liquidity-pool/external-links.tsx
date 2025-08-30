"use client";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExternalLinksProps {
  poolAddress?: string;
  tokenAAddress?: string;
  tokenBAddress?: string;
  transactionHash?: string;
  nftTokenId?: string;
  chainId?: number;
  className?: string;
}

interface ChainInfo {
  name: string;
  explorerUrl: string;
  uniswapUrl?: string;
  icon: string;
}

export function ExternalLinks({
  poolAddress,
  tokenAAddress,
  tokenBAddress,
  transactionHash,
  nftTokenId,
  chainId = 56,
  className = "",
}: ExternalLinksProps) {
  const getChainInfo = (chainId: number): ChainInfo => {
    const chainInfos: { [key: number]: ChainInfo } = {
      1: {
        name: "Ethereum",
        explorerUrl: "https://etherscan.io",
        uniswapUrl: "https://app.uniswap.org",
        icon: "cryptocurrency-color:eth",
      },
      56: {
        name: "BSC",
        explorerUrl: "https://bscscan.com",
        uniswapUrl: "https://pancakeswap.finance",
        icon: "cryptocurrency-color:bnb",
      },
      137: {
        name: "Polygon",
        explorerUrl: "https://polygonscan.com",
        uniswapUrl: "https://app.uniswap.org",
        icon: "cryptocurrency-color:matic",
      },
      42161: {
        name: "Arbitrum",
        explorerUrl: "https://arbiscan.io",
        uniswapUrl: "https://app.uniswap.org",
        icon: "cryptocurrency-color:arb",
      },
      43114: {
        name: "Avalanche",
        explorerUrl: "https://snowtrace.io",
        uniswapUrl: "https://app.uniswap.org",
        icon: "cryptocurrency-color:avax",
      },
    };

    return (
      chainInfos[chainId] || {
        name: "Unknown",
        explorerUrl: "https://etherscan.io",
        icon: "mdi:help-circle",
      }
    );
  };

  const chainInfo = getChainInfo(chainId);

  const openUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="mdi:open-in-new" className="w-5 h-5" />
            External Links
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Icon name={chainInfo.icon} className="w-3 h-3" />
            {chainInfo.name}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <TooltipProvider>
          {/* Pool Links */}
          {poolAddress && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icon name="mdi:pool" className="w-4 h-4" />
                Liquidity Pool
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Uniswap/DEX Link */}
                {chainInfo.uniswapUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const baseUrl =
                            chainId === 56
                              ? `${chainInfo.uniswapUrl}/liquidity/pool`
                              : `${chainInfo.uniswapUrl}/pools`;
                          openUrl(`${baseUrl}/${poolAddress}`);
                        }}
                      >
                        <Icon
                          name={
                            chainId === 56
                              ? "mdi:pancakes"
                              : "cryptocurrency-color:uni"
                          }
                          className="w-4 h-4 mr-2"
                        />
                        {chainId === 56 ? "PancakeSwap" : "Uniswap"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Lihat pool di{" "}
                        {chainId === 56 ? "PancakeSwap" : "Uniswap"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Explorer Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openUrl(
                          `${chainInfo.explorerUrl}/address/${poolAddress}`
                        )
                      }
                    >
                      <Icon name="mdi:magnify" className="w-4 h-4 mr-2" />
                      Explorer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lihat pool contract di blockchain explorer</p>
                  </TooltipContent>
                </Tooltip>

                {/* DexTools Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const network =
                          chainId === 1
                            ? "ether"
                            : chainId === 56
                            ? "bsc"
                            : chainId === 137
                            ? "polygon"
                            : "ether";
                        openUrl(
                          `https://www.dextools.io/app/en/${network}/pool-explorer/${poolAddress}`
                        );
                      }}
                    >
                      <Icon name="mdi:chart-line" className="w-4 h-4 mr-2" />
                      DexTools
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analisa pool di DexTools</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Token Links */}
          {(tokenAAddress || tokenBAddress) && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icon name="mdi:coin" className="w-4 h-4" />
                Tokens
              </div>
              <div className="space-y-2">
                {tokenAAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Token A:
                    </span>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openUrl(
                                `${chainInfo.explorerUrl}/address/${tokenAAddress}`
                              )
                            }
                          >
                            <Icon name="mdi:magnify" className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lihat Token A di explorer</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}

                {tokenBAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Token B:
                    </span>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openUrl(
                                `${chainInfo.explorerUrl}/address/${tokenBAddress}`
                              )
                            }
                          >
                            <Icon name="mdi:magnify" className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lihat Token B di explorer</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Link */}
          {transactionHash && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icon name="mdi:receipt" className="w-4 h-4" />
                Transaction
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openUrl(
                            `${chainInfo.explorerUrl}/tx/${transactionHash}`
                          )
                        }
                      >
                        <Icon name="mdi:open-in-new" className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Lihat transaksi di explorer</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(transactionHash);
                          // Could add toast notification
                        }}
                      >
                        <Icon name="mdi:content-copy" className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy transaction hash</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* NFT Position Link */}
          {nftTokenId && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icon name="mdi:image" className="w-4 h-4" />
                NFT Position
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div>
                  <div className="text-sm font-medium">
                    Position #{nftTokenId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uniswap V3 LP NFT
                  </div>
                </div>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Uniswap V3 Position Manager address
                          const positionManagerAddress =
                            "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
                          openUrl(
                            `${chainInfo.explorerUrl}/token/${positionManagerAddress}?a=${nftTokenId}`
                          );
                        }}
                      >
                        <Icon name="mdi:open-in-new" className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Lihat NFT position di explorer</p>
                    </TooltipContent>
                  </Tooltip>

                  {chainInfo.uniswapUrl && chainId !== 56 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openUrl(
                              `${chainInfo.uniswapUrl}/positions/${nftTokenId}`
                            )
                          }
                        >
                          <Icon
                            name="cryptocurrency-color:uni"
                            className="w-4 h-4"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage position di Uniswap</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* General DEX Links */}
          {!poolAddress && !transactionHash && !nftTokenId && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icon name="mdi:swap-horizontal" className="w-4 h-4" />
                Useful Links
              </div>
              <div className="flex flex-wrap gap-2">
                {chainInfo.uniswapUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUrl(chainInfo.uniswapUrl!)}
                  >
                    <Icon
                      name={
                        chainId === 56
                          ? "mdi:pancakes"
                          : "cryptocurrency-color:uni"
                      }
                      className="w-4 h-4 mr-2"
                    />
                    {chainId === 56 ? "PancakeSwap" : "Uniswap"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openUrl(chainInfo.explorerUrl)}
                >
                  <Icon name="mdi:magnify" className="w-4 h-4 mr-2" />
                  {chainInfo.name} Explorer
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const network =
                      chainId === 1
                        ? "ether"
                        : chainId === 56
                        ? "bsc"
                        : chainId === 137
                        ? "polygon"
                        : "ether";
                    openUrl(`https://www.dextools.io/app/en/${network}/`);
                  }}
                >
                  <Icon name="mdi:chart-line" className="w-4 h-4 mr-2" />
                  DexTools
                </Button>
              </div>
            </div>
          )}
        </TooltipProvider>

        {/* Network Status Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{chainInfo.name} Network</span>
            </div>
            <span>•</span>
            <span>Chain ID: {chainId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Komponen sederhana untuk quick links dalam context lain
interface QuickLinksProps {
  poolAddress?: string;
  transactionHash?: string;
  chainId?: number;
  size?: "sm" | "md";
}

export function QuickLinks({
  poolAddress,
  transactionHash,
  chainId = 56,
  size = "md",
}: QuickLinksProps) {
  const chainInfo = getChainInfo(chainId);

  const getChainInfo = (chainId: number) => {
    const chainInfos: { [key: number]: ChainInfo } = {
      1: {
        name: "Ethereum",
        explorerUrl: "https://etherscan.io",
        uniswapUrl: "https://app.uniswap.org",
        icon: "cryptocurrency-color:eth",
      },
      56: {
        name: "BSC",
        explorerUrl: "https://bscscan.com",
        uniswapUrl: "https://pancakeswap.finance",
        icon: "cryptocurrency-color:bnb",
      },
      137: {
        name: "Polygon",
        explorerUrl: "https://polygonscan.com",
        uniswapUrl: "https://app.uniswap.org",
        icon: "cryptocurrency-color:matic",
      },
    };
    return chainInfos[chainId] || chainInfos[1];
  };

  return (
    <div className="flex items-center gap-1">
      {poolAddress && chainInfo.uniswapUrl && (
        <Button
          variant="ghost"
          size={size}
          onClick={() =>
            window.open(
              `${chainInfo.uniswapUrl}/pools/${poolAddress}`,
              "_blank"
            )
          }
        >
          <Icon
            name={chainId === 56 ? "mdi:pancakes" : "cryptocurrency-color:uni"}
            className="w-4 h-4"
          />
        </Button>
      )}

      {(poolAddress || transactionHash) && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => {
            const url = poolAddress
              ? `${chainInfo.explorerUrl}/address/${poolAddress}`
              : `${chainInfo.explorerUrl}/tx/${transactionHash}`;
            window.open(url, "_blank");
          }}
        >
          <Icon name="mdi:open-in-new" className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
