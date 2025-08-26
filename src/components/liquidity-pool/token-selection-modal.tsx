"use client";

import { useState } from "react";
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

interface TokenSelectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectToken: (token: any) => void;
  selectedToken?: string;
}

interface Token {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  address: string;
  networks: string[];
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
}: TokenSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");

  const networks: Network[] = [
    { id: "all", name: "All Networks", icon: "mdi:earth" },
    { id: "ethereum", name: "Ethereum", icon: "cryptocurrency-color:eth" },
    { id: "bsc", name: "BSC", icon: "cryptocurrency-color:bnb" },
    { id: "polygon", name: "Polygon", icon: "cryptocurrency-color:matic" },
    { id: "arbitrum", name: "Arbitrum", icon: "simple-icons:arbitrum" },
  ];

  const popularTokens: Token[] = [
    {
      symbol: "BNB",
      name: "Binance Coin",
      icon: "cryptocurrency-color:bnb",
      price: "$625.34",
      address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
      networks: ["ethereum", "bsc"],
    },
    {
      symbol: "BU",
      name: "Bakso Urat",
      icon: "mdi:food",
      price: "$0.0001234",
      address: "0xC518FC545C14FC990f269F8f9bE79D7fc471D13f",
      networks: ["ethereum", "bsc"],
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      icon: "cryptocurrency-color:eth",
      price: "$2,345.67",
      address: "0x...",
      networks: ["ethereum", "arbitrum"],
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: "cryptocurrency-color:usdc",
      price: "$1.00",
      address: "0xA0b86a33E6...",
      networks: ["ethereum", "bsc", "polygon"],
    },
    {
      symbol: "USDT",
      name: "Tether",
      icon: "cryptocurrency-color:usdt",
      price: "$0.999",
      address: "0xdAC1...",
      networks: ["ethereum", "bsc", "polygon"],
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      icon: "cryptocurrency-color:wbtc",
      price: "$43,210.50",
      address: "0x2260...",
      networks: ["ethereum"],
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      icon: "cryptocurrency-color:weth",
      price: "$2,345.67",
      address: "0xC02a...",
      networks: ["ethereum", "arbitrum"],
    },
  ];

  const additionalTokens: Token[] = [
    {
      symbol: "MATIC",
      name: "Polygon",
      icon: "cryptocurrency-color:matic",
      price: "$0.85",
      address: "0x...",
      networks: ["polygon"],
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      icon: "cryptocurrency-color:link",
      price: "$12.34",
      address: "0x...",
      networks: ["ethereum", "bsc", "polygon"],
    },
  ];

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

    return tokens.filter((token) => token.networks.includes(selectedNetwork));
  };

  const getFilteredTokens = (tokens: Token[]) => {
    return filterTokensByNetwork(filterTokensBySearch(tokens));
  };

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Pilih token
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Icon
              name="mdi:magnify"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
            />
            <Input
              placeholder="Cari token"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Network Selector */}
          <div className="flex items-center gap-2">
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
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
          </div>

          {/* Popular Tokens */}
          {!searchTerm && (
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
          )}

          {/* Token List */}
          <div className="space-y-2">
            {/* Section Header */}
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="mdi:trending-up" className="w-4 h-4" />
                <span>Token berdasarkan volume 24 jam</span>
              </div>
            )}

            {/* Tokens */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {getFilteredTokens([...popularTokens, ...additionalTokens]).map(
                (token) => (
                  <div
                    key={token.symbol}
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
                      <div className="font-medium">{token.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {token.address.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* No Results */}
            {searchTerm &&
              getFilteredTokens([...popularTokens, ...additionalTokens])
                .length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon
                    name="mdi:help-circle"
                    className="w-12 h-12 mx-auto mb-2 opacity-50"
                  />
                  <p>Token tidak ditemukan</p>
                  <p className="text-sm">Coba kata kunci yang berbeda</p>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
