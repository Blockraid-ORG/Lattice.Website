"use client";

import { useState } from "react";
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
  const [selectedTokenA, setSelectedTokenA] = useState("ETH");
  const [selectedTokenB, setSelectedTokenB] = useState("");
  const [selectedFeeTier, setSelectedFeeTier] = useState("0.3");
  const [hookEnabled, setHookEnabled] = useState(false);
  const [startingPrice, setStartingPrice] = useState("0.00000000000009");
  const [rangeType, setRangeType] = useState("full"); // "full" or "custom"
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("∞");
  const [bnbAmount, setBnbAmount] = useState("0");
  const [buAmount, setBuAmount] = useState("0");
  const [baseToken, setBaseToken] = useState("BNB"); // "BNB" or "BU"
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Token selection modals
  const [showTokenAModal, setShowTokenAModal] = useState(false);
  const [showTokenBModal, setShowTokenBModal] = useState(false);

  // Selected token objects
  const [tokenAData, setTokenAData] = useState({
    symbol: "ETH",
    name: "Ethereum",
    icon: "cryptocurrency-color:eth",
  });
  const [tokenBData, setTokenBData] = useState(null);

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

  const canContinue =
    currentStep === 1 ? selectedTokenA && selectedTokenB : true;

  const resetForm = () => {
    setSelectedTokenA("ETH");
    setSelectedTokenB("");
    setSelectedFeeTier("0.3");
    setHookEnabled(false);
    setCurrentStep(1);
    setBaseToken("BNB");
    setStartingPrice("0.00000000000009");
    setRangeType("full");
    setMinPrice("0");
    setMaxPrice("∞");
    setBnbAmount("0");
    setBuAmount("0");
    setIsWalletConnected(false);
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
                      <Icon
                        name="cryptocurrency-color:bnb"
                        className="w-6 h-6"
                      />
                      <Icon
                        name="cryptocurrency-color:btc"
                        className="w-6 h-6"
                      />
                    </div>
                    <span className="font-semibold text-lg">BNB / BU</span>
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
                              onChange={(e) => setStartingPrice(e.target.value)}
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
                                  name="cryptocurrency-color:bnb"
                                  className="w-4 h-4"
                                />
                                <span>BNB</span>
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
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    BU
                                  </span>
                                </div>
                                <span>BU</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {baseToken === "BNB" ? "BU = 1 BNB" : "BNB = 1 BU"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">
                            Harga pasar:{" "}
                            {baseToken === "BNB"
                              ? "<0.00001 BU = 1 BNB (-)"
                              : "<0.00001 BNB = 1 BU (-)"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
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
                                BU = 1 BNB
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
                                BU = 1 BNB
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
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={bnbAmount}
                                onChange={(e) => setBnbAmount(e.target.value)}
                                className="flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground"
                                placeholder="0"
                              />
                              <div className="flex items-center gap-2">
                                <Icon
                                  name="cryptocurrency-color:bnb"
                                  className="w-6 h-6"
                                />
                                <span className="font-medium">BNB</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              US$0
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={buAmount}
                                onChange={(e) => setBuAmount(e.target.value)}
                                className="flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground"
                                placeholder="0"
                              />
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    BU
                                  </span>
                                </div>
                                <span className="font-medium">BU</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              US$0
                            </div>
                          </div>
                        </div>

                        {/* Connect Wallet / Review Button */}
                        {!isWalletConnected ? (
                          <Button
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => setIsWalletConnected(true)}
                          >
                            Hubungkan dompet
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
