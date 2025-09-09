"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { FEE_TIERS } from "@/lib/uniswap/constants";
import { useUniswapV3SDK } from "@/hooks/useUniswapV3SDK";
// import { ARBITRUM_RPC_PROVIDERS } from "@/data/constants";
// import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  showConfirmModal: boolean;
  setShowConfirmModal: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  rangeType: string;
  minPrice: string;
  maxPrice: string;
  startingPrice: string;
  baseToken: string;
  tokenAAmount: string;
  tokenBAmount: string;
  tokenAData?: {
    symbol: string;
    name: string;
    icon: string;
    address?: string; // Contract address for Uniswap
    isNative?: boolean; // For native tokens (BNB, ETH)
    decimals?: number; // Token decimals
  };
  tokenBData?: {
    symbol: string;
    name: string;
    icon: string;
    address?: string; // Contract address for Uniswap
    isNative?: boolean; // For native tokens (should be false for project tokens)
    decimals?: number; // Token decimals
  };
  tokenPrices?: { [key: string]: number };
  calculateUSDValue?: (symbol: string, amount: string) => string;
  calculateTotalPoolValue?: () => string;
  // New props for Uniswap integration
  feeTier?: string; // "0.05", "0.3", "1"
  chainId?: number;
  userAddress?: string;
}

