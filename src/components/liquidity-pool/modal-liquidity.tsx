"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TokenSelectionModal } from "./token-selection-modal";

interface ModalLiquidityProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
  setModalData: (data: any) => void;
}

export function ModalLiquidity({
  open,
  setOpen,
  setShowConfirmModal,
  setModalData,
}: ModalLiquidityProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTokenA, setSelectedTokenA] = useState("BNB");
  const [selectedTokenB, setSelectedTokenB] = useState("BAKSO URAT");
  const [selectedFeeTier, setSelectedFeeTier] = useState("0.3");
  const [hookEnabled, setHookEnabled] = useState(false);
  const [startingPrice, setStartingPrice] = useState(""); // Default starting price for testing
  const [rangeType, setRangeType] = useState("full"); // "full" or "custom"
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("∞");
  const [bnbAmount, setBnbAmount] = useState("0");
  const [buAmount, setBuAmount] = useState("0");
  const [baseToken, setBaseToken] = useState("BNB"); // "BNB" or "BU"
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [lastUpdatedField, setLastUpdatedField] = useState<"bnb" | "bu" | null>(
    null
  );

  // Token prices in USD (would typically come from an API)
  const [tokenPrices, setTokenPrices] = useState({
    BNB: 625.34, // Example: BNB price in USD
    BU: 0.0001375, // Example: BU price in USD (0.00000022 × $625.34)
  });

  // Token balances
  const [tokenBalances] = useState({
    BNB: 1000.0,
    BU: 1000000.28,
  });

  // Update BU price based on BNB price and starting price
  useEffect(() => {
    const rate = parseFloat(startingPrice);
    if (!isNaN(rate) && rate > 0 && tokenPrices.BNB > 0) {
      let buPriceUSD;

      if (baseToken === "BNB") {
        // BNB selected: rate BNB = 1 BU → 1 BU = rate * BNB_price
        buPriceUSD = rate * tokenPrices.BNB;
      } else {
        // BU selected: rate BU = 1 BNB → 1 BU = BNB_price / rate
        buPriceUSD = tokenPrices.BNB / rate;
      }

      setTokenPrices((prev) => ({
        ...prev,
        BU: buPriceUSD,
      }));
    }
  }, [startingPrice, tokenPrices.BNB, baseToken]);

  // Calculate USD values for token amounts
  const calculateUSDValue = (tokenSymbol: string, amount: string) => {
    const tokenAmount = parseFloat(amount);
    if (isNaN(tokenAmount) || tokenAmount === 0) return "US$0";

    const price =
      tokenSymbol === tokenAData.symbol ? tokenPrices.BNB : tokenPrices.BU;
    const usdValue = tokenAmount * price;

    return `US$${formatUSDWithoutRounding(usdValue)}`;
  };

  // Calculate total pool value in USD
  // Total pool value = nilai dari salah satu token (karena keduanya harus sama)
  // Ini adalah total contribution yang dikeluarkan user, bukan BNB + BU
  const calculateTotalPoolValue = () => {
    const bnbValue = parseFloat(bnbAmount) || 0;
    const buValue = parseFloat(buAmount) || 0;

    if (bnbValue === 0 && buValue === 0) return "US$0";

    // Gunakan nilai USD dari token yang memiliki input
    // Karena auto-calculation memastikan kedua token memiliki nilai USD yang sama
    const bnbUSD = bnbValue * tokenPrices.BNB;
    const buUSD = buValue * tokenPrices.BU;

    // Ambil nilai dari token yang tidak nol, atau BNB jika keduanya ada nilai
    const contributionUSD = bnbValue > 0 ? bnbUSD : buUSD;

    return `US$${formatUSDWithoutRounding(contributionUSD)}`;
  };

  // Validation functions
  const isBnbAmountValid = () => {
    const amount = parseFloat(bnbAmount) || 0;
    return amount <= tokenBalances.BNB;
  };

  const isBuAmountValid = () => {
    const amount = parseFloat(buAmount) || 0;
    return amount <= tokenBalances.BU;
  };

  const isAllAmountsValid = () => {
    return isBnbAmountValid() && isBuAmountValid();
  };

  // Token selection modals
  const [showTokenAModal, setShowTokenAModal] = useState(false);
  const [showTokenBModal, setShowTokenBModal] = useState(false);

  // Selected token objects
  const [tokenAData, setTokenAData] = useState({
    symbol: "BNB",
    name: "Binance Coin",
    icon: "cryptocurrency-color:bnb",
  });
  const [tokenBData, setTokenBData] = useState({
    symbol: "BU",
    name: "Bakso Urat",
    icon: "mdi:food",
  });

  // Auto-calculate token amounts based on starting price
  useEffect(() => {
    if (!lastUpdatedField || !startingPrice || startingPrice === "0") return;

    const rate = parseFloat(startingPrice);
    if (isNaN(rate) || rate === 0) return;

    if (lastUpdatedField === "bnb" && bnbAmount) {
      const bnbValue = parseFloat(bnbAmount);
      if (!isNaN(bnbValue) && bnbValue > 0) {
        // BNB selected: rate BNB = 1 BU → BNB ÷ rate = BU
        // BU selected: rate BU = 1 BNB → BNB × rate = BU
        const buValue = baseToken === "BNB" ? bnbValue / rate : bnbValue * rate;
        setBuAmount(buValue.toString());
      } else if (bnbValue === 0) {
        setBuAmount("0");
      }
    } else if (lastUpdatedField === "bu" && buAmount) {
      const buValue = parseFloat(buAmount);
      if (!isNaN(buValue) && buValue > 0) {
        // BNB selected: rate BNB = 1 BU → BU × rate = BNB
        // BU selected: rate BU = 1 BNB → BU ÷ rate = BNB
        const bnbValue = baseToken === "BNB" ? buValue * rate : buValue / rate;
        setBnbAmount(bnbValue.toString());
      } else if (buValue === 0) {
        setBnbAmount("0");
      }
    }
  }, [bnbAmount, buAmount, startingPrice, baseToken, lastUpdatedField]);

  const tokens = [
    { symbol: "ETH", name: "Ethereum", icon: "cryptocurrency-color:eth" },
    { symbol: "BTC", name: "Bitcoin", icon: "cryptocurrency-color:btc" },
    { symbol: "USDC", name: "USD Coin", icon: "cryptocurrency-color:usdc" },
    { symbol: "USDT", name: "Tether", icon: "cryptocurrency-color:usdt" },
    { symbol: "BNB", name: "BNB", icon: "cryptocurrency-color:bnb" },
  ];

  const feeTiers = [
    { value: "0.01", label: "0.01%", description: "Untuk stablecoin" },
    { value: "0.05", label: "0.05%", description: "Untuk trading standar" },
    {
      value: "0.3",
      label: "0.3%",
      description: "Untuk sebagian besar pair",
      recommended: true,
    },
    { value: "1", label: "1%", description: "Untuk pair eksotik" },
  ];

  const handleContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Handle final submission
      toast.success("Liquidity added successfully!");
      setOpen(false);
    }
  };

  const handleSelectTokenA = (token: any) => {
    setTokenAData(token);
    setSelectedTokenA(token.symbol);
  };

  const handleSelectTokenB = (token: any) => {
    setTokenBData(token);
    setSelectedTokenB(token.symbol);
  };

  // Handler for BNB amount changes
  const handleBnbAmountChange = (value: string) => {
    setBnbAmount(value);
    setLastUpdatedField("bnb");
  };

  // Handler for BU amount changes
  const handleBuAmountChange = (value: string) => {
    setBuAmount(value);
    setLastUpdatedField("bu");
  };

  // Check if auto-calculated amount exceeds balance
  const hasAutoCalculationError = () => {
    if (lastUpdatedField === "bnb") {
      // User input BNB, BU was auto-calculated
      const calculatedBu = parseFloat(buAmount) || 0;
      return calculatedBu > tokenBalances.BU;
    } else if (lastUpdatedField === "bu") {
      // User input BU, BNB was auto-calculated
      const calculatedBnb = parseFloat(bnbAmount) || 0;
      return calculatedBnb > tokenBalances.BNB;
    }
    return false;
  };

  // Handler for starting price changes
  const handleStartingPriceChange = (value: string) => {
    setStartingPrice(value);
    // Reset last updated field so auto-calculation doesn't trigger immediately
    setLastUpdatedField(null);
  };

  // Helper function untuk menentukan decimal places berdasarkan nilai
  const getDecimalPlaces = (value: number) => {
    if (value === 0) return 2;
    if (value < 0.001) return 8; // Angka sangat kecil seperti 0.00000022
    return 2; // Angka normal seperti 1.00003254
  };

  // Helper function untuk format USD tanpa pembulatan
  const formatUSDWithoutRounding = (value: number) => {
    if (value === 0) return "0.00";

    // Smart formatting sesuai requirement user
    const formatSmartDecimal = (num: number): string => {
      if (num === 0) return "0";

      // Rule: jika < 0.01 tampil utuh, jika >= 0.01 tampil 2 decimal places
      if (num < 0.01) {
        // Untuk angka kecil, tampil semua digit signifikan
        const str = num.toFixed(20);
        return str.replace(/\.?0+$/, "");
      } else {
        // Untuk angka >= 0.01, tampil 2 decimal places
        return num.toFixed(2);
      }
    };

    return formatSmartDecimal(value);
  };

  // Handler for swapping token amounts
  const handleSwapAmounts = () => {
    const tempBnb = bnbAmount;
    const tempBu = buAmount;
    setBnbAmount(tempBu);
    setBuAmount(tempBnb);
    setLastUpdatedField(null);
  };

  // Calculate conversion rate display
  const getConversionRate = () => {
    const rate = parseFloat(startingPrice);
    if (isNaN(rate) || rate === 0) return null;

    if (baseToken === "BNB") {
      // BNB selected: rate BNB = 1 BU → 1 BNB = (1/rate) BU
      const buPerBnb = 1 / rate;
      return `1 ${tokenAData.symbol} = ${buPerBnb.toLocaleString()} ${
        tokenBData.symbol
      }`;
    } else {
      // BU selected: rate BU = 1 BNB → 1 BU = (1/rate) BNB
      const bnbPerBu = 1 / rate;
      return `1 ${tokenBData.symbol} = ${bnbPerBu.toLocaleString()} ${
        tokenAData.symbol
      }`;
    }
  };

  const canContinue =
    currentStep === 1 ? selectedTokenA && selectedTokenB : true;

  const resetForm = () => {
    setSelectedTokenA("BNB");
    setSelectedTokenB("BU");
    setSelectedFeeTier("0.3");
    setHookEnabled(false);
    setCurrentStep(1);
    setBaseToken("BU");
    setStartingPrice("0.00000022"); // Default starting price
    setRangeType("full");
    setMinPrice("0");
    setMaxPrice("∞");
    setBnbAmount("0");
    setBuAmount("0");
    setIsWalletConnected(false);
    setLastUpdatedField(null);
    setTokenAData({
      symbol: "BNB",
      name: "Binance Coin",
      icon: "cryptocurrency-color:bnb",
    });
    setTokenBData({
      symbol: "BU",
      name: "Bakso Urat",
      icon: "mdi:food",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Steps */}
          <div className="w-80 bg-muted/30 border-r p-6 flex flex-col h-full">
            <DialogHeader className="mb-8 flex-shrink-0">
              <DialogTitle className="text-xl font-semibold">
                Posisi baru
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
                  <h3 className="font-medium text-sm">Langkah 1</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pilih pasangan token dan biaya
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
                  <h3 className="font-medium text-sm">Langkah 2</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tetapkan rentang harga dan jumlah setoran
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            <div
              className={`p-8 ${
                currentStep === 2 ? "overflow-y-scroll" : "overflow-hidden"
              }`}
              style={currentStep === 2 ? { height: "85vh" } : {}}
            >
              {currentStep === 1 ? (
                <div className="space-y-4">
                  {/* Header Controls */}
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={resetForm}
                    >
                      <Icon name="mdi:refresh" className="w-4 h-4 mr-1" />
                      Setel ulang
                    </Button>

                    <Select value="v4">
                      <SelectTrigger className="h-8 w-auto px-3 text-xs">
                        <SelectValue>Posisi v4</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v4">Posisi v4</SelectItem>
                        <SelectItem value="v3">Posisi v3</SelectItem>
                        <SelectItem value="v2">Posisi v2</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Icon name="mdi:cog" className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Token Pair Selection */}
                  <div>
                    <h2 className="text-lg font-semibold mb-6">
                      Pilih pasangan
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Pilih token yang ingin kamu sediakan likuiditasnya. Kamu
                      dapat memilih token di semua jaringan yang didukung.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Token A */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowTokenAModal(true)}
                          className="h-14 px-4 w-full justify-start"
                        >
                          <div className="flex items-center gap-3">
                            <Icon name={tokenAData.icon} className="w-6 h-6" />
                            <span className="font-medium">
                              {tokenAData.symbol}
                            </span>
                          </div>
                        </Button>
                      </div>

                      {/* Token B */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowTokenBModal(true)}
                          className="h-14 px-4 w-full justify-start"
                        >
                          {tokenBData ? (
                            <div className="flex items-center gap-3">
                              <Icon
                                name={tokenBData.icon}
                                className="w-6 h-6"
                              />
                              <span className="font-medium">
                                {tokenBData.symbol}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Pilih token
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Hook Option */}
                    {!hookEnabled ? (
                      <div className="mt-6">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setHookEnabled(true)}
                        >
                          <Icon
                            name="mdi:hook"
                            className="text-muted-foreground"
                          />
                          <span className="text-sm text-muted-foreground">
                            Tambahkan Hook (Lanjutan)
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
                                <p>
                                  Hook memungkinkan fungsionalitas kustom untuk
                                  pool ini
                                </p>
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
                            placeholder="Masukkan alamat hook"
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

                  {/* Fee Tier Selection */}
                  <div>
                    <h3 className="font-semibold mb-2">Tingkatan komisi</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Jumlah yang diperoleh dari penyediaan likuiditas. Pilihlah
                      jumlah yang sesuai dengan toleransi risiko dan strategimu.
                    </p>

                    <div className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            Tingkatan komisi{" "}
                            {
                              feeTiers.find((t) => t.value === selectedFeeTier)
                                ?.label
                            }
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            % yang akan kamu peroleh dalam bentuk biaya
                          </div>
                        </div>
                        <Select
                          value={selectedFeeTier}
                          onValueChange={setSelectedFeeTier}
                        >
                          <SelectTrigger className="w-auto h-8 text-xs">
                            <SelectValue>Lainnya</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {feeTiers.map((tier) => (
                              <SelectItem key={tier.value} value={tier.value}>
                                <div className="flex items-center justify-between w-full min-w-48">
                                  <div>
                                    <div className="font-medium text-sm">
                                      Tingkatan komisi {tier.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {tier.description}
                                    </div>
                                  </div>
                                  {tier.recommended && (
                                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded ml-2">
                                      Terbaik
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header Controls */}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={resetForm}
                    >
                      <Icon name="mdi:refresh" className="w-4 h-4 mr-1" />
                      Setel ulang
                    </Button>

                    <Select value="v4">
                      <SelectTrigger className="h-8 w-auto px-3 text-xs">
                        <SelectValue>Posisi v4</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v4">Posisi v4</SelectItem>
                        <SelectItem value="v3">Posisi v3</SelectItem>
                        <SelectItem value="v2">Posisi v2</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Icon name="mdi:cog" className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Token Pair Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Icon name={tokenAData.icon} className="w-6 h-6" />
                      <Icon name={tokenBData.icon} className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">
                      {tokenAData.symbol} / {tokenBData.symbol}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-1 rounded text-xs">
                        v4
                      </span>
                      <span className="bg-muted px-2 py-1 rounded text-xs">
                        0.3%
                      </span>
                    </div>
                  </div>

                  {/* Pool Creation Notice */}
                  <div className="p-4 border rounded-lg bg-muted/20 mb-6">
                    <div className="flex items-start gap-3">
                      <Icon
                        name="mdi:information"
                        className="text-muted-foreground mt-0.5"
                      />
                      <div>
                        <h3 className="font-medium mb-2">Membuat pool baru</h3>
                        <p className="text-sm text-muted-foreground">
                          Pilihanmu akan membuat pool likuiditas baru, yang
                          dapat mengakibatkan likuiditas awal yang lebih rendah
                          dan peningkatan volatilitas. Pertimbangkan untuk
                          menambahkan likuiditas ke pool yang sudah ada untuk
                          meminimalkan risiko ini.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Starting Price */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">
                        Tentukan harga awal
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Saat membuat pool baru, kamu harus menetapkan nilai
                        tukar awal untuk kedua token. Nilai ini akan
                        mencerminkan harga pasar awal.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Harga awal
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={startingPrice}
                              onChange={(e) =>
                                handleStartingPriceChange(e.target.value)
                              }
                              className="flex-1 h-12 px-4 bg-background border border-border rounded-lg text-lg font-mono"
                            />
                            <div className="flex border border-border rounded-lg overflow-hidden">
                              <button
                                type="button"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                  baseToken === "BNB"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted"
                                }`}
                                onClick={() => setBaseToken("BNB")}
                              >
                                <Icon
                                  name={tokenAData.icon}
                                  className="w-4 h-4"
                                />
                                <span>{tokenAData.symbol}</span>
                              </button>
                              <button
                                type="button"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                  baseToken === "BU"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted"
                                }`}
                                onClick={() => setBaseToken("BU")}
                              >
                                <Icon
                                  name={tokenBData.icon}
                                  className="w-4 h-4"
                                />
                                <span>{tokenBData.symbol}</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {baseToken === "BNB"
                              ? `${tokenAData.symbol} = 1 ${tokenBData.symbol}`
                              : `${tokenBData.symbol} = 1 ${tokenAData.symbol}`}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">
                            Harga pasar:{" "}
                            {(() => {
                              const rate = parseFloat(startingPrice);
                              if (isNaN(rate) || rate === 0) {
                                return baseToken === "BNB"
                                  ? `0 ${tokenAData.symbol} = 1 ${tokenBData.symbol} (US$0.00)`
                                  : `0 ${tokenBData.symbol} = 1 ${tokenAData.symbol} (US$0.00)`;
                              }

                              // Format number sesuai requirement user
                              const formatRateWithoutRounding = (
                                value: number
                              ) => {
                                if (value === 0) return "0";

                                // Rule: jika < 0.01 tampil utuh, jika >= 0.01 tampil 2 decimal places
                                let result;
                                if (value < 0.01) {
                                  // Untuk angka kecil, tampil semua digit signifikan
                                  const str = value.toFixed(20);
                                  result = str.replace(/\.?0+$/, "");
                                } else {
                                  // Untuk angka >= 0.01, tampil 2 decimal places
                                  result = value.toFixed(2);
                                }

                                // Jika angka >= 1000, gunakan toLocaleString untuk formatting
                                const numValue = parseFloat(result);
                                if (numValue >= 1000) {
                                  return numValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  });
                                }

                                return result;
                              };

                              const formattedRate =
                                formatRateWithoutRounding(rate);

                              // Calculate USD price berdasarkan interpretasi yang benar
                              let usdPrice;
                              if (baseToken === "BNB") {
                                // BNB base: rate BNB = 1 BU → 1 BU = rate * BNB_price
                                usdPrice = rate * tokenPrices.BNB;
                              } else {
                                // BU base: rate BU = 1 BNB → 1 BNB = tokenPrices.BNB (tidak berubah)
                                usdPrice = tokenPrices.BNB;
                              }

                              // Format display berdasarkan baseToken
                              if (baseToken === "BNB") {
                                // BNB selected: input X BNB = 1 BU
                                return `${formattedRate} ${
                                  tokenAData.symbol
                                } = 1 ${
                                  tokenBData.symbol
                                } (US$${formatUSDWithoutRounding(
                                  rate * tokenPrices.BNB
                                )})`;
                              } else {
                                // BU selected: input X BU = 1 BNB
                                return `${formattedRate} ${
                                  tokenBData.symbol
                                } = 1 ${
                                  tokenAData.symbol
                                } (US$${formatUSDWithoutRounding(
                                  tokenPrices.BNB
                                )})`;
                              }
                            })()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              // Use market price - update starting price to match current market
                              const marketRate =
                                baseToken === "BNB"
                                  ? tokenPrices.BNB / tokenPrices.BU
                                  : tokenPrices.BU / tokenPrices.BNB;
                              handleStartingPriceChange(marketRate.toString());
                            }}
                          >
                            Gunakan harga pasar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">
                          Tetapkan rentang harga
                        </h3>

                        <div className="flex gap-2 mb-4">
                          <Button
                            variant={
                              rangeType === "full" ? "default" : "outline"
                            }
                            className="flex-1"
                            onClick={() => setRangeType("full")}
                          >
                            Rentang penuh
                          </Button>
                          <Button
                            variant={
                              rangeType === "custom" ? "default" : "outline"
                            }
                            className="flex-1"
                            onClick={() => setRangeType("custom")}
                          >
                            Rentang khusus
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          Penentuan likuiditas rentang penuh saat pembuatan pool
                          memastikan partisipasi pasar berkelanjutan di semua
                          kemungkinan harga. Prosesnya akan lebih sederhana,
                          tetapi potensi kerugian non-permanen lebih tinggi.
                        </p>

                        {rangeType === "custom" && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 border rounded-lg">
                              <label className="text-sm text-muted-foreground mb-2 block">
                                Harga minimum
                              </label>
                              <input
                                type="text"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full h-12 px-4 bg-background border-0 rounded-lg text-xl font-mono mb-2 focus:outline-none"
                                placeholder="0"
                              />
                              <div className="text-sm text-muted-foreground">
                                {tokenBData.symbol} = 1 {tokenAData.symbol}
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <label className="text-sm text-muted-foreground mb-2 block">
                                Harga maksimum
                              </label>
                              <input
                                type="text"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full h-12 px-4 bg-background border-0 rounded-lg text-xl font-mono mb-2 focus:outline-none"
                                placeholder="∞"
                              />
                              <div className="text-sm text-muted-foreground">
                                {tokenBData.symbol} = 1 {tokenAData.symbol}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Token Deposit */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Setor token</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Tentukan jumlah token untuk kontribusi likuiditasmu.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div
                            className={`p-4 border rounded-lg bg-muted/50 ${
                              !isBnbAmountValid()
                                ? "border-red-500 bg-red-500/5"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={bnbAmount}
                                onChange={(e) =>
                                  handleBnbAmountChange(e.target.value)
                                }
                                className={`flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground ${
                                  !isBnbAmountValid() ? "text-red-500" : ""
                                }`}
                                placeholder="0"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() =>
                                    handleBnbAmountChange(
                                      tokenBalances.BNB.toString()
                                    )
                                  }
                                >
                                  MAX
                                </Button>
                                <Icon
                                  name={tokenAData.icon}
                                  className="w-6 h-6"
                                />
                                <span className="font-medium">
                                  {tokenAData.symbol}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span
                                className={
                                  !isBnbAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {calculateUSDValue(
                                  tokenAData.symbol,
                                  bnbAmount
                                )}
                              </span>
                              <span
                                className={
                                  !isBnbAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                Balance: {tokenBalances.BNB.toLocaleString()}{" "}
                                {tokenAData.symbol}
                              </span>
                            </div>
                            {!isBnbAmountValid() && (
                              <div className="text-red-500 text-xs mt-2">
                                {lastUpdatedField === "bu" &&
                                hasAutoCalculationError()
                                  ? "Auto-calculation melebihi saldo BNB yang tersedia"
                                  : "Jumlah melebihi saldo yang tersedia"}
                              </div>
                            )}
                          </div>

                          {/* Swap Button */}
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-10 h-10 p-0 rounded-full border bg-background hover:bg-muted"
                              onClick={handleSwapAmounts}
                            >
                              <Icon
                                name="mdi:swap-vertical"
                                className="w-5 h-5"
                              />
                            </Button>
                          </div>

                          <div
                            className={`p-4 border rounded-lg bg-muted/50 ${
                              !isBuAmountValid()
                                ? "border-red-500 bg-red-500/5"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={buAmount}
                                onChange={(e) =>
                                  handleBuAmountChange(e.target.value)
                                }
                                className={`flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground ${
                                  !isBuAmountValid() ? "text-red-500" : ""
                                }`}
                                placeholder="0"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() =>
                                    handleBuAmountChange(
                                      tokenBalances.BU.toString()
                                    )
                                  }
                                >
                                  MAX
                                </Button>
                                <Icon
                                  name={tokenBData.icon}
                                  className="w-6 h-6"
                                />
                                <span className="font-medium">
                                  {tokenBData.symbol}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span
                                className={
                                  !isBuAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {calculateUSDValue(tokenBData.symbol, buAmount)}
                              </span>
                              <span
                                className={
                                  !isBuAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                Balance: {tokenBalances.BU.toLocaleString()}{" "}
                                {tokenBData.symbol}
                              </span>
                            </div>
                            {!isBuAmountValid() && (
                              <div className="text-red-500 text-xs mt-2">
                                {lastUpdatedField === "bnb" &&
                                hasAutoCalculationError()
                                  ? "Auto-calculation melebihi saldo BU yang tersedia"
                                  : "Jumlah melebihi saldo yang tersedia"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Conversion Rate Display */}
                        {getConversionRate() && (
                          <div className="p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Icon
                                name="mdi:swap-horizontal"
                                className="w-4 h-4 text-muted-foreground"
                              />
                              <span className="text-sm font-medium">
                                {getConversionRate()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Debug Display - temporary */}
                        {/* <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                          <div className="text-xs text-red-700 mb-2 font-semibold">
                            Debug Info (sementara)
                          </div>
                          <div className="text-xs space-y-1">
                            <div>BNB Amount: {bnbAmount}</div>
                            <div>BU Amount: {buAmount}</div>
                            <div>BNB Balance: {tokenBalances.BNB}</div>
                            <div>BU Balance: {tokenBalances.BU}</div>
                            <div
                              className={`${
                                !isBnbAmountValid()
                                  ? "text-red-500 font-bold"
                                  : ""
                              }`}
                            >
                              BNB Valid:{" "}
                              {isBnbAmountValid() ? "✅" : "❌ MELEBIHI SALDO"}
                            </div>
                            <div
                              className={`${
                                !isBuAmountValid()
                                  ? "text-red-500 font-bold"
                                  : ""
                              }`}
                            >
                              BU Valid:{" "}
                              {isBuAmountValid() ? "✅" : "❌ MELEBIHI SALDO"}
                            </div>
                            <div
                              className={`${
                                hasAutoCalculationError()
                                  ? "text-red-500 font-bold"
                                  : ""
                              }`}
                            >
                              Auto-Calc Error:{" "}
                              {hasAutoCalculationError() ? "❌ YA" : "✅ TIDAK"}
                            </div>
                            <div>
                              BNB USD Value:{" "}
                              {calculateUSDValue(tokenAData.symbol, bnbAmount)}
                            </div>
                            <div>
                              BU USD Value:{" "}
                              {calculateUSDValue(tokenBData.symbol, buAmount)}
                            </div>
                            <div>Total Pool: {calculateTotalPoolValue()}</div>
                          </div>
                        </div> */}

                        {/* Market Prices Display */}
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">
                            Harga Pasar Saat Ini
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon
                                  name={tokenAData.icon}
                                  className="w-4 h-4"
                                />
                                <span>{tokenAData.symbol}</span>
                              </div>
                              <span className="font-mono">
                                US$
                                {tokenPrices.BNB.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon
                                  name={tokenBData.icon}
                                  className="w-4 h-4"
                                />
                                <span>{tokenBData.symbol}</span>
                              </div>
                              <span className="font-mono">
                                US${formatUSDWithoutRounding(tokenPrices.BU)}
                              </span>
                            </div>
                          </div>

                          {/* Total Pool Value */}
                          {(parseFloat(bnbAmount) > 0 ||
                            parseFloat(buAmount) > 0) && (
                            <div className="pt-3 border-t border-muted">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon
                                    name="mdi:pool"
                                    className="w-4 h-4 text-muted-foreground"
                                  />
                                  <span className="text-sm font-medium">
                                    Total Nilai Pool
                                  </span>
                                </div>
                                <span className="font-mono text-sm font-bold">
                                  {calculateTotalPoolValue()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Connect Wallet / Review Button */}
                        {!isWalletConnected ? (
                          <Button
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => setIsWalletConnected(true)}
                          >
                            Hubungkan dompet
                          </Button>
                        ) : !isAllAmountsValid() ? (
                          <Button
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white cursor-not-allowed"
                            disabled
                          >
                            Saldo tidak mencukupi
                          </Button>
                        ) : (
                          <Button
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              setModalData({
                                rangeType,
                                minPrice,
                                maxPrice,
                                startingPrice,
                                baseToken,
                                bnbAmount,
                                buAmount,
                                tokenPrices,
                                calculateUSDValue,
                                calculateTotalPoolValue,
                              });
                              setOpen(false); // Close main modal first
                              setShowConfirmModal(true);
                            }}
                          >
                            Tinjau
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Only show on step 1 */}
            {currentStep === 1 && (
              <div className="border-t p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="ml-auto">
                    <Button
                      onClick={handleContinue}
                      disabled={!canContinue}
                      className="px-8"
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Token Selection Modals */}
      <TokenSelectionModal
        open={showTokenAModal}
        setOpen={setShowTokenAModal}
        onSelectToken={handleSelectTokenA}
        selectedToken={selectedTokenA}
      />

      <TokenSelectionModal
        open={showTokenBModal}
        setOpen={setShowTokenBModal}
        onSelectToken={handleSelectTokenB}
        selectedToken={selectedTokenB}
      />
    </Dialog>
  );
}
