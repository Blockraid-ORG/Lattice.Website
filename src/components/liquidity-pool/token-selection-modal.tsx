"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { chains } from "@/data/chain";
import { useTokenPrices } from "@/hooks/useTokenPrices";

interface TokenSelectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectToken: (token: any) => void;
  selectedToken?: string;
  filterByChain?: string; // Filter tokens by specific chain
  disabledToken?: string; // Token symbol that should be disabled/hidden
}

interface Token {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  address: string;
  chain: string;
}

interface Chain {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  tokens: Token[];
}

interface Network {
  id: string;
  name: string;
  icon: string;
}

export function TokenSelectionModal({
  open,
  setOpen,
  onSelectToken,
  selectedToken,
  filterByChain,
  disabledToken,
}: TokenSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");

  // Auto-set network filter based on filterByChain prop
  useEffect(() => {
    if (filterByChain) {
      setSelectedNetwork(filterByChain);
    }
  }, [filterByChain]);

  const networks: Network[] = [
    { id: "all", name: "All Networks", icon: "mdi:earth" },
    ...chains.flatMap((chainGroup) =>
      chainGroup.options.map((option) => ({
        id: option.value,
        name: option.label,
        icon:
          option.value === "binance"
            ? "cryptocurrency-color:bnb"
            : option.value === "ethereum"
            ? "cryptocurrency-color:eth"
            : option.value === "polygon"
            ? "cryptocurrency-color:matic"
            : option.value === "arbitrum"
            ? "simple-icons:arbitrum"
            : option.value === "avalanche"
            ? "cryptocurrency-color:avax"
            : "mdi:link",
      }))
    ),
  ];

  const popularTokens: Chain[] = [
    {
      id: "bsc",
      symbol: "BSC",
      name: "Binance Smart Chain",
      icon: "cryptocurrency-color:bnb",
      tokens: [
        {
          symbol: "LINK",
          name: "Chainlink",
          icon: "cryptocurrency-color:link",
          price: "$24.30",
          address: "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
          chain: "bsc",
        },
        {
          symbol: "UNI",
          name: "Uniswap",
          icon: "cryptocurrency-color:uni",
          price: "$10.00",
          address: "0xbf5140a22578168fd562dccf235e5d43a02ce9b1",
          chain: "bsc",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
          chain: "bsc",
        },
        {
          symbol: "BNB",
          name: "Binance Coin",
          icon: "cryptocurrency-color:bnb",
          price: "$625.34",
          address: "0x0000000000000000000000000000000000000000",
          chain: "bsc",
        },
        {
          symbol: "BUSD",
          name: "Binance USD",
          icon: "cryptocurrency-color:busd",
          price: "$1.00",
          address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          chain: "bsc",
        },
        {
          symbol: "CAKE",
          name: "PancakeSwap",
          icon: "cryptocurrency-color:cake",
          price: "$2.85",
          address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
          chain: "bsc",
        },
      ],
    },
    {
      id: "arbitrum",
      symbol: "ARB",
      name: "Arbitrum One",
      icon: "simple-icons:arbitrum",
      tokens: [
        {
          symbol: "USDC",
          name: "USD Coin (Native)",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          chain: "arbitrum",
        },
        {
          symbol: "USDC.e",
          name: "USD Coin (Bridged)",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
          chain: "arbitrum",
        },
        {
          symbol: "KM",
          name: "KOSAN AN",
          icon: "mdi:home-city-outline",
          price: "$0.001",
          address: "0xAe771AC9292c84ed2A6625Ae92380DedCF9A5076",
          chain: "arbitrum",
        },
        {
          symbol: "WETH",
          name: "Wrapped Ethereum",
          icon: "cryptocurrency-color:eth",
          price: "$2,850.00",
          address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
          chain: "arbitrum",
        },
        {
          symbol: "ARB",
          name: "Arbitrum",
          icon: "cryptocurrency-color:arb",
          price: "$0.85",
          address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          chain: "arbitrum",
        },
      ],
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      icon: "cryptocurrency-color:eth",
      tokens: [
        {
          symbol: "ETH",
          name: "Ethereum",
          icon: "cryptocurrency-color:eth",
          price: "$3,500.00",
          address: "0x0000000000000000000000000000000000000000",
          chain: "ethereum",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0xA0b86a33E6441d74E19df00c1f82f9B2f0b36b6E",
          chain: "ethereum",
        },
        {
          symbol: "USDT",
          name: "Tether",
          icon: "cryptocurrency-color:usdt",
          price: "$1.00",
          address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          chain: "ethereum",
        },
        {
          symbol: "UNI",
          name: "Uniswap",
          icon: "cryptocurrency-color:uni",
          price: "$10.00",
          address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
          chain: "ethereum",
        },
      ],
    },
    {
      id: "polygon",
      symbol: "MATIC",
      name: "Polygon",
      icon: "cryptocurrency-color:matic",
      tokens: [
        {
          symbol: "MATIC",
          name: "Polygon",
          icon: "cryptocurrency-color:matic",
          price: "$1.10",
          address: "0x0000000000000000000000000000000000001010",
          chain: "polygon",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
          chain: "polygon",
        },
        {
          symbol: "WETH",
          name: "Wrapped Ethereum",
          icon: "cryptocurrency-color:eth",
          price: "$3,500.00",
          address: "0x7ceb23fd6d09a2696d4f6b3e8e3cf5ad9b83e5c6",
          chain: "polygon",
        },
      ],
    },
    {
      id: "arbitrum",
      symbol: "ARB",
      name: "Arbitrum",
      icon: "simple-icons:arbitrum",
      tokens: [
        {
          symbol: "ARB",
          name: "Arbitrum",
          icon: "simple-icons:arbitrum",
          price: "$1.25",
          address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
          chain: "arbitrum",
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          icon: "cryptocurrency-color:eth",
          price: "$3,500.00",
          address: "0x0000000000000000000000000000000000000000",
          chain: "arbitrum",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
          chain: "arbitrum",
        },
      ],
    },
    {
      id: "avalanche",
      symbol: "AVAX",
      name: "Avalanche",
      icon: "cryptocurrency-color:avax",
      tokens: [
        {
          symbol: "AVAX",
          name: "Avalanche",
          icon: "cryptocurrency-color:avax",
          price: "$42.50",
          address: "0x0000000000000000000000000000000000000000",
          chain: "avalanche",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          icon: "cryptocurrency-color:usdc",
          price: "$1.00",
          address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
          chain: "avalanche",
        },
        {
          symbol: "USDT",
          name: "Tether",
          icon: "cryptocurrency-color:usdt",
          price: "$1.00",
          address: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
          chain: "avalanche",
        },
      ],
    },
  ];

  // Extract all unique token symbols from popularTokens
  const allTokenSymbols = useMemo(() => {
    const symbols = new Set<string>();
    popularTokens.forEach((chain) => {
      chain.tokens.forEach((token) => {
        symbols.add(token.symbol);
      });
    });
    return Array.from(symbols);
  }, []);

  // Fetch token prices from CoinGecko
  const {
    prices,
    loading: pricesLoading,
    error: pricesError,
  } = useTokenPrices(allTokenSymbols, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    autoRefresh: true,
    enabled: open, // Only fetch when modal is open
  });

  // Helper function to get token price display
  const getTokenPriceDisplay = (token: Token) => {
    const priceData = prices[token.symbol];
    if (pricesLoading && !priceData) {
      return (
        <div className="flex items-center gap-1">
          <Icon name="mdi:loading" className="w-3 h-3 animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }
    if (priceData && !priceData.price.isZero()) {
      return priceData.formatted;
    }
    // Fallback to hardcoded price if CoinGecko data not available
    return token.price;
  };

  // Helper function to get price change indicator
  const getPriceChangeIndicator = (token: Token) => {
    const priceData = prices[token.symbol];
    if (priceData && priceData.change24h !== 0) {
      const isPositive = priceData.change24h > 0;
      return (
        <span
          className={cn(
            "text-xs font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : ""}
          {priceData.change24h.toFixed(2)}%
        </span>
      );
    }
    return null;
  };

  const filterTokensBySearch = (tokens: Token[]) => {
    if (!searchTerm) return tokens;

    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterTokensByNetwork = (tokens: Token[]) => {
    if (selectedNetwork === "all") return tokens;

    // Map network ids to chain ids for filtering
    const chainMapping: { [key: string]: string } = {
      binance: "bsc",
      ethereum: "ethereum",
      polygon: "polygon",
      arbitrum: "arbitrum",
      avalanche: "avalanche",
    };

    const mappedChain = chainMapping[selectedNetwork] || selectedNetwork;
    return tokens.filter((token) => token.chain === mappedChain);
  };

  const getFilteredTokens = (tokens: Token[]) => {
    let filtered = filterTokensByNetwork(filterTokensBySearch(tokens));

    // Filter out disabled token if specified
    if (disabledToken) {
      filtered = filtered.filter((token) => token.symbol !== disabledToken);
    }

    return filtered;
  };

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Select Token
            </DialogTitle>
            {!pricesLoading && Object.keys(prices).length > 0 && (
              <span className="text-xs text-muted-foreground">
                Prices updated
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Icon
              name="mdi:magnify"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
            />
            <Input
              placeholder="Search tokens"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Network Selector */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedNetwork}
              onValueChange={setSelectedNetwork}
              disabled={!!filterByChain} // Disable when filterByChain is provided
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Icon
                      name={
                        networks.find((n) => n.id === selectedNetwork)?.icon ||
                        "mdi:earth"
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {networks.find((n) => n.id === selectedNetwork)?.name ===
                      "All Networks"
                        ? "All"
                        : networks.find((n) => n.id === selectedNetwork)?.name}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center gap-2">
                      <Icon name={network.icon} className="w-4 h-4" />
                      <span>{network.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterByChain && (
              <span className="text-xs text-muted-foreground">
                Limited to {networks.find((n) => n.id === filterByChain)?.name}
              </span>
            )}
          </div>

          {/* Popular Tokens */}
          {/* {!searchTerm && (
            <div className="flex flex-wrap gap-2">
              {getFilteredTokens(popularTokens)
                .slice(0, 5)
                .map((token) => (
                  <Button
                    key={token.symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectToken(token)}
                    className={cn(
                      "flex items-center gap-2 h-10",
                      selectedToken === token.symbol &&
                        "bg-primary/10 border-primary"
                    )}
                  >
                    <Icon name={token.icon} className="w-5 h-5" />
                    <span className="font-medium">{token.symbol}</span>
                  </Button>
                ))}
            </div>
          )} */}

          {/* Token List */}
          <div className="space-y-2">
            {/* Section Header */}
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="mdi:trending-up" className="w-4 h-4" />
                <span>Tokens by 24h volume</span>
                {pricesLoading && (
                  <Icon name="mdi:loading" className="w-3 h-3 animate-spin" />
                )}
              </div>
            )}

            {/* Price Error Notice */}
            {pricesError && !pricesLoading && (
              <div className="flex items-center gap-2 p-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
                <Icon
                  name="mdi:alert-circle"
                  className="w-3 h-3 flex-shrink-0"
                />
                <span>Using cached prices. Failed to fetch latest prices.</span>
              </div>
            )}

            {/* Tokens */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {popularTokens.flatMap((chain) =>
                getFilteredTokens(chain.tokens).map((token) => (
                  <div
                    key={token.address}
                    onClick={() => handleSelectToken(token)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors",
                      selectedToken === token.symbol && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={token.icon} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <div className="font-medium">
                          {getTokenPriceDisplay(token)}
                        </div>
                        {getPriceChangeIndicator(token)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.address.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {searchTerm &&
              popularTokens.flatMap((chain) => getFilteredTokens(chain.tokens))
                .length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon
                    name="mdi:help-circle"
                    className="w-12 h-12 mx-auto mb-2 opacity-50"
                  />
                  <p>No tokens found</p>
                  <p className="text-sm">Try different keywords</p>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