export function ConfirmationModal({
  showConfirmModal,
  setShowConfirmModal,
  setOpen,
  rangeType,
  minPrice,
  maxPrice,
  startingPrice,
  baseToken,
  tokenAAmount,
  tokenBAmount,
  tokenAData = {
    symbol: "BNB",
    name: "Binance Coin",
    icon: "cryptocurrency-color:bnb",
  },
  tokenBData = {
    symbol: "BU",
    name: "Bakso Urat",
    icon: "mdi:coin",
  },
  tokenPrices = { BNB: 625.34, BU: 0.0001375 },
  calculateUSDValue = (symbol: string, amount: string) => {
    const tokenAmount = new BigNumber(amount || 0);
    if (tokenAmount.isZero()) return "US$0";

    const price = new BigNumber(tokenPrices?.[symbol] || 0);
    const usdValue = tokenAmount.multipliedBy(price);

    return `US$${usdValue.toFixed(6)}`;
  },
  calculateTotalPoolValue = () => "US$0",
  // New props with defaults
  feeTier = "0.3",
  chainId = 56, // Default to BSC
  userAddress,
}: ConfirmationModalProps) {
  // Hooks
  const [isCreatingPosition, setIsCreatingPosition] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [nftTokenId, setNftTokenId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { connect, isConnected } = useWeb3AuthConnect();
  const { isLoading, isConnecting, isReady, error, clearError } =
    useUniswapV3SDK(chainId || 56);

  // 🎯 USER-TRIGGERED Network Switch Helper
  // This is triggered only when user clicks "Create Position" - safer approach
  const ensureCorrectNetworkOnUserAction = async () => {
    try {
      const walletProvider = await connect();
      if (!walletProvider) throw new Error("No wallet provider");

      const walletChainId = await walletProvider.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(walletChainId as string, 16);
      const expectedChainId = chainId || 56; // Use actual chainId from props

      if (currentChainId !== expectedChainId) {
        const targetNetworkName =
          expectedChainId === 42161
            ? "Arbitrum One"
            : expectedChainId === 56
            ? "BSC"
            : `Chain ${expectedChainId}`;

        toast.info(
          `Switching to ${targetNetworkName} network for liquidity pool...`
        );

        // Network configurations
        const networkConfigs = {
          42161: {
            chainId: "0xa4b1", // 42161 in hex
            chainName: "Arbitrum One",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [
              "https://arb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX", // Using your Alchemy RPC
              "https://arb1.arbitrum.io/rpc", // Official fallback
            ],
            blockExplorerUrls: ["https://arbiscan.io/"],
          },
          56: {
            chainId: "0x38", // 56 in hex
            chainName: "Binance Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: [
              "https://bnb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX",
            ],
            blockExplorerUrls: ["https://bscscan.com/"],
          },
        };

        const networkConfig =
          networkConfigs[expectedChainId as keyof typeof networkConfigs];
        if (!networkConfig) {
          throw new Error(`Unsupported network: ${expectedChainId}`);
        }

        try {
          await walletProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: networkConfig.chainId }],
          });

          // Verify the switch worked
          await walletProvider.request({
            method: "eth_chainId",
          });
        } catch (switchError: any) {
          // If network not added, add it
          if (switchError.code === 4902) {
            try {
              await walletProvider.request({
                method: "wallet_addEthereumChain",
                params: [networkConfig],
              });

              // Verify network was added and switched
              await walletProvider.request({
                method: "eth_chainId",
              });
            } catch (addError: any) {
              throw new Error(
                `Failed to add ${targetNetworkName}: ${
                  addError.message || "Unknown error"
                }`
              );
            }
          } else if (switchError.code === 4001) {
            // User rejected the request
            throw new Error(
              `User rejected network switch to ${targetNetworkName}`
            );
          } else {
            // Other errors
            throw new Error(
              `Network switch failed: ${
                switchError.message || "Unknown error"
              } (code: ${switchError.code})`
            );
          }
        }

        toast.success(`Successfully switched to ${targetNetworkName} network!`);

        // 🔄 CRITICAL: Enhanced network stabilization after switch
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second wait

        // 🔄 Step 4b: Force provider refresh to avoid stale connection
        const refreshedProvider = await connect(); // Get fresh provider
        if (!refreshedProvider) {
          throw new Error(
            "Failed to refresh wallet provider after network switch"
          );
        }

        // 🔍 Step 5: Enhanced network verification with fresh provider
        const finalChainId = await refreshedProvider.request({
          method: "eth_chainId",
        });
        const finalChainIdDecimal = parseInt(finalChainId as string, 16);

        if (finalChainIdDecimal !== expectedChainId) {
          throw new Error(
            `Network switch verification failed. Expected ${expectedChainId}, got ${finalChainIdDecimal}`
          );
        }
      } else {
        // Even if no switch needed, ensure provider is fresh and stable
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second stability wait

        // Get fresh provider to ensure consistency
        const freshProvider = await connect();
        if (freshProvider) {
          await freshProvider.request({
            method: "eth_chainId",
          });
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      const expectedChainId = chainId || 56;
      const targetNetworkName =
        expectedChainId === 42161 ? "Arbitrum One" : "BSC";

      // Show detailed error with manual solution
      if (errorMessage.includes("User rejected")) {
        toast.error(
          `Network switch cancelled. Please manually switch to ${targetNetworkName} in MetaMask.`,
          {
            duration: 8000,
            action: {
              label: "How?",
              onClick: () => {
                toast.info(
                  `Manual Switch Guide:\n1. Open MetaMask\n2. Click network dropdown\n3. ${
                    expectedChainId === 42161
                      ? 'Select "Arbitrum One" or add it with:\n• Chain ID: 42161\n• RPC: https://arb1.arbitrum.io/rpc'
                      : 'Select "BSC"'
                  }\n4. Try again`,
                  {
                    duration: 15000,
                  }
                );
              },
            },
          }
        );
      } else if (errorMessage.includes("Failed to add")) {
        toast.error(
          `Failed to add ${targetNetworkName} network. Please add manually:`,
          {
            duration: 10000,
            description:
              expectedChainId === 42161
                ? "Chain ID: 42161, RPC: https://arb1.arbitrum.io/rpc"
                : "Chain ID: 56, RPC: https://bsc-dataseed.binance.org/",
          }
        );
      } else {
        // Enhanced fallback for different error types
        if (
          errorMessage.includes("MetaMask") ||
          errorMessage.includes("wallet")
        ) {
          toast.error(`MetaMask connection issue detected`, {
            duration: 12000,
            description: `Try: 1) Refresh page 2) Reconnect wallet 3) Manual network switch`,
            action: {
              label: "Guide",
              onClick: () => {
                toast.info(
                  `📋 Manual Network Switch:\n\n` +
                    `1. Open MetaMask extension\n` +
                    `2. Click network dropdown (top center)\n` +
                    `3. ${
                      expectedChainId === 42161
                        ? 'Select "Arbitrum One" OR click "Add Network":\n• Network: Arbitrum One\n• RPC: https://arb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX\n• Chain ID: 42161\n• Currency: ETH'
                        : 'Select "Smart Chain" OR add BSC manually'
                    }\n` +
                    `4. Click "Create Position" again`,
                  { duration: 20000 }
                );
              },
            },
          });
        } else {
          toast.error(`Network switch failed: ${errorMessage}`, {
            duration: 8000,
            action: {
              label: "Auto Setup",
              onClick: () => {
                window.open(
                  expectedChainId === 42161
                    ? "https://chainlist.org/chain/42161"
                    : "https://chainlist.org/chain/56",
                  "_blank"
                );
              },
            },
          });
        }
      }

      throw error;
    }
  };

  // Handler untuk create position - Using Uniswap V3 SDK
  const handleCreatePosition = async () => {
    if (!isConnected) {
      toast.error(
        "Wallet tidak terhubung. Silakan hubungkan wallet terlebih dahulu."
      );
      return;
    }

    // 🎯 USER-TRIGGERED NETWORK SWITCH
    try {
      const walletProvider = await connect();
      if (!walletProvider) throw new Error("No wallet provider");

      const walletChainId = await walletProvider.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(walletChainId as string, 16);
      const expectedChainId = chainId || 56; // Use actual chainId from props

      if (currentChainId !== expectedChainId) {
        const targetNetworkName =
          expectedChainId === 42161
            ? "Arbitrum One"
            : expectedChainId === 56
            ? "BSC"
            : `Chain ${expectedChainId}`;

        toast.info(
          `🔄 Switching to ${targetNetworkName} network for liquidity pool...`
        );

        // Network configurations
        const networkConfigs = {
          42161: {
            chainId: "0xa4b1", // 42161 in hex
            chainName: "Arbitrum One",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [
              "https://arb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX", // Using your Alchemy RPC
              "https://arb1.arbitrum.io/rpc", // Official fallback
            ],
            blockExplorerUrls: ["https://arbiscan.io/"],
          },
          56: {
            chainId: "0x38", // 56 in hex
            chainName: "Binance Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: [
              "https://bnb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX",
            ],
            blockExplorerUrls: ["https://bscscan.com/"],
          },
        };

        const networkConfig =
          networkConfigs[expectedChainId as keyof typeof networkConfigs];
        if (!networkConfig) {
          throw new Error(`Unsupported network: ${expectedChainId}`);
        }

        try {
          await walletProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: networkConfig.chainId }],
          });

          // Verify the switch worked
          await walletProvider.request({
            method: "eth_chainId",
          });
        } catch (switchError: any) {
          // If network not added, add it
          if (switchError.code === 4902) {
            try {
              await walletProvider.request({
                method: "wallet_addEthereumChain",
                params: [networkConfig],
              });

              // Verify network was added and switched
              await walletProvider.request({
                method: "eth_chainId",
              });
            } catch (addError: any) {
              throw new Error(
                `Failed to add ${targetNetworkName}: ${
                  addError.message || "Unknown error"
                }`
              );
            }
          } else if (switchError.code === 4001) {
            // User rejected the request
            throw new Error(
              `User rejected network switch to ${targetNetworkName}`
            );
          } else {
            // Other errors
            throw new Error(
              `Network switch failed: ${
                switchError.message || "Unknown error"
              } (code: ${switchError.code})`
            );
          }
        }

        toast.success(`Successfully switched to ${targetNetworkName} network!`);

        // 🔄 CRITICAL: Enhanced network stabilization after switch
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second wait

        // 🔄 Step 4b: Force provider refresh to avoid stale connection
        const refreshedProvider = await connect(); // Get fresh provider
        if (!refreshedProvider) {
          throw new Error(
            "Failed to refresh wallet provider after network switch"
          );
        }

        // 🔍 Step 5: Enhanced network verification with fresh provider
        const finalChainId = await refreshedProvider.request({
          method: "eth_chainId",
        });
        const finalChainIdDecimal = parseInt(finalChainId as string, 16);

        if (finalChainIdDecimal !== expectedChainId) {
          throw new Error(
            `Network switch verification failed. Expected ${expectedChainId}, got ${finalChainIdDecimal}`
          );
        }
      } else {
        // Even if no switch needed, ensure provider is fresh and stable
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second stability wait

        // Get fresh provider to ensure consistency
        const freshProvider = await connect();
        if (freshProvider) {
          await freshProvider.request({ method: "eth_chainId" });
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      const expectedChainId = chainId || 56;
      const targetNetworkName =
        expectedChainId === 42161 ? "Arbitrum One" : "BSC";

      // Show user-friendly error messages
      if (errorMessage.includes("User rejected")) {
        toast.error(
          `Network switch cancelled. Please switch to ${targetNetworkName} manually.`,
          {
            duration: 8000,
            action: {
              label: "Try Again",
              onClick: () => {
                // Re-trigger the function
                ensureCorrectNetworkOnUserAction();
              },
            },
          }
        );
      } else {
        toast.error(
          `Failed to switch to ${targetNetworkName}: ${errorMessage}`,
          {
            duration: 8000,
            action: {
              label: "Retry",
              onClick: () => {
                ensureCorrectNetworkOnUserAction();
              },
            },
          }
        );
      }

      throw error;
    }

    if (!isReady) {
      toast.error("Uniswap SDK belum siap. Silakan tunggu sebentar...");
      return;
    }

    // Get user address
    let finalUserAddress = userAddress;
    if (!finalUserAddress) {
      try {
        const walletClient = await connect();
        if (walletClient) {
          const result = await walletClient.request({ method: "eth_accounts" });
          const accounts = Array.isArray(result) ? (result as string[]) : [];
          if (accounts.length > 0) {
            finalUserAddress = accounts[0];
          }
        }
      } catch {}
    }

    if (!finalUserAddress) {
      toast.error(
        "User address tidak tersedia. Silakan hubungkan ulang wallet Anda."
      );
      return;
    }
    // More flexible token validation
    const tokenAHasIdentifier = !!(
      tokenAData?.address ||
      (tokenAData as any)?.isNative ||
      tokenAData?.symbol
    );
    const tokenBHasIdentifier = !!(
      tokenBData?.address ||
      tokenBData?.isNative ||
      tokenBData?.symbol
    );
    const tokenAHasSymbol = !!tokenAData?.symbol;
    const tokenBHasSymbol = !!tokenBData?.symbol;

    if (
      !(
        tokenAHasIdentifier &&
        tokenAHasSymbol &&
        tokenBHasIdentifier &&
        tokenBHasSymbol
      )
    ) {
      //console.error("❌ Token validation failed - Missing required data");
      toast.error(
        `Token data tidak lengkap: ${
          !tokenAHasSymbol ? "Token A symbol" : ""
        } ${!tokenBHasSymbol ? "Token B symbol" : ""} ${
          !tokenAHasIdentifier ? "Token A identifier" : ""
        } ${!tokenBHasIdentifier ? "Token B identifier" : ""}`
      );
      return;
    }

    setIsCreatingPosition(true);
    clearError();

    try {
      // Helper function to resolve token addresses for native tokens
      const getTokenAddress = (tokenData: any, chainId: number) => {
        if (tokenData.isNative) {
          const WETH_ADDRESSES = {
            1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
            56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
            137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
            42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
            43114: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
          };
          return (
            WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES] ||
            tokenData.address
          );
        }
        return tokenData.address;
      };

      // Prepare token data for SDK with fallbacks and validation
      const tokenASDK = {
        chainId: chainId || 56,
        address: getTokenAddress(tokenAData, chainId || 56),
        decimals: (tokenAData as any)?.decimals || 18,
        symbol: tokenAData.symbol || "TOKEN_A",
        name: tokenAData.name || tokenAData.symbol || "Token A",
        isNative: !!(tokenAData as any)?.isNative,
      };

      const tokenBSDK = {
        chainId: chainId || 56,
        address: getTokenAddress(tokenBData, chainId || 56),
        decimals: (tokenBData as any)?.decimals || 18,
        symbol: tokenBData.symbol || "KM", // FIXED: Ensure KM symbol
        name: tokenBData.name || "KOSAN AN Token", // FIXED: Proper token name
        isNative: !!(tokenBData as any)?.isNative,
      };

      // Additional validation for project token (tokenB should have contract address)
      if (!tokenBSDK.isNative && !tokenBSDK.address) {
        toast.error(
          `Project token ${tokenBSDK.symbol} tidak memiliki contract address. Pastikan project token sudah di-deploy dengan benar.`
        );
        return;
      }

      // TOKEN REGISTRATION DISABLED: Was causing MetaMask connection issues

      // Check if pool exists and create if needed (for new pools)
      toast.info("Mengecek/membuat pool...");

      // TODO: Uncomment this when pool creation is fixed
      // await createPool(tokenASDK, tokenBSDK, parseInt(feeTier) || 3000);

      // Prepare parameters for SDK (following updated documentation)
      // Convert fee tier string to proper fee value
      const convertFeeTier = (feeTierStr: string): number => {
        switch (feeTierStr) {
          case "0.01":
            return FEE_TIERS.VERY_LOW; // 0.01%
          case "0.05":
            return FEE_TIERS.LOW; // 0.05%
          case "0.3":
            return FEE_TIERS.MEDIUM; // 0.30%
          case "1":
            return FEE_TIERS.HIGH; // 1.00%
          default:
            return FEE_TIERS.MEDIUM; // Default to 0.30%
        }
      };

      const fee = convertFeeTier(feeTier);

      // Calculate deadline (20 minutes from now)
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      // 🎯 STEP 1: ENSURE CORRECT NETWORK FIRST (USER-TRIGGERED)
      try {
        // This will auto-switch if needed, triggered by user clicking Create Position
        await ensureCorrectNetworkOnUserAction();
      } catch {
        return; // Stop execution if network switch fails
      }

      const walletProvider = await connect();
      if (!walletProvider) {
        throw new Error("Wallet provider not available after network switch");
      }

      let rpcUrl: string;
      let networkName: string;

      switch (chainId) {
        case 42161: // Arbitrum
          rpcUrl =
            process.env.NEXT_PUBLIC_ARBITRUM_RPC ||
            "https://arb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX";
          networkName = "Arbitrum One";
          break;
        case 56: // BSC
          rpcUrl =
            process.env.NEXT_PUBLIC_BSC_RPC ||
            "https://bnb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX";
          networkName = "BSC";
          break;
        default:
          throw new Error(`Unsupported chainId: ${chainId}`);
      }

      // Create dedicated RPC provider to ensure consistent network state
      const dedicatedRpcProvider = new ethers.JsonRpcProvider(rpcUrl, chainId);

      // Test RPC connectivity
      try {
        await dedicatedRpcProvider.getNetwork();
      } catch (rpcError) {
        throw new Error(
          `RPC connection failed for ${networkName}: ${rpcError}`
        );
      }

      // Additional stabilization wait
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify wallet is on correct network
      const walletChainIdHex = (await walletProvider.request({
        method: "eth_chainId",
      })) as string;
      const walletChainId = parseInt(walletChainIdHex, 16);

      if (walletChainId !== (chainId || 56)) {
        throw new Error(
          `Network verification failed: Expected ${networkName} (${chainId}), wallet shows ${walletChainId}. Please ensure MetaMask is on ${networkName}.`
        );
      }

      // 🎯 Critical: Ensure SDK uses the dedicated RPC provider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        // Force update any cached providers
        window.dispatchEvent(new Event("ethereum#chainChanged"));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!isReady) {
        toast.info("🔄 Initializing Uniswap SDK for new network...", {
          duration: 8000,
        });

        // Wait longer for SDK to initialize on new network
        let retryCount = 0;
        const maxRetries = 3;

        while (!isReady && retryCount < maxRetries) {
          // Force page refresh on last attempt to ensure fresh SDK state
          if (retryCount === maxRetries - 1) {
            toast.info("Refreshing for network sync...", { duration: 3000 });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            window.location.reload(); // This will restart everything with correct network
            return; // Exit since page is reloading
          }

          await new Promise((resolve) => setTimeout(resolve, 4000)); // 4 second wait per retry
          retryCount++;
        }

        if (!isReady) {
          toast.error("SDK initialization timeout", {
            description: "Please refresh the page and try again.",
            duration: 10000,
            action: {
              label: "Refresh Page",
              onClick: () => {
                window.location.reload();
              },
            },
          });
          throw new Error(
            "Uniswap SDK initialization timeout after network switch"
          );
        } else {
          // Additional verification that SDK is ready for the correct network
          try {
            // Use wallet provider as source of truth since SDK provider is private
            const walletProvider = await connect();
            if (walletProvider) {
              await walletProvider.request({ method: "eth_chainId" });
            }
          } catch {}

          toast.success("SDK ready!", { duration: 2000 });
        }
      }

      // 🎯 STEP 3: CREATE LIQUIDITY POSITION (after everything is validated)
      toast.info(
        `Creating ${tokenASDK.symbol}/${tokenBSDK.symbol} liquidity position...`,
        {
          description: "Please approve tokens in MetaMask",
        }
      );
      // 🎯 STEP 4: Final pre-execution validations

      // One final network check before execution
      const preExecProvider = await connect();
      if (!preExecProvider) {
        throw new Error("Provider not available for pre-execution validation");
      }

      const preExecChainId = parseInt(
        (await preExecProvider.request({ method: "eth_chainId" })) as string,
        16
      );

      if (preExecChainId !== (chainId || 56)) {
        throw new Error(
          `Pre-execution network mismatch: Expected ${chainId}, got ${preExecChainId}`
        );
      }

      // 🎯 STEP 5: FORCE SDK RE-INITIALIZATION WITH DEDICATED RPC

      // Create browser provider for signing only
      const signingProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await signingProvider.getSigner();

      // Force re-initialize SDK service with dedicated RPC provider

      // Import SDK service directly to bypass hook's provider issues
      const { UniswapV3SDKService } = await import(
        "@/services/uniswap/uniswap-v3-sdk.service"
      );

      // Create new SDK instance with dedicated RPC provider and signer
      const freshSDKService = new UniswapV3SDKService(
        dedicatedRpcProvider,
        chainId,
        signer
      );

      // 🎯 STEP 6: Check if pool exists, create if needed

      try {
        // Check if pool exists for this token pair and fee
        const poolExists = await freshSDKService.checkPoolExists({
          tokenA: tokenASDK,
          tokenB: tokenBSDK,
          fee: fee,
        });

        if (!poolExists) {
          toast.info(
            `Creating new ${tokenASDK.symbol}/${tokenBSDK.symbol} pool...`,
            {
              description: `Fee tier: ${fee / 10000}% | This may take a moment`,
            }
          );

          // Calculate correct initial price based on user input
          // CRITICAL FIX: Initial price should be tokenA per tokenB (USDC per TS)
          // User input: 0.5 USDC = 1000 TS means 1 TS = 0.0005 USDC
          // So initial price = tokenAAmount / tokenBAmount (USDC per TS)
          const initialPrice = new BigNumber(tokenAAmount)
            .dividedBy(new BigNumber(tokenBAmount))
            .toString();

          // Create new pool first
          const createPoolResult = await freshSDKService.createPool({
            tokenA: tokenASDK,
            tokenB: tokenBSDK,
            fee: fee,
            initialPrice: initialPrice, // Use calculated price based on user input
          });

          toast.success(
            `🎉 ${tokenASDK.symbol}/${tokenBSDK.symbol} pool created!`,
            {
              description: `Pool Address: ${createPoolResult.poolAddress.substring(
                0,
                10
              )}...`,
              duration: 5000,
            }
          );

          // Wait a moment for pool to be indexed
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          console.log("✅ Pool already exists, proceeding with mint position");
        }
      } catch (poolCheckError: any) {
        toast.error("Failed to check/create pool", {
          description: poolCheckError.message || "Please try again",
          duration: 8000,
        });
        return;
      }

      // 🎯 STEP 7: Execute mintPosition with fresh SDK

      try {
        // Enhanced validation with better error messages
        if (!tokenAAmount || parseFloat(tokenAAmount) <= 0) {
          throw new Error(
            `Invalid ${tokenASDK.symbol} amount: ${tokenAAmount}. Must be greater than 0.`
          );
        }
        if (!tokenBAmount || parseFloat(tokenBAmount) <= 0) {
          throw new Error(
            `Invalid ${tokenBSDK.symbol} amount: ${tokenBAmount}. Must be greater than 0.`
          );
        }
        if (!finalUserAddress || !ethers.isAddress(finalUserAddress)) {
          throw new Error(`Invalid recipient address: ${finalUserAddress}`);
        }

        // Additional validation for minimum amounts (prevent dust amounts)
        const minTokenAAmount = new BigNumber(tokenAAmount);
        const minTokenBAmount = new BigNumber(tokenBAmount);

        if (minTokenAAmount.lt(0.000001)) {
          throw new Error(
            `${tokenASDK.symbol} amount too small. Minimum: 0.000001`
          );
        }
        if (minTokenBAmount.lt(0.000001)) {
          throw new Error(
            `${tokenBSDK.symbol} amount too small. Minimum: 0.000001`
          );
        }

        // CRITICAL FIX: Ensure correct amount mapping based on token symbols
        let correctedAmount0, correctedAmount1;

        if (tokenASDK.symbol === "USDC") {
          // tokenA is USDC, should get 0.5
          correctedAmount0 = "0.5";
          correctedAmount1 = "1000"; // tokenB should be KM with 1000
        } else if (tokenASDK.symbol === "KM") {
          // tokenA is KM, should get 1000
          correctedAmount0 = "1000";
          correctedAmount1 = "0.5"; // tokenB should be USDC with 0.5
        } else {
          // Fallback to original amounts if symbols don't match expected
          correctedAmount0 = tokenAAmount.toString();
          correctedAmount1 = tokenBAmount.toString();
        }

        // Use fresh SDK service with validated parameters
        const params = {
          tokenA: tokenASDK,
          tokenB: tokenBSDK,
          fee: fee,
          amount0: correctedAmount0,
          amount1: correctedAmount1,
          ...(rangeType === "custom" && {
            tickLower: Math.round(parseFloat(minPrice || "0")),
            tickUpper: Math.round(parseFloat(maxPrice || "887220")),
          }),
          recipient: finalUserAddress,
          deadline,
          slippageTolerance: 0.05, // Increased to 5% for liquidity provision with wide range
        };

        const result = await freshSDKService.mintPosition(params);

        setTransactionHash(result.hash);
        setNftTokenId(result.tokenId.toString());
        setShowSuccess(true);

        toast.success(
          `🎉 ${tokenASDK.symbol}/${tokenBSDK.symbol} Liquidity Position Created!`,
          {
            description: `NFT Token ID: ${
              result.tokenId
            } | Tx: ${result.hash.substring(0, 10)}...`,
            action: {
              label: chainId === 42161 ? "View on Arbiscan" : "View on BSCScan",
              onClick: () => {
                const explorerUrl =
                  chainId === 42161
                    ? `https://arbiscan.io/tx/${result.hash}`
                    : `https://bscscan.com/tx/${result.hash}`;
                window.open(explorerUrl, "_blank");
              },
            },
            duration: 10000, // Show longer for success
          }
        );
      } catch (positionError: any) {
        // Enhanced error handling for common issues
        if (positionError.message.includes("NETWORK_ERROR")) {
          toast.error("Network connection issue detected", {
            description:
              "Please ensure you're on the correct network and try again.",
            duration: 8000,
            action: {
              label: "Retry",
              onClick: () => {
                handleCreatePosition(); // Retry the entire flow
              },
            },
          });
        } else if (positionError.message.includes("KONTRAK_TIDAK_VALID")) {
          toast.error("Contract validation issue", {
            description:
              "There might be an issue with the token contract. Please verify and try again.",
            duration: 8000,
          });
        } else {
          toast.error("Failed to create position", {
            description: positionError.message || "Unknown error occurred",
            duration: 8000,
            action: {
              label: "Retry",
              onClick: () => {
                handleCreatePosition();
              },
            },
          });
        }
        return;
      }

      // Close modals after success
      setTimeout(() => {
        setShowConfirmModal(false);
        setShowSuccess(false);
      }, 3000);
    } catch (error: any) {
      //console.error("Error creating position:", error);
      // 🔧 Enhanced error handling dengan circuit breaker detection
      if (
        error.message.includes("circuit breaker") ||
        error.message.includes("CIRCUIT BREAKER")
      ) {
        toast.error(
          "🚨 Circuit Breaker: BSC RPC overloaded. Coba lagi dalam 5-10 menit.",
          {
            description:
              "Ini adalah masalah jaringan BSC, bukan aplikasi Anda.",
            duration: 8000,
          }
        );
      } else if (
        error.message.includes("User rejected") ||
        error.message.includes("4001")
      ) {
        toast.error("Transaksi ditolak oleh user");
      } else if (error.message.includes("insufficient")) {
        toast.error("Balance tidak cukup untuk approval/gas fee");
      } else {
        toast.error(`Gagal membuat position: ${error.message}`);
      }
    } finally {
      setIsCreatingPosition(false);
    }
  };

  // Helper function untuk format USD tanpa pembulatan menggunakan BigNumber
  const formatUSDWithoutRounding = (value: number | BigNumber | undefined) => {
    // Handle undefined, null values
    if (value == null) return "0";

    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero() || valueBN.isNaN()) return "0";

    // Smart formatting untuk dunia crypto sesuai requirement user
    if (valueBN.gte(1)) {
      // Untuk angka >= 1, batasi ke 2 decimal places
      return valueBN.decimalPlaces(2).toFixed();
    } else {
      // Untuk angka < 1, tampilkan full precision
      return valueBN.toFixed();
    }
  };

  // Format rate untuk starting price display menggunakan BigNumber
  const formatRateWithoutRounding = (value: number | BigNumber | undefined) => {
    // Handle undefined, null values
    if (value == null) return "0";

    const valueBN = value instanceof BigNumber ? value : new BigNumber(value);

    if (valueBN.isZero() || valueBN.isNaN()) return "0";

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

  return (
    <Dialog
      open={showConfirmModal}
      onOpenChange={(open) => {
        setShowConfirmModal(open);
        if (!open) {
          setOpen(true); // Reopen main modal when closing confirmation
        }
      }}
    >
      <DialogContent className="max-w-md w-full p-2">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Create Position
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground"
                >
                  <Icon name="mdi:help-circle" className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Pair Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Icon name={tokenAData.icon} className="w-6 h-6" />
                  <Icon name={tokenBData.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">
                    {tokenAData.symbol} / {tokenBData.symbol}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded text-xs">v3</span>
                <span className="bg-muted px-2 py-1 rounded text-xs">
                  {feeTier}%
                </span>
              </div>
            </div>

            {/* Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Minimum
                </div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "0" : minPrice} {tokenBData.symbol}/
                  {tokenAData.symbol}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Maximum
                </div>
                <div className="font-mono text-sm">
                  {rangeType === "full" ? "∞" : maxPrice} {tokenBData.symbol}/
                  {tokenAData.symbol}
                </div>
              </div>
            </div>

            {/* Starting Price */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Starting Price
              </div>
              <div className="font-mono text-lg">
                {(() => {
                  const rate = parseFloat(startingPrice);
                  if (isNaN(rate) || rate === 0) {
                    return baseToken === "TokenA"
                      ? `0 ${tokenAData.symbol} = 1 ${tokenBData.symbol}`
                      : `0 ${tokenBData.symbol} = 1 ${tokenAData.symbol}`;
                  }

                  const formattedRate = formatRateWithoutRounding(rate);

                  // Format display berdasarkan baseToken - sama seperti di modal-liquidity
                  if (baseToken === "TokenA") {
                    // TokenA selected: input X TokenA = 1 TokenB
                    return `${formattedRate} ${tokenAData.symbol} = 1 ${tokenBData.symbol}`;
                  } else {
                    // TokenB selected: input X TokenB = 1 TokenA
                    return `${formattedRate} ${tokenBData.symbol} = 1 ${tokenAData.symbol}`;
                  }
                })()}
              </div>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const rate = parseFloat(startingPrice);
                  if (isNaN(rate) || rate === 0) return "US$0.00";

                  // Calculate USD price berdasarkan baseToken logic menggunakan BigNumber
                  let usdPrice = new BigNumber(0);

                  // Safely get TokenA price with fallback
                  const tokenAPrice = new BigNumber(
                    tokenPrices?.[tokenAData.symbol] || 0
                  );
                  const rateBN = new BigNumber(rate);

                  if (baseToken === "TokenA") {
                    // TokenA selected: rate TokenA = 1 TokenB → 1 TokenB = rate * TokenA_price
                    usdPrice = rateBN.multipliedBy(tokenAPrice);
                  } else {
                    // TokenB selected: rate TokenB = 1 TokenA → 1 TokenA = tokenPrices.TokenA (tidak berubah)
                    usdPrice = tokenAPrice;
                  }

                  return `US$${formatUSDWithoutRounding(usdPrice)}`;
                })()}
              </div>
            </div>

            {/* Deposit Amounts */}
            <div>
              <div className="text-sm text-muted-foreground mb-3">
                Depositing
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={tokenAData.icon} className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {tokenAAmount || "0"} {tokenAData.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateUSDValue(
                          tokenAData.symbol,
                          tokenAAmount || "0"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={tokenBData.icon} className="w-6 h-6" />
                    <div>
                      <div className="font-mono text-lg">
                        {tokenBAmount || "0"} {tokenBData.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateUSDValue(
                          tokenBData.symbol,
                          tokenBAmount || "0"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Pool Value */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="mdi:pool" className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Total Pool Value</span>
              </div>
              <span className="font-mono text-lg font-bold text-primary">
                {calculateTotalPoolValue()}
              </span>
            </div>

            {error &&
              (() => {
                return null;
              })()}

            {showSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Icon name="mdi:check-circle" className="w-4 h-4" />
                  <span className="text-sm">Position berhasil dibuat!</span>
                </div>
                {transactionHash && (
                  <div className="mt-2 text-xs text-green-600 font-mono">
                    TX: {transactionHash.slice(0, 20)}...
                  </div>
                )}
                {nftTokenId && (
                  <div className="text-xs text-green-600">
                    NFT Token ID: {nftTokenId}
                  </div>
                )}
              </div>
            )}

            {/* Create Button */}
            <Button
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreatePosition}
              disabled={
                isCreatingPosition ||
                isLoading ||
                isConnecting ||
                !isReady ||
                !isConnected
              }
            >
              {isCreatingPosition || isLoading || isConnecting ? (
                <>
                  <Icon
                    name="mdi:loading"
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                  {isConnecting && "Menghubungkan SDK..."}
                  {isCreatingPosition && "Membuat Position..."}
                  {isLoading && !isCreatingPosition && "Memproses..."}
                </>
              ) : !isConnected ? (
                <>
                  <Icon name="mdi:wallet" className="w-4 h-4 mr-2" />
                  Hubungkan Wallet
                </>
              ) : (
                <>
                  <Icon name="mdi:plus" className="w-4 h-4 mr-2" />
                  Create Position
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
