"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  startTransition,
} from "react";
import BigNumber from "bignumber.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
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
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useUniswapV3SDK } from "@/hooks/useUniswapV3SDK";

interface ModalLiquidityProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
  setModalData: (data: any) => void;
  projectData?: {
    name: string;
    ticker: string;
    contractAddress?: string;
    chains: Array<{
      chain: {
        id: string;
        name: string;
        ticker: string;
        logo: string;
        urlScanner: string;
        type: string;
        chainid: number;
      };
    }>;
    logo: string;
  };
}

export function ModalLiquidity({
  open,
  setOpen,
  setShowConfirmModal,
  setModalData,
  projectData,
}: ModalLiquidityProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTokenA, setSelectedTokenA] = useState("");
  const [selectedTokenB, setSelectedTokenB] = useState(projectData?.ticker);
  const [selectedFeeTier, setSelectedFeeTier] = useState("0.05");
  const [hookEnabled, setHookEnabled] = useState(false);
  const [startingPrice, setStartingPrice] = useState(""); // Default starting price for testing
  const [rangeType, setRangeType] = useState("full"); // "full" or "custom"
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("∞");
  const [tokenAAmount, setTokenAAmount] = useState("0");
  const [tokenBAmount, setTokenBAmount] = useState("0");
  const [baseToken, setBaseToken] = useState("TokenA"); // "TokenA" or "TokenB"
  const [lastUpdatedField, setLastUpdatedField] = useState<
    "tokenA" | "tokenB" | null
  >(null);

  // Ref untuk menyimpan calculated project token price (avoid setState loops)
  const calculatedProjectTokenPriceRef = useRef<BigNumber>(new BigNumber(0));
  const [displayProjectTokenPrice, setDisplayProjectTokenPrice] =
    useState<BigNumber>(new BigNumber(0));

  // Check wallet connection status using Web3Auth
  const { isConnected: isWalletConnected, connect } = useWeb3AuthConnect();

  // 🎯 Safe chainId extraction from project data
  const projectChainId = projectData?.chains?.[0]?.chain?.chainid;
  const isChainIdReady = projectChainId !== undefined;

  // 🔒 Only initialize SDK when chainId is available
  const {
    isReady: isSDKReady,
    isConnecting: isSDKConnecting,
    error: sdkError,
  } = useUniswapV3SDK(projectChainId || 56); // Fallback only for hook initialization

  // State untuk user address
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Utility function to get correct decimals for each token
  const getCorrectDecimals = (tokenSymbol: string, address?: string) => {
    // Known USDC addresses with 6 decimals
    const usdcAddresses = [
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // Native USDC Arbitrum
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC BSC
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC.e Arbitrum
    ];

    if (
      tokenSymbol?.toUpperCase() === "USDC" ||
      (address && usdcAddresses.includes(address.toLowerCase()))
    ) {
      return 6; // USDC always has 6 decimals
    }

    // Most other tokens use 18 decimals (ETH standard)
    return 18;
  };

  // Effect untuk mendapatkan user address ketika wallet connected
  useEffect(() => {
    const getUserAddress = async () => {
      if (isWalletConnected) {
        try {
          const web3Provider = await connect();
          if (web3Provider) {
            const result = await web3Provider.request({
              method: "eth_accounts",
            });
            const accounts = Array.isArray(result) ? (result as string[]) : [];
            if (accounts.length > 0) {
              setUserAddress(accounts[0]);
            } else {
              setUserAddress(null);
            }
          } else {
            ("⚠️ Web3 provider not available");
            setUserAddress(null);
          }
        } catch (error) {
          setUserAddress(null);
        }
      } else {
        setUserAddress(null);
      }
    };

    getUserAddress();
  }, [isWalletConnected, connect]);

  // Memoized token address mapping untuk balance reading
  const tokenAddressMap = useMemo(() => {
    // 🚨 Don't build token map if chainId not ready
    if (!isChainIdReady || !projectChainId) {
      return {};
    }

    const map: Record<string, { address?: string; isNative?: boolean }> = {
      // BSC tokens (chainId 56)
      BNB: { isNative: true },
      BUSD: { address: "0xe9e7cea3dedca5984780bafc599bd69add087d56" },
      CAKE: { address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82" },

      // Ethereum tokens (chainId 1)
      ETH: { isNative: true },
      WETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },

      // Polygon tokens (chainId 137)
      MATIC: { isNative: true },

      // Avalanche tokens (chainId 43114)
      AVAX: { isNative: true },
    };

    // Chain-specific token mappings
    if (projectChainId === 42161) {
      // Arbitrum specific tokens - Use Native USDC that user actually has
      map.USDC = { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" }; // Native USDC (Circle) - User has this one
      map["USDC.e"] = { address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" }; // USDC.e (Bridged)
      map.KM = { address: "0xAe771AC9292c84ed2A6625Ae92380DedCF9A5076" }; // KM Token (KOSAN AN)
      map.WETH = { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" }; // WETH Arbitrum
      map.ARB = { address: "0x912ce59144191c1204e64559fe8253a0e49e6548" }; // ARB Arbitrum
      map.USDT = { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" }; // USDT Arbitrum
    } else if (projectChainId === 56) {
      // BSC specific tokens
      map.USDC = { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" }; // BSC USDC
      map.KS = { address: "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc" }; // KS Token (BSC project)
      map.USDT = { address: "0x55d398326f99059fF775485246999027B3197955" }; // BSC USDT
      map.LINK = { address: "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd" }; // BSC LINK
      map.UNI = { address: "0xbf5140a22578168fd562dccf235e5d43a02ce9b1" }; // BSC UNI
    } else {
      // Default fallback (should not happen in production)
      map.USDC = { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" }; // BSC USDC fallback
    }

    return map;
  }, [projectChainId, isChainIdReady]);

  // Remove getTokenConfigSimple to prevent callback dependency issues
  // Logic will be inlined in tokenAConfig and tokenBConfig

  // Selected token objects
  const [tokenAData, setTokenAData] = useState({
    symbol: "",
    name: "",
    icon: "",
  });

  const [tokenBData, setTokenBData] = useState({
    symbol: projectData?.ticker,
    name: projectData?.name,
    icon: "mdi:coin", // Ubah dari mdi:food ke mdi:coin agar konsisten
  });

  // Extract primitive values to prevent object reference loops
  const tokenASymbol = tokenAData.symbol;
  const tokenAName = tokenAData.name;
  const tokenAIcon = tokenAData.icon;

  const tokenBSymbol = tokenBData.symbol;
  const tokenBName = tokenBData.name;
  const tokenBIcon = tokenBData.icon;

  // Inline token configurations to prevent callback dependency issues
  // TEMPORARILY USE STATIC token A config to isolate infinite loop
  const tokenAConfig = {
    symbol: "",
    address: "", // native token
    isNative: true,
    useWalletBalance: true,
  };

  // Original code commented out:
  // const tokenAConfig = useMemo(() => {
  //   const config = tokenAddressMap[tokenASymbol] || {};
  //   return { ... };
  // }, [tokenASymbol]);

  // TEMPORARILY USE STATIC token B config to isolate infinite loop
  const tokenBConfig = {
    symbol: projectData?.ticker,
    address: projectData?.contractAddress,
    isNative: false,
    useWalletBalance: false, // use total supply for project token
  };

  // Original code commented out:
  // const tokenBConfig = useMemo(() => {
  //   const config = tokenAddressMap[tokenBSymbol] || {};
  //   return { ... };
  // }, [tokenBSymbol, projectData?.contractAddress, projectData?.ticker]);

  // TEMPORARILY DISABLE balance fetching to isolate infinite loop
  const tokenABalance = {
    balance: new BigNumber(1000),
    formatted: "1000",
    isLoading: false,
    totalSupply: null,
  };
  const tokenBBalance = {
    balance: new BigNumber(10000),
    formatted: "10,000",
    isLoading: false,
    totalSupply: new BigNumber(10000),
  };
  const balancesLoading = false;
  const balancesError = null;
  const refetchBalances = () => {};
  const balancesInitialized = true;

  // Original code commented out:
  // const {
  //   tokenA: tokenABalance,
  //   tokenB: tokenBBalance,
  //   loading: balancesLoading,
  //   error: balancesError,
  //   refetch: refetchBalances,
  //   isInitialized: balancesInitialized,
  // } = useLiquidityTokenBalances(tokenAConfig, tokenBConfig, {
  //   refreshInterval: 0,
  //   autoRefresh: false,
  //   enabled: open && isWalletConnected,
  // });

  // Calculate USD values for token amounts menggunakan BigNumber untuk precision
  // Gunakan consistent USD value untuk pair tokens agar tidak ada selisih
  const calculateUSDValue = (tokenSymbol: string, amount: string) => {
    const tokenAmount = new BigNumber(amount || 0);
    if (tokenAmount.isZero()) return "US$0";

    const tokenAAmountBN = new BigNumber(tokenAAmount || 0);
    const tokenBAmountBN = new BigNumber(tokenBAmount || 0);

    // Jika kedua token memiliki nilai (auto-calculated pair), gunakan USD value yang consistent
    if (!tokenAAmountBN.isZero() && !tokenBAmountBN.isZero()) {
      // Hitung total pool value berdasarkan token A sebagai referensi (anchor)
      const tokenAPriceBN = tokenPricesBN[tokenASymbol] || new BigNumber(0);
      const totalPoolValueUSD = tokenAAmountBN.multipliedBy(tokenAPriceBN);

      // Untuk full amounts: kedua token menampilkan total pool value
      // Untuk partial amounts: proportional berdasarkan total pool value
      if (
        tokenAmount.isEqualTo(tokenAAmountBN) ||
        tokenAmount.isEqualTo(tokenBAmountBN)
      ) {
        // Jika user input full amount, tampilkan total pool value
        return `US$${formatUSDWithoutRounding(totalPoolValueUSD)}`;
      } else {
        // Jika partial amount, hitung proportional
        const referenceAmount =
          tokenSymbol === tokenASymbol ? tokenAAmountBN : tokenBAmountBN;
        const usdValue = totalPoolValueUSD
          .multipliedBy(tokenAmount)
          .dividedBy(referenceAmount);
        return `US$${formatUSDWithoutRounding(usdValue)}`;
      }
    }

    // Fallback: gunakan individual price calculation (untuk single token input)
    const priceBN =
      !displayProjectTokenPrice.isZero() && tokenSymbol === tokenBSymbol
        ? displayProjectTokenPrice
        : tokenPricesBN[tokenSymbol] || new BigNumber(0);

    const usdValue = tokenAmount.multipliedBy(priceBN);
    return `US$${formatUSDWithoutRounding(usdValue)}`;
  };

  // Calculate total pool value in USD menggunakan BigNumber untuk precision
  // Total pool value = nilai dari salah satu token (karena keduanya harus sama)
  // Ini adalah total contribution yang dikeluarkan user
  const calculateTotalPoolValue = () => {
    const tokenAValue = new BigNumber(tokenAAmount || 0);
    const tokenBValue = new BigNumber(tokenBAmount || 0);

    if (tokenAValue.isZero() && tokenBValue.isZero()) return "US$0";

    // Gunakan nilai USD dari token yang memiliki input
    // Karena auto-calculation memastikan kedua token memiliki nilai USD yang sama
    const tokenAPriceBN = tokenPricesBN[tokenASymbol] || new BigNumber(0);

    // Use calculated project price if available for project token
    const tokenBPriceBN =
      !displayProjectTokenPrice.isZero() && tokenBSymbol
        ? displayProjectTokenPrice
        : (tokenBSymbol ? tokenPricesBN[tokenBSymbol] : new BigNumber(0)) ||
          new BigNumber(0);

    const tokenAUSD = tokenAValue.multipliedBy(tokenAPriceBN);
    const tokenBUSD = tokenBValue.multipliedBy(tokenBPriceBN);

    // Ambil nilai dari token yang tidak nol, atau token A jika keduanya ada nilai
    const contributionUSD = tokenAValue.gt(0) ? tokenAUSD : tokenBUSD;

    return `US$${formatUSDWithoutRounding(contributionUSD)}`;
  };

  // Validation functions menggunakan BigNumber untuk precision
  const isTokenAAmountValid = () => {
    const amount = new BigNumber(tokenAAmount || 0);
    const balance = tokenABalance?.balance || new BigNumber(0);
    return !amount.isZero() && amount.lte(balance);
  };

  const isTokenBAmountValid = () => {
    const amount = new BigNumber(tokenBAmount || 0);
    const balance = tokenBBalance?.balance || new BigNumber(0);
    return !amount.isZero() && amount.lte(balance);
  };

  // Helper functions to check if amount is empty/invalid (separate from balance check)
  const isTokenAAmountEmpty = () => {
    const amount = new BigNumber(tokenAAmount || 0);
    return !tokenAAmount || amount.isZero() || amount.isNaN();
  };

  const isTokenBAmountEmpty = () => {
    const amount = new BigNumber(tokenBAmount || 0);
    return !tokenBAmount || amount.isZero() || amount.isNaN();
  };

  const isAllAmountsValid = () => {
    return isTokenAAmountValid() && isTokenBAmountValid();
  };

  // Comprehensive validation for all required inputs
  const isAllInputsValid = () => {
    // 1. Check if starting price is valid
    const startingPriceBN = new BigNumber(startingPrice || 0);
    if (
      !startingPrice ||
      startingPriceBN.isZero() ||
      startingPriceBN.isNaN() ||
      startingPriceBN.isNegative()
    ) {
      return false;
    }

    // Additional validation for extremely small or large prices
    if (startingPriceBN.lt(0.000000001) || startingPriceBN.gt(1000000000)) {
      return false;
    }

    // 2. Check if amounts are valid and sufficient
    const tokenAAmountBN = new BigNumber(tokenAAmount || 0);
    const tokenBAmountBN = new BigNumber(tokenBAmount || 0);

    if (!tokenAAmount || tokenAAmountBN.isZero() || tokenAAmountBN.isNaN()) {
      return false;
    }

    if (!tokenBAmount || tokenBAmountBN.isZero() || tokenBAmountBN.isNaN()) {
      return false;
    }

    // 3. Check balance validity
    if (!isAllAmountsValid()) {
      return false;
    }

    // 4. If custom range is selected, validate min and max prices
    if (rangeType === "custom") {
      const minPriceBN = new BigNumber(minPrice || 0);
      const maxPriceBN = new BigNumber(maxPrice === "∞" ? 0 : maxPrice || 0);

      // Check min price
      if (!minPrice || minPriceBN.isZero() || minPriceBN.isNaN()) {
        return false;
      }

      // Check max price (if not infinity symbol)
      if (maxPrice !== "∞") {
        if (!maxPrice || maxPriceBN.isZero() || maxPriceBN.isNaN()) {
          return false;
        }

        // Max price should be greater than min price
        if (maxPriceBN.lte(minPriceBN)) {
          return false;
        }
      }
    }

    return true;
  };

  // Helper function to get button text based on validation state
  const getButtonState = () => {
    if (!isWalletConnected) {
      return {
        text: "Connect wallet first",
        disabled: true,
        className:
          "w-full h-12 bg-blue-600 hover:bg-blue-700 text-white cursor-not-allowed",
        icon: "mdi:wallet",
      };
    }

    if (isSDKConnecting) {
      return {
        text: "Initializing Uniswap SDK...",
        disabled: true,
        className:
          "w-full h-12 bg-purple-600 hover:bg-purple-700 text-white cursor-not-allowed",
        icon: "mdi:loading",
      };
    }

    if (!isSDKReady) {
      return {
        text: "Uniswap SDK not ready",
        disabled: true,
        className:
          "w-full h-12 bg-red-600 hover:bg-red-700 text-white cursor-not-allowed",
        icon: "mdi:alert-circle",
      };
    }

    if (balancesLoading || !balancesInitialized) {
      return {
        text: "Loading token balances...",
        disabled: true,
        className:
          "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
        icon: "mdi:loading",
      };
    }

    if (balancesError) {
      return {
        text: "Error fetching balance - try refresh",
        disabled: true,
        className:
          "w-full h-12 bg-red-600 hover:bg-red-700 text-white cursor-not-allowed",
        icon: "mdi:alert-circle",
      };
    }

    if (!isAllInputsValid()) {
      // Check specific validation failures for better error messages
      const startingPriceBN = new BigNumber(startingPrice || 0);
      const tokenAAmountBN = new BigNumber(tokenAAmount || 0);
      const tokenBAmountBN = new BigNumber(tokenBAmount || 0);

      if (
        !startingPrice ||
        startingPriceBN.isZero() ||
        startingPriceBN.isNaN() ||
        startingPriceBN.isNegative()
      ) {
        return {
          text: "Enter valid starting price",
          disabled: true,
          className:
            "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
        };
      }

      if (startingPriceBN.lt(0.000000001) || startingPriceBN.gt(1000000000)) {
        return {
          text: "Starting price out of range",
          disabled: true,
          className:
            "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
        };
      }

      if (!tokenAAmount || tokenAAmountBN.isZero() || tokenAAmountBN.isNaN()) {
        return {
          text: `Enter valid ${tokenASymbol} amount`,
          disabled: true,
          className:
            "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
        };
      }

      if (!tokenBAmount || tokenBAmountBN.isZero() || tokenBAmountBN.isNaN()) {
        return {
          text: `Enter valid ${tokenBSymbol} amount`,
          disabled: true,
          className:
            "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
        };
      }

      if (rangeType === "custom") {
        const minPriceBN = new BigNumber(minPrice || 0);
        const maxPriceBN = new BigNumber(maxPrice === "∞" ? 0 : maxPrice || 0);

        if (!minPrice || minPriceBN.isZero() || minPriceBN.isNaN()) {
          return {
            text: "Enter valid minimum price",
            disabled: true,
            className:
              "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
          };
        }

        if (
          maxPrice !== "∞" &&
          (!maxPrice || maxPriceBN.isZero() || maxPriceBN.isNaN())
        ) {
          return {
            text: "Enter valid maximum price",
            disabled: true,
            className:
              "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
          };
        }

        if (maxPrice !== "∞" && maxPriceBN.lte(minPriceBN)) {
          return {
            text: "Maximum price must be greater than minimum",
            disabled: true,
            className:
              "w-full h-12 bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed",
          };
        }
      }

      if (!isAllAmountsValid()) {
        return {
          text: "Insufficient balance",
          disabled: true,
          className:
            "w-full h-12 bg-red-600 hover:bg-red-700 text-white cursor-not-allowed",
        };
      }
    }

    return {
      text: "Review",
      disabled: false,
      className: "w-full h-12 bg-purple-600 hover:bg-purple-700 text-white",
    };
  };

  // Token selection modals
  const [showTokenAModal, setShowTokenAModal] = useState(false);
  const [showTokenBModal, setShowTokenBModal] = useState(false);
  const [showTokenHelper, setShowTokenHelper] = useState(false);

  // RE-ENABLE dynamic token symbols (Fix for token selection lag)
  const allTokenSymbols = useMemo(() => {
    const symbols = new Set<string>();
    if (tokenASymbol) symbols.add(tokenASymbol);
    if (tokenBSymbol) symbols.add(tokenBSymbol);
    if (selectedTokenA) symbols.add(selectedTokenA);
    // Add common symbols to ensure they're always fetched
    symbols.add("BNB");
    symbols.add("USDC");
    symbols.add("USDT");
    symbols.add("ETH");
    return Array.from(symbols);
  }, [tokenASymbol, tokenBSymbol, selectedTokenA]);

  // RE-ENABLE price fetching (Step 1 of isolation test)
  const { prices: realTimePrices, loading: pricesLoading } = useTokenPrices(
    allTokenSymbols,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      autoRefresh: true,
      enabled: open, // Only fetch when modal is open
    }
  );

  // RE-ENABLE dynamic price processing (Step 2 of isolation test)
  const tokenPrices = useMemo(() => {
    const priceMap: { [key: string]: number } = {};
    allTokenSymbols.forEach((symbol) => {
      const priceData = realTimePrices[symbol];
      // Use priceNumber for backward compatibility with existing calculations
      priceMap[symbol] = priceData?.priceNumber || 0;
    });

    // Add fallback prices for common tokens if CoinGecko data not available
    const fallbackPrices: { [key: string]: number } = {
      BNB: 625.34,
      USDC: 1.0,
      USDT: 1.0,
      BUSD: 1.0,
      CAKE: 2.85,
      LINK: 24.3,
      UNI: 10.0,
      ETH: 3500.0,
      MATIC: 1.1,
      ARB: 1.25,
      AVAX: 42.5,
      WETH: 3500.0,
      BU: 0.0001375, // Project token fallback
    };

    // Use fallback only if real price is 0
    Object.keys(fallbackPrices).forEach((symbol) => {
      if (priceMap[symbol] === 0) {
        priceMap[symbol] = fallbackPrices[symbol];
      }
    });

    // REMOVE price override from useMemo to prevent circular dependency
    // Price override will be handled in separate useEffect

    return priceMap;
  }, [
    allTokenSymbols,
    realTimePrices,
    // REMOVE calculatedProjectTokenPrice from dependencies to break circular loop
  ]);

  // RE-ENABLE BigNumber price processing (Step 2 continued)
  const tokenPricesBN = useMemo(() => {
    const priceMap: { [key: string]: BigNumber } = {};
    allTokenSymbols.forEach((symbol) => {
      const priceData = realTimePrices[symbol];
      if (priceData && !priceData.price.isZero()) {
        priceMap[symbol] = priceData.price;
      } else {
        // Use fallback prices
        const fallbackPrice = tokenPrices[symbol] || 0;
        priceMap[symbol] = new BigNumber(fallbackPrice);
      }
    });

    // REMOVE price override from useMemo to prevent circular dependency
    // Price override will be handled in separate useEffect

    return priceMap;
  }, [
    allTokenSymbols,
    realTimePrices,
    tokenPrices,
    // REMOVE calculatedProjectTokenPrice from dependencies to break circular loop
  ]);

  // Get project chain for filtering - map TChain.name to our chain values
  const mapChainNameToValue = (chainName: string): string => {
    const chainMapping: { [key: string]: string } = {
      Binance: "binance",
      Ethereum: "ethereum",
      Polygon: "polygon",
      Arbitrum: "arbitrum",
      Avalanche: "avalanche",
    };
    return chainMapping[chainName] || "binance";
  };

  const projectChain = useMemo(() => {
    return projectData?.chains[0]?.chain
      ? mapChainNameToValue(projectData.chains[0].chain.name)
      : "binance";
  }, [projectData?.chains]);

  // Debug logging untuk chain ID dan token addresses
  // useEffect(() => {
  //   if (projectData?.chains[0]?.chain) {
  //     console.log("🔗 Project Chain Info:", {
  //       chainName: projectData.chains[0].chain.name,
  //       chainId: projectData.chains[0].chain.chainid,
  //       projectChainString: projectChain,
  //       contractAddress: projectData.contractAddress,
  //       selectedTokenA,
  //       selectedTokenB,
  //     });
  //   }
  // }, [
  //   projectData,
  //   projectChain,
  //   selectedTokenA,
  //   selectedTokenB,
  //   tokenAddressMap,
  // ]);

  // ROBUST: Process tokenAData with simple native token logic
  const processedTokenAData = useMemo(() => {
    // EARLY EXIT DEBUG
    if (!selectedTokenA) {
      return tokenAData;
    }

    // Base token A data (fallback jika kosong)
    const baseTokenAData =
      Object.keys(tokenAData).length === 0 && selectedTokenA
        ? {
            symbol: selectedTokenA,
            name: selectedTokenA === "BNB" ? "Binance Coin" : selectedTokenA,
            icon:
              selectedTokenA === "BNB"
                ? "cryptocurrency-color:bnb"
                : "mdi:coin",
          }
        : tokenAData;

    // Get contract address from mapping
    const contractAddress = selectedTokenA
      ? tokenAddressMap[selectedTokenA]?.address
      : undefined;

    // IMPROVED LOGIC: Check for native token properly
    const tokenFromMap = selectedTokenA
      ? tokenAddressMap[selectedTokenA]
      : null;
    const isNativeToken = tokenFromMap?.isNative || selectedTokenA === "BNB"; // Explicit native check

    // FIXED: Use correct decimals per token instead of hardcoded 18
    const correctDecimals = getCorrectDecimals(selectedTokenA, contractAddress);

    const finalTokenAData = {
      ...baseTokenAData,
      address: contractAddress,
      isNative: isNativeToken,
      decimals: correctDecimals, // Use correct decimals per token
    };

    return finalTokenAData;
  }, [tokenAData, selectedTokenA, tokenAddressMap]);

  // Safe project token price calculation using refs (avoid setState loops)
  const calculateProjectTokenPrice = useCallback(() => {
    const rate = new BigNumber(startingPrice || 0);

    // Get base prices directly from realTimePrices to avoid circular dependency
    const tokenAPriceData = realTimePrices[tokenASymbol];
    const tokenAPrice = tokenAPriceData?.priceNumber || 0;

    if (!rate.isNaN() && !rate.isZero() && tokenAPrice > 0) {
      const tokenAPriceBN = new BigNumber(tokenAPrice);
      let tokenBPriceUSD;

      if (baseToken === "TokenA") {
        // TokenA is base: rate TokenA = 1 TokenB
        tokenBPriceUSD = tokenAPriceBN.multipliedBy(rate);
      } else {
        // TokenB is base: rate TokenB = 1 TokenA
        // Example: 125 BU = 1 BNB → BU price = BNB price ÷ rate
        tokenBPriceUSD = tokenAPriceBN.dividedBy(rate);
      }

      // Store in ref (no setState loops) and update display state
      calculatedProjectTokenPriceRef.current = tokenBPriceUSD;
      setDisplayProjectTokenPrice(tokenBPriceUSD);

      return tokenBPriceUSD;
    } else {
      const zeroPrice = new BigNumber(0);
      calculatedProjectTokenPriceRef.current = zeroPrice;
      setDisplayProjectTokenPrice(zeroPrice);

      return zeroPrice;
    }
  }, [startingPrice, tokenASymbol, baseToken, tokenBSymbol, realTimePrices]);

  // Trigger calculation when relevant values change
  useEffect(() => {
    calculateProjectTokenPrice();
  }, [calculateProjectTokenPrice]);

  // RE-ENABLE auto-calculate amounts with stable dependencies
  useEffect(() => {
    if (!lastUpdatedField || !startingPrice || startingPrice === "0") return;

    const rate = new BigNumber(startingPrice);
    if (rate.isZero() || rate.isNaN()) return;

    if (lastUpdatedField === "tokenA" && tokenAAmount) {
      const tokenAValue = new BigNumber(tokenAAmount);
      if (!tokenAValue.isZero() && !tokenAValue.isNaN()) {
        // Rate interpretation berdasarkan baseToken
        let tokenBValue;
        if (baseToken === "TokenA") {
          // TokenA selected: "rate TokenA = 1 TokenB"
          // Contoh: 0.0055 BNB = 1 BU → 1 BNB = 181.818 BU
          tokenBValue = tokenAValue.dividedBy(rate);
        } else {
          // TokenB selected: "rate TokenB = 1 TokenA"
          // Contoh: 125 BU = 1 BNB → 0.016 BNB = 0.016 × 125 = 2 BU
          tokenBValue = tokenAValue.multipliedBy(rate);
        }
        setTokenBAmount(tokenBValue.toFixed());
      } else if (tokenAValue.isZero()) {
        setTokenBAmount("0");
      }
    } else if (lastUpdatedField === "tokenB" && tokenBAmount) {
      const tokenBValue = new BigNumber(tokenBAmount);
      if (!tokenBValue.isZero() && !tokenBValue.isNaN()) {
        // Rate interpretation berdasarkan baseToken
        let tokenAValue;
        if (baseToken === "TokenA") {
          // TokenA selected: "rate TokenA = 1 TokenB"
          // Contoh: 0.0055 BNB = 1 BU → 181.818 BU = 1 BNB
          tokenAValue = tokenBValue.multipliedBy(rate);
        } else {
          // TokenB selected: "rate TokenB = 1 TokenA"
          // Contoh: 125 BU = 1 BNB → 2 BU = 2 ÷ 125 = 0.016 BNB
          tokenAValue = tokenBValue.dividedBy(rate);
        }
        setTokenAAmount(tokenAValue.toFixed());
      } else if (tokenBValue.isZero()) {
        setTokenAAmount("0");
      }
    }
  }, [tokenAAmount, tokenBAmount, startingPrice, baseToken, lastUpdatedField]);

  // Debug: Log initial states when modal opens
  useEffect(() => {
    if (open) {
    }
  }, [open]);

  const tokens = [
    { symbol: "ETH", name: "Ethereum", icon: "cryptocurrency-color:eth" },
    { symbol: "BTC", name: "Bitcoin", icon: "cryptocurrency-color:btc" },
    { symbol: "USDC", name: "USD Coin", icon: "cryptocurrency-color:usdc" },
    { symbol: "USDT", name: "Tether", icon: "cryptocurrency-color:usdt" },
    { symbol: "BNB", name: "BNB", icon: "cryptocurrency-color:bnb" },
  ];

  const feeTiers = [
    { value: "0.01", label: "0.01%", description: "For stablecoins" },
    { value: "0.05", label: "0.05%", description: "For standard trading" },
    {
      value: "0.3",
      label: "0.3%",
      description: "For most pairs",
      recommended: true,
    },
    { value: "1", label: "1%", description: "For exotic pairs" },
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

  const handleSelectTokenA = useCallback((token: any) => {
    // Use startTransition for smooth, non-urgent updates
    startTransition(() => {
      setTokenAData(token);
      setSelectedTokenA(token.symbol);
    });
  }, []);

  const handleSelectTokenB = useCallback(
    (token: any) => {
      // Only update if not a project token (project token is auto-set)
      if (!projectData || token.symbol !== projectData.ticker) {
        startTransition(() => {
          setTokenBData(token);
          setSelectedTokenB(token.symbol);
        });
      }
    },
    [projectData?.ticker]
  );

  // Handler for Token A amount changes
  const handleTokenAAmountChange = (value: string) => {
    setTokenAAmount(value);
    setLastUpdatedField("tokenA");
  };

  // Handler for Token B amount changes
  const handleTokenBAmountChange = (value: string) => {
    setTokenBAmount(value);
    setLastUpdatedField("tokenB");
  };

  // Check if auto-calculated amount exceeds balance - updated to be dynamic based on selected tokens
  const hasAutoCalculationError = () => {
    if (lastUpdatedField === "tokenA") {
      // User input Token A, Token B was auto-calculated
      const calculatedTokenB = new BigNumber(tokenBAmount || 0);
      const tokenBBalanceAmount = tokenBBalance?.balance || new BigNumber(0);
      return calculatedTokenB.gt(tokenBBalanceAmount);
    } else if (lastUpdatedField === "tokenB") {
      // User input Token B, Token A was auto-calculated
      const calculatedTokenA = new BigNumber(tokenAAmount || 0);
      const tokenABalanceAmount = tokenABalance?.balance || new BigNumber(0);
      return calculatedTokenA.gt(tokenABalanceAmount);
    }
    return false;
  };

  // Handler for starting price changes
  const handleStartingPriceChange = (value: string) => {
    setStartingPrice(value);

    // Recalculate token amounts based on the new rate
    if (value && value !== "0") {
      const rate = new BigNumber(value);
      if (!rate.isZero() && !rate.isNaN()) {
        const tokenAAmountBN = new BigNumber(tokenAAmount || 0);
        const tokenBAmountBN = new BigNumber(tokenBAmount || 0);

        // Only recalculate if at least one field has a value
        if (!tokenAAmountBN.isZero() || !tokenBAmountBN.isZero()) {
          // Determine which field to keep and which to recalculate
          if (
            lastUpdatedField === "tokenA" ||
            (!lastUpdatedField && !tokenAAmountBN.isZero())
          ) {
            // Keep Token A amount, recalculate Token B amount
            if (!tokenAAmountBN.isZero()) {
              let tokenBValue;
              if (baseToken === "TokenA") {
                // TokenA selected: "rate TokenA = 1 TokenB"
                tokenBValue = tokenAAmountBN.dividedBy(rate);
              } else {
                // TokenB selected: "rate TokenB = 1 TokenA"
                tokenBValue = tokenAAmountBN.multipliedBy(rate);
              }
              setTokenBAmount(tokenBValue.toFixed());
            }
          } else if (
            lastUpdatedField === "tokenB" ||
            (!lastUpdatedField && !tokenBAmountBN.isZero())
          ) {
            // Keep Token B amount, recalculate Token A amount
            if (!tokenBAmountBN.isZero()) {
              let tokenAValue;
              if (baseToken === "TokenA") {
                // TokenA selected: "rate TokenA = 1 TokenB"
                tokenAValue = tokenBAmountBN.multipliedBy(rate);
              } else {
                // TokenB selected: "rate TokenB = 1 TokenA"
                tokenAValue = tokenBAmountBN.dividedBy(rate);
              }
              setTokenAAmount(tokenAValue.toFixed());
            }
          }
        }
      }
    }
  };

  // Helper function untuk menentukan decimal places berdasarkan nilai
  const getDecimalPlaces = (value: number) => {
    if (value === 0) return 2;
    if (value < 0.001) return 8; // Angka sangat kecil seperti 0.00000022
    return 2; // Angka normal seperti 1.00003254
  };

  // Helper function untuk format USD tanpa pembulatan menggunakan BigNumber
  const formatUSDWithoutRounding = (value: number | BigNumber) => {
    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero()) return "0";

    // Smart formatting untuk dunia crypto sesuai requirement user
    if (valueBN.gte(1)) {
      // Untuk angka >= 1, batasi ke 2 decimal places
      return valueBN.decimalPlaces(2).toFixed();
    } else {
      // Untuk angka < 1, tampilkan full precision
      return valueBN.toFixed();
    }
  };

  // Handler for swapping token amounts
  const handleSwapAmounts = () => {
    const tempTokenA = tokenAAmount;
    const tempTokenB = tokenBAmount;
    setTokenAAmount(tempTokenB);
    setTokenBAmount(tempTokenA);
    setLastUpdatedField(null);
  };

  // Calculate conversion rate display menggunakan BigNumber
  const getConversionRate = () => {
    const rate = new BigNumber(startingPrice || 0);
    if (rate.isNaN() || rate.isZero()) return null;

    if (baseToken === "TokenA") {
      // TokenA selected: "rate TokenA = 1 TokenB"
      // Show: 1 TokenA = X TokenB
      const tokenBPerTokenA = new BigNumber(1).dividedBy(rate);
      return `1 ${tokenASymbol} = ${tokenBPerTokenA.toFormat()} ${tokenBSymbol}`;
    } else {
      // TokenB selected: "rate TokenB = 1 TokenA"
      // Show: 1 TokenB = X TokenA
      const tokenAPerTokenB = new BigNumber(1).dividedBy(rate);
      return `1 ${tokenBSymbol} = ${tokenAPerTokenB.toFormat()} ${tokenASymbol}`;
    }
  };

  const canContinue = currentStep === 1 ? tokenASymbol && tokenBSymbol : true;

  const resetForm = () => {
    setSelectedTokenA("");
    setSelectedTokenB("");
    setSelectedFeeTier("0.05");
    setHookEnabled(false);
    setCurrentStep(1);
    setBaseToken("TokenA");
    setStartingPrice("0"); // Default starting price
    setRangeType("full");
    setMinPrice("0");
    setMaxPrice("∞");
    setTokenAAmount("0");
    setTokenBAmount("0");
    setLastUpdatedField(null);
    setTokenAData({
      symbol: "",
      name: "",
      icon: "",
    });

    // Reset token B data berdasarkan project data yang tersedia
    if (projectData) {
      setTokenBData({
        symbol: projectData.ticker,
        name: projectData.name,
        icon: "mdi:coin", // Konsisten dengan useEffect project data
      });
      setSelectedTokenB(projectData.ticker);
    } else {
      setTokenBData({
        symbol: "",
        name: "",
        icon: "", // Ubah dari mdi:food ke mdi:coin agar konsisten
      });
    }
  };

  // 🚨 Don't render modal content if chainId not ready
  if (!isChainIdReady || !projectChainId) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Loading Project Data...</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <div className="animate-pulse mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mx-auto w-3/4"></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ⏳ Waiting for project chain information...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Chain ID: {projectChainId || "Loading..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Steps */}
          <div className="w-80 bg-muted/30 border-r p-6 flex flex-col h-full">
            <DialogHeader className="mb-8 flex-shrink-0">
              <DialogTitle className="text-xl font-semibold">
                New Position (
                {projectChainId === 42161
                  ? "Arbitrum One"
                  : projectChainId === 56
                  ? "BSC"
                  : `Chain ${projectChainId}`}
                )
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
                      Reset
                    </Button>

                    <Select value="v3">
                      <SelectTrigger className="h-8 w-auto px-3 text-xs">
                        <SelectValue>v3 Position</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v4" disabled>
                          v4 Position
                        </SelectItem>
                        <SelectItem value="v3">v3 Position</SelectItem>
                        <SelectItem value="v2" disabled>
                          v2 Position
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Icon name="mdi:cog" className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Token Pair Selection */}
                  <div>
                    <h2 className="text-lg font-semibold mb-6">Select Pair</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Choose tokens you'd like to provide liquidity for. You can
                      select tokens across all supported networks.
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
                              <span className="font-medium">
                                {tokenASymbol}
                              </span>
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
                                <span className="font-medium">
                                  {tokenBSymbol}
                                </span>
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
                          <Icon
                            name="mdi:hook"
                            className="text-muted-foreground"
                          />
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
                                <p>
                                  Hooks enable custom functionality for this
                                  pool
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

                  {/* Fee Tier Selection */}
                  <div>
                    <h3 className="font-semibold mb-2">Fee Tier</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Amount earned from providing liquidity. Choose a fee tier
                      that matches your risk tolerance and strategy.
                    </p>

                    <div className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            Fee Tier{" "}
                            {
                              feeTiers.find((t) => t.value === selectedFeeTier)
                                ?.label
                            }
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            % you'll earn in fees
                          </div>
                        </div>
                        {/* <Select
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
                        </Select> */}
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
                      Reset
                    </Button>

                    <Select value="v3">
                      <SelectTrigger className="h-8 w-auto px-3 text-xs">
                        <SelectValue>v3 Position</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v4" disabled>
                          v4 Position
                        </SelectItem>
                        <SelectItem value="v3">v3 Position</SelectItem>
                        <SelectItem value="v2" disabled>
                          v2 Position
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Icon name="mdi:cog" className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Token Pair Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      {tokenAIcon ? (
                        <Icon name={tokenAIcon} className="w-6 h-6" />
                      ) : (
                        <Icon
                          name="mdi:help-circle-outline"
                          className="w-6 h-6 text-muted-foreground"
                        />
                      )}
                      {tokenBIcon ? (
                        <Icon name={tokenBIcon} className="w-6 h-6" />
                      ) : (
                        <Icon
                          name="mdi:help-circle-outline"
                          className="w-6 h-6 text-muted-foreground"
                        />
                      )}
                    </div>
                    <span className="font-semibold text-lg">
                      {tokenASymbol && tokenBSymbol
                        ? `${tokenASymbol} / ${tokenBSymbol}`
                        : "Select Token Pair"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-1 rounded text-xs">
                        v3
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
                        <h3 className="font-medium mb-2">Creating new pool</h3>
                        <p className="text-sm text-muted-foreground">
                          Your selection will create a new liquidity pool, which
                          may result in lower initial liquidity and increased
                          volatility. Consider adding liquidity to an existing
                          pool to minimize this risk.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Starting Price */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Set Starting Price</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        When creating a new pool, you must set the initial
                        exchange rate for both tokens. This will reflect the
                        initial market price.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Starting Price
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={startingPrice}
                              onChange={(e) =>
                                handleStartingPriceChange(e.target.value)
                              }
                              className={`flex-1 h-12 px-4 bg-background border rounded-lg text-lg font-mono ${(() => {
                                const priceBN = new BigNumber(
                                  startingPrice || 0
                                );
                                return !startingPrice ||
                                  priceBN.isZero() ||
                                  priceBN.isNaN()
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : "border-border focus:border-primary focus:ring-primary";
                              })()}`}
                              placeholder="0.00"
                            />
                            <div className="flex border border-border rounded-lg overflow-hidden">
                              <button
                                type="button"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                  baseToken === "TokenA"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted"
                                }`}
                                onClick={() => {
                                  setBaseToken("TokenA");
                                }}
                              >
                                <Icon name={tokenAIcon} className="w-4 h-4" />
                                <span>{tokenASymbol}</span>
                              </button>
                              <button
                                type="button"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                  baseToken === "TokenB"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted"
                                }`}
                                onClick={() => {
                                  setBaseToken("TokenB");
                                }}
                              >
                                <Icon name={tokenBIcon} className="w-4 h-4" />
                                <span>{tokenBSymbol}</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {baseToken === "TokenA"
                              ? `Price expressed as: X ${tokenASymbol} = 1 ${tokenBSymbol}`
                              : `Price expressed as: X ${tokenBSymbol} = 1 ${tokenASymbol}`}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">
                            Market price:{" "}
                            {(() => {
                              const rate = new BigNumber(startingPrice || 0);
                              if (rate.isNaN() || rate.isZero()) {
                                return baseToken === "TokenA"
                                  ? `0 ${tokenASymbol} = 1 ${tokenBSymbol} (US$0)`
                                  : `0 ${tokenBSymbol} = 1 ${tokenASymbol} (US$0)`;
                              }

                              // Format number sesuai requirement user menggunakan BigNumber
                              const formatRateWithoutRounding = (
                                value: number | BigNumber
                              ) => {
                                const valueBN =
                                  value instanceof BigNumber
                                    ? value
                                    : new BigNumber(value);

                                if (valueBN.isZero()) return "0";

                                // Rule: untuk crypto precision berdasarkan requirement user
                                if (valueBN.gte(1)) {
                                  // Untuk angka >= 1, batasi ke 2 decimal places (12.53, 1.32)
                                  if (valueBN.gte(1000)) {
                                    return valueBN.decimalPlaces(2).toFormat();
                                  } else {
                                    return valueBN.decimalPlaces(2).toFixed();
                                  }
                                } else {
                                  // Untuk angka < 1, tampilkan full precision (0.2315423423, 0.0000045)
                                  return valueBN.toFixed();
                                }
                              };

                              const formattedRate =
                                formatRateWithoutRounding(rate);

                              // Calculate USD price berdasarkan baseToken
                              const tokenAPrice =
                                tokenPricesBN[tokenASymbol] || new BigNumber(0);
                              let usdPrice;

                              if (baseToken === "TokenA") {
                                // TokenA selected: "rate TokenA = 1 TokenB"
                                // Contoh: 0.0055 BNB = 1 BU → 1 BU = 0.0055 × $865.24 = $4.75
                                usdPrice = rate.multipliedBy(tokenAPrice);

                                return `${formattedRate} ${tokenASymbol} = 1 ${tokenBSymbol} (US$${formatUSDWithoutRounding(
                                  usdPrice
                                )})`;
                              } else {
                                // TokenB selected: "rate TokenB = 1 TokenA"
                                // Contoh: 181.818 BU = 1 BNB → 1 BNB = $865.24 (tokenA price)
                                usdPrice = tokenAPrice;

                                return `${formattedRate} ${tokenBSymbol} = 1 ${tokenASymbol} (US$${formatUSDWithoutRounding(
                                  usdPrice
                                )})`;
                              }
                            })()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              // Calculate market price berdasarkan baseToken
                              const tokenAPrice =
                                (tokenASymbol
                                  ? tokenPricesBN[tokenASymbol]
                                  : new BigNumber(0)) || new BigNumber(0);
                              const tokenBPrice =
                                (tokenBSymbol
                                  ? tokenPricesBN[tokenBSymbol]
                                  : new BigNumber(0)) || new BigNumber(0);

                              if (
                                !tokenAPrice.isZero() &&
                                !tokenBPrice.isZero()
                              ) {
                                let marketRate;
                                if (baseToken === "TokenA") {
                                  // TokenA selected: rate = price_TokenB / price_TokenA
                                  // Contoh: BU = $0.0001375, BNB = $865.24 → rate = $0.0001375 / $865.24
                                  marketRate =
                                    tokenBPrice.dividedBy(tokenAPrice);
                                } else {
                                  // TokenB selected: rate = price_TokenA / price_TokenB
                                  // Contoh: BNB = $865.24, BU = $0.0001375 → rate = $865.24 / $0.0001375
                                  marketRate =
                                    tokenAPrice.dividedBy(tokenBPrice);
                                }

                                handleStartingPriceChange(marketRate.toFixed());
                                // Market price button logging removed to prevent infinite loops
                              }
                            }}
                          >
                            Use market price
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Set Price Range</h3>

                        <div className="flex gap-2 mb-4">
                          <Button
                            variant={
                              rangeType === "full" ? "default" : "outline"
                            }
                            className="flex-1"
                            onClick={() => setRangeType("full")}
                          >
                            Full Range
                          </Button>
                          <Button
                            variant={
                              rangeType === "custom" ? "default" : "outline"
                            }
                            className="flex-1"
                            onClick={() => setRangeType("custom")}
                          >
                            Custom Range
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          Full range liquidity provision during pool creation
                          ensures continuous market participation across all
                          possible prices. The process is simpler, but potential
                          impermanent loss is higher.
                        </p>

                        {rangeType === "custom" && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 border rounded-lg">
                              <label className="text-sm text-muted-foreground mb-2 block">
                                Minimum Price
                              </label>
                              <input
                                type="text"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full h-12 px-4 bg-background border-0 rounded-lg text-xl font-mono mb-2 focus:outline-none"
                                placeholder="0"
                              />
                              <div className="text-sm text-muted-foreground">
                                {tokenBSymbol} = 1 {tokenASymbol}
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <label className="text-sm text-muted-foreground mb-2 block">
                                Maximum Price
                              </label>
                              <input
                                type="text"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full h-12 px-4 bg-background border-0 rounded-lg text-xl font-mono mb-2 focus:outline-none"
                                placeholder="∞"
                              />
                              <div className="text-sm text-muted-foreground">
                                {tokenBSymbol} = 1 {tokenASymbol}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Token Deposit */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Deposit Tokens</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Specify the amount of tokens for your liquidity
                            contribution.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div
                            className={`p-4 border rounded-lg bg-muted/50 ${
                              isTokenAAmountEmpty() || !isTokenAAmountValid()
                                ? "border-red-500 bg-red-500/5"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={tokenAAmount}
                                onChange={(e) =>
                                  handleTokenAAmountChange(e.target.value)
                                }
                                className={`flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground ${
                                  isTokenAAmountEmpty() ||
                                  !isTokenAAmountValid()
                                    ? "text-red-500"
                                    : ""
                                }`}
                                placeholder={
                                  tokenASymbol ? "0" : "Select token first"
                                }
                                disabled={!tokenASymbol}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() =>
                                    handleTokenAAmountChange(
                                      (
                                        tokenABalance?.balance ||
                                        new BigNumber(0)
                                      ).toString()
                                    )
                                  }
                                  disabled={
                                    !tokenASymbol ||
                                    !tokenABalance ||
                                    tokenABalance.balance.isZero()
                                  }
                                >
                                  MAX
                                </Button>
                                {tokenAIcon ? (
                                  <>
                                    <Icon
                                      name={tokenAIcon}
                                      className="w-6 h-6"
                                    />
                                    <span className="font-medium">
                                      {tokenASymbol}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Icon
                                      name="mdi:help-circle-outline"
                                      className="w-6 h-6 text-muted-foreground"
                                    />
                                    <span className="text-muted-foreground text-sm">
                                      Select Token
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span
                                className={
                                  !isTokenAAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {!tokenASymbol
                                  ? "-"
                                  : calculateUSDValue(
                                      tokenASymbol,
                                      tokenAAmount
                                    )}
                              </span>
                              <span
                                className={
                                  !isTokenAAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {!tokenASymbol ? (
                                  "Select token to view balance"
                                ) : (
                                  <>
                                    Balance:{" "}
                                    {(() => {
                                      if (tokenABalance?.isLoading)
                                        return "Loading...";
                                      if (!tokenABalance)
                                        return "Not Connected";

                                      return tokenABalance.formatted || "0";
                                    })()}{" "}
                                    {tokenASymbol}
                                    {!!projectData &&
                                      tokenASymbol === projectData.ticker &&
                                      tokenABalance?.totalSupply &&
                                      " (Total Supply)"}
                                  </>
                                )}
                              </span>
                            </div>
                            {(isTokenAAmountEmpty() ||
                              !isTokenAAmountValid()) && (
                              <div className="text-red-500 text-xs mt-2">
                                {isTokenAAmountEmpty()
                                  ? `Enter ${tokenASymbol} amount`
                                  : lastUpdatedField === "tokenB" &&
                                    hasAutoCalculationError()
                                  ? `Auto-calculation exceeds available ${tokenASymbol} balance`
                                  : "Amount exceeds available balance"}
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
                              isTokenBAmountEmpty() || !isTokenBAmountValid()
                                ? "border-red-500 bg-red-500/5"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={tokenBAmount}
                                onChange={(e) =>
                                  handleTokenBAmountChange(e.target.value)
                                }
                                className={`flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground ${
                                  isTokenBAmountEmpty() ||
                                  !isTokenBAmountValid()
                                    ? "text-red-500"
                                    : ""
                                }`}
                                placeholder={
                                  tokenBSymbol ? "0" : "Select token first"
                                }
                                disabled={!tokenBSymbol}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() =>
                                    handleTokenBAmountChange(
                                      (
                                        tokenBBalance?.balance ||
                                        new BigNumber(0)
                                      ).toString()
                                    )
                                  }
                                  disabled={
                                    !tokenBSymbol ||
                                    !tokenBBalance ||
                                    tokenBBalance.balance.isZero()
                                  }
                                >
                                  MAX
                                </Button>
                                {tokenBIcon ? (
                                  <>
                                    <Icon
                                      name={tokenBIcon}
                                      className="w-6 h-6"
                                    />
                                    <span className="font-medium">
                                      {tokenBSymbol}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Icon
                                      name="mdi:help-circle-outline"
                                      className="w-6 h-6 text-muted-foreground"
                                    />
                                    <span className="text-muted-foreground text-sm">
                                      Select Token
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span
                                className={
                                  !isTokenBAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {!tokenBSymbol
                                  ? "-"
                                  : calculateUSDValue(
                                      tokenBSymbol,
                                      tokenBAmount
                                    )}
                              </span>
                              <span
                                className={
                                  !isTokenBAmountValid()
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {!tokenBSymbol ? (
                                  "Select token to view balance"
                                ) : (
                                  <>
                                    Balance:{" "}
                                    {(() => {
                                      if (tokenBBalance?.isLoading)
                                        return "Loading...";
                                      if (!tokenBBalance)
                                        return "Not Connected";

                                      return tokenBBalance.formatted || "0";
                                    })()}{" "}
                                    {tokenBSymbol}
                                    {!!projectData &&
                                      tokenBSymbol === projectData.ticker &&
                                      tokenBBalance?.totalSupply &&
                                      " (Total Supply)"}
                                  </>
                                )}
                              </span>
                            </div>
                            {(isTokenBAmountEmpty() ||
                              !isTokenBAmountValid()) && (
                              <div className="text-red-500 text-xs mt-2">
                                {isTokenBAmountEmpty()
                                  ? `Enter ${tokenBSymbol} amount`
                                  : lastUpdatedField === "tokenA" &&
                                    hasAutoCalculationError()
                                  ? `Auto-calculation exceeds available ${tokenBSymbol} balance`
                                  : "Amount exceeds available balance"}
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

                        {/* SDK Status Display */}
                        {isWalletConnected && (
                          <div className="p-3 bg-muted/20 rounded-lg mb-3">
                            {isSDKConnecting && (
                              <div className="flex items-center gap-2 text-sm text-purple-600">
                                <Icon
                                  name="mdi:loading"
                                  className="w-4 h-4 animate-spin"
                                />
                                <span>Initializing Uniswap V3 SDK...</span>
                              </div>
                            )}
                            {sdkError && (
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <Icon
                                  name="mdi:alert-circle"
                                  className="w-4 h-4"
                                />
                                <span>SDK Error: {sdkError}</span>
                              </div>
                            )}
                            {!isSDKReady && !isSDKConnecting && !sdkError && (
                              <div className="flex items-center gap-2 text-sm text-amber-600">
                                <Icon name="mdi:alert" className="w-4 h-4" />
                                <span>Uniswap SDK not ready</span>
                              </div>
                            )}
                            {isSDKReady && !isSDKConnecting && !sdkError && (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <Icon
                                  name="mdi:check-circle"
                                  className="w-4 h-4"
                                />
                                <span>
                                  Uniswap V3 SDK Ready · Chain {projectChainId}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Balance Status Display */}
                        {(balancesLoading ||
                          balancesError ||
                          !balancesInitialized) && (
                          <div className="p-3 bg-muted/20 rounded-lg mb-3">
                            {balancesLoading && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Icon
                                  name="mdi:loading"
                                  className="w-4 h-4 animate-spin"
                                />
                                <span>
                                  Fetching token balance from wallet...
                                </span>
                              </div>
                            )}
                            {balancesError && (
                              <div className="flex items-center gap-2 text-sm text-amber-600">
                                <Icon
                                  name="mdi:alert-circle"
                                  className="w-4 h-4"
                                />
                                <span>
                                  Failed to fetch balance: {balancesError}
                                </span>
                                <div className="flex gap-1 ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={refetchBalances}
                                  >
                                    <Icon
                                      name="mdi:refresh"
                                      className="w-3 h-3 mr-1"
                                    />
                                    Try again
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setShowTokenHelper(true)}
                                  >
                                    <Icon
                                      name="mdi:help-circle"
                                      className="w-3 h-3 mr-1"
                                    />
                                    Help
                                  </Button>
                                </div>
                              </div>
                            )}
                            {!balancesInitialized && !balancesLoading && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon name="mdi:wallet" className="w-4 h-4" />
                                <span>Connect wallet to view balance</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Market Prices Display */}
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">
                            Current Market Prices
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon name={tokenAIcon} className="w-4 h-4" />
                                <span>{tokenASymbol}</span>
                              </div>
                              <span className="font-mono">
                                US$
                                {formatUSDWithoutRounding(
                                  tokenPricesBN[tokenASymbol] ||
                                    new BigNumber(0)
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon name={tokenBIcon} className="w-4 h-4" />
                                <span>{tokenBSymbol}</span>
                              </div>
                              <span className="font-mono">
                                US$
                                {formatUSDWithoutRounding(
                                  // Use calculated project price if available for project token
                                  !displayProjectTokenPrice.isZero() &&
                                    tokenBSymbol
                                    ? displayProjectTokenPrice
                                    : (tokenBSymbol
                                        ? tokenPricesBN[tokenBSymbol]
                                        : new BigNumber(0)) || new BigNumber(0)
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Total Pool Value */}
                          {(() => {
                            const tokenAAmountBN = new BigNumber(
                              tokenAAmount || 0
                            );
                            const tokenBAmountBN = new BigNumber(
                              tokenBAmount || 0
                            );
                            return tokenAAmountBN.gt(0) || tokenBAmountBN.gt(0);
                          })() && (
                            <div className="pt-3 border-t border-muted">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon
                                    name="mdi:pool"
                                    className="w-4 h-4 text-muted-foreground"
                                  />
                                  <span className="text-sm font-medium">
                                    Total Pool Value
                                  </span>
                                </div>
                                <span className="font-mono text-sm font-bold">
                                  {calculateTotalPoolValue()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Review Button - No more manual wallet connection */}
                        {(() => {
                          const buttonState = getButtonState();
                          return (
                            <Button
                              className={buttonState.className}
                              disabled={buttonState.disabled}
                              onClick={
                                !buttonState.disabled
                                  ? () => {
                                      // CRITICAL: Use pre-processed tokenAData

                                      const finalTokenAData =
                                        processedTokenAData;

                                      // Get correct decimals for tokenB
                                      const tokenBAddress =
                                        projectData?.contractAddress ||
                                        (selectedTokenB
                                          ? tokenAddressMap[selectedTokenB]
                                              ?.address
                                          : undefined);
                                      const tokenBDecimals = getCorrectDecimals(
                                        selectedTokenB ||
                                          tokenBData.symbol ||
                                          "UNKNOWN",
                                        tokenBAddress
                                      );

                                      const finalTokenBData = {
                                        ...tokenBData,
                                        address: tokenBAddress,
                                        isNative: selectedTokenB
                                          ? tokenAddressMap[selectedTokenB]
                                              ?.isNative || false
                                          : false,
                                        decimals: tokenBDecimals, // Use correct decimals per token
                                        name:
                                          tokenBData?.name ||
                                          tokenBData?.symbol ||
                                          "Unknown Token", // Add name fallback
                                      };

                                      setModalData({
                                        rangeType,
                                        minPrice,
                                        maxPrice,
                                        startingPrice,
                                        baseToken,
                                        tokenAAmount,
                                        tokenBAmount,
                                        tokenAData: finalTokenAData,
                                        tokenBData: finalTokenBData,
                                        tokenPrices,
                                        calculateUSDValue,
                                        calculateTotalPoolValue,
                                        // Data tambahan untuk Uniswap integration
                                        feeTier: selectedFeeTier,
                                        chainId: projectChainId, // Use project chain ID from hook
                                        userAddress,
                                      });
                                      setOpen(false); // Close main modal first
                                      setShowConfirmModal(true);
                                    }
                                  : undefined
                              }
                            >
                              {buttonState.icon && (
                                <Icon
                                  name={buttonState.icon}
                                  className="w-4 h-4 mr-2"
                                />
                              )}
                              {buttonState.text}
                            </Button>
                          );
                        })()}
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
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Token Selection Modals - Conditional rendering for performance */}
      {(showTokenAModal || open) && (
        <TokenSelectionModal
          open={showTokenAModal}
          setOpen={setShowTokenAModal}
          onSelectToken={handleSelectTokenA}
          selectedToken={selectedTokenA}
          filterByChain={projectData ? projectChain : undefined}
          disabledToken={projectData ? projectData.ticker : undefined}
        />
      )}

      {(showTokenBModal || open) && (
        <TokenSelectionModal
          open={showTokenBModal}
          setOpen={setShowTokenBModal}
          onSelectToken={handleSelectTokenB}
          selectedToken={selectedTokenB}
          filterByChain={projectData ? projectChain : undefined}
        />
      )}
    </Dialog>
  );
}
