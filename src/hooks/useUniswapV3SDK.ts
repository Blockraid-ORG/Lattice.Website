import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { toast } from "sonner";
import { UniswapV3SDKService } from "@/services/uniswap/uniswap-v3-sdk.service";
import { UniswapSwapAndAddService } from "@/services/uniswap/uniswap-swap-add.service";
import {
  TokenData,
  PositionInfo,
  EnhancedPositionInfo,
  MintResult,
  CollectResult,
} from "@/types/uniswap";

interface UseUniswapV3State {
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  positions: PositionInfo[];
  sdkService: UniswapV3SDKService | null;
  swapAddService: UniswapSwapAndAddService | null;
}

/**
 * Main Uniswap V3 SDK Hook - Following Official Documentation
 * Integrates all Uniswap V3 SDK services in one convenient hook
 */
export function useUniswapV3SDK(chainId: number = 56) {
  const [state, setState] = useState<UseUniswapV3State>({
    isLoading: false,
    isConnecting: false,
    error: null,
    positions: [],
    sdkService: null,
    swapAddService: null,
  });

  const { connect, isConnected } = useWeb3AuthConnect();

  // 🔧 BSC Network Switching Helper (Simple Version)
  const switchToBSC = async (provider: any) => {
    try {
      // BSC Mainnet Configuration
      const bscConfig = {
        chainId: "0x38", // 56 in hex
        chainName: "Binance Smart Chain",
        nativeCurrency: {
          name: "BNB",
          symbol: "BNB",
          decimals: 18,
        },
        rpcUrls: [
          process.env.NEXT_PUBLIC_BSC_RPC ||
            "https://bsc-dataseed1.binance.org/",
        ],
        blockExplorerUrls: ["https://bscscan.com/"],
      };

      try {
        // Try to switch to BSC
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (switchError: any) {
        // If BSC network not added, add it first
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [bscConfig],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error("❌ Failed to switch to BSC:", error);
      throw new Error(`Failed to switch to BSC: ${(error as Error).message}`);
    }
  };

  // Update state helper
  const updateState = useCallback((updates: Partial<UseUniswapV3State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Initialize SDK services when wallet is connected
  useEffect(() => {
    const initializeServices = async () => {
      if (!isConnected) {
        updateState({
          sdkService: null,
          swapAddService: null,
          positions: [],
        });
        return;
      }

      try {
        updateState({ isConnecting: true, error: null });

        const provider = await connect();
        if (!provider) throw new Error("No provider available");

        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        // 🔧 CRITICAL FIX: Override provider dengan Circuit Breaker Protection
        let finalProvider = ethersProvider;
        if (chainId === 56) {
          // 🔧 Load comprehensive RPC providers dari constants
          const { BSC_RPC_PROVIDERS } = await import("@/data/constants");
          const rpcProviders = [...BSC_RPC_PROVIDERS];

          let workingProvider = null;

          for (const rpcUrl of rpcProviders) {
            try {
              const providerName = rpcUrl.includes("alchemy")
                ? "Alchemy"
                : rpcUrl.includes("binance")
                ? "Binance"
                : rpcUrl.includes("ankr")
                ? "Ankr"
                : "PublicNode";

              const testProvider = new ethers.JsonRpcProvider(rpcUrl);

              // Quick connectivity test dengan timeout protection
              const testPromise = Promise.all([
                testProvider.getNetwork(),
                testProvider.getBlockNumber(),
              ]);

              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("RPC timeout")), 5000)
              );

              const [network, blockNumber] = (await Promise.race([
                testPromise,
                timeoutPromise,
              ])) as any;

              workingProvider = testProvider;
              break; // Use first working provider
            } catch (providerError) {
              continue; // Try next provider
            }
          }

          if (workingProvider) {
            finalProvider = workingProvider as any;
          } else {
            // 🚨 Alert user about potential circuit breaker issues
            toast.warning(
              "⚠️ All BSC RPC providers are experiencing issues. Transaction may fail due to circuit breaker. Please try again later."
            );
          }
        }

        // Test network connection with RPC endpoint info
        try {
          const network = await ethersProvider.getNetwork();

          // Test provider RPC endpoint
          let rpcEndpoint = "Unknown";
          try {
            // Try to get RPC URL if available (might not always work)
            rpcEndpoint =
              (ethersProvider as any)?._getConnection?.()?.url ||
              "Web3Auth Provider";
          } catch (e) {
            rpcEndpoint = "Web3Auth Provider";
          }

          // Test basic RPC functionality
          const blockNumber = await ethersProvider.getBlockNumber();

          if (Number(network.chainId) !== chainId) {
            // 🔄 AUTOMATIC NETWORK SWITCHING untuk BSC
            if (chainId === 56) {
              await switchToBSC(provider);
            }
          }
        } catch (networkError) {
          console.error("❌ Network connection test failed:", networkError);
        }

        // Initialize SDK services dengan provider yang sudah di-override
        const sdkService = new UniswapV3SDKService(
          finalProvider,
          chainId,
          signer
        );
        const swapAddService = new UniswapSwapAndAddService(
          finalProvider,
          signer,
          chainId
        );

        updateState({
          sdkService,
          swapAddService,
          isConnecting: false,
        });
      } catch (error) {
        console.error("❌ Error initializing SDK services:", error);
        updateState({
          error: (error as Error).message,
          isConnecting: false,
        });
      }
    };

    initializeServices();
  }, [isConnected, connect, chainId, updateState]);

  /**
   * 1. LIQUIDITY POSITIONS & FETCHING POSITIONS
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/position-data
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/fetching-positions
   */

  const fetchUserPositions = useCallback(
    async (userAddress: string): Promise<PositionInfo[]> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        const positions = await state.sdkService.fetchUserPositions(
          userAddress
        );

        updateState({
          positions,
          isLoading: false,
        });

        return positions;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to fetch positions: ${errorMessage}`);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  /**
   * Fetch enhanced positions for UI components that need full SDK instances
   * This provides backward compatibility for existing components
   */
  const fetchEnhancedPositions = useCallback(
    async (userAddress: string): Promise<EnhancedPositionInfo[]> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        // Get basic positions first
        const basicPositions = await state.sdkService.fetchUserPositions(
          userAddress
        );

        // Convert to enhanced positions with full SDK instances
        const enhancedPositions: EnhancedPositionInfo[] = [];

        for (const basicPosition of basicPositions) {
          const enhanced = await state.sdkService.getEnhancedPositionInfo(
            basicPosition.tokenId
          );
          if (enhanced) {
            enhancedPositions.push(enhanced);
          }
        }

        updateState({
          positions: basicPositions, // Keep basic positions in state
          isLoading: false,
        });

        return enhancedPositions;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to fetch enhanced positions: ${errorMessage}`);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  const getPositionInfo = useCallback(
    async (tokenId: number): Promise<PositionInfo | null> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        return await state.sdkService.getPositionInfo(tokenId);
      } catch (error) {
        console.error("Error getting position info:", error);
        toast.error("Failed to get position info");
        return null;
      }
    },
    [state.sdkService]
  );

  /**
   * 2. MINTING A POSITION
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/minting
   */

  const mintPosition = useCallback(
    async (params: {
      tokenA: TokenData;
      tokenB: TokenData;
      fee: number;
      amount0: string;
      amount1: string;
      tickLower?: number;
      tickUpper?: number;
      recipient: string;
      deadline: number;
      slippageTolerance: number;
    }): Promise<MintResult> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        const result = await state.sdkService.mintPosition(params);

        updateState({ isLoading: false });
        toast.success("Position created successfully!");

        return result;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to create position: ${errorMessage}`);
        console.error("Failed to create position:", error);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  /**
   * 3. ADDING & REMOVING LIQUIDITY
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/modifying-position
   */

  const addLiquidity = useCallback(
    async (params: {
      tokenId: number;
      amount0: string;
      amount1: string;
      fractionToAdd?: number; // Following docs: multiplier for increase
      slippageTolerance: number;
      deadline: number;
    }): Promise<string> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        const txHash = await state.sdkService.addLiquidity(params);

        updateState({ isLoading: false });
        toast.success("Liquidity added successfully!");

        return txHash;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to add liquidity: ${errorMessage}`);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  const removeLiquidity = useCallback(
    async (params: {
      tokenId: number;
      fractionToRemove: number; // Following docs: 0.0 - 1.0 (e.g., 0.5 = remove 50%)
      slippageTolerance: number;
      deadline: number;
      collectFees?: boolean; // Following docs: collect fees during removal
    }): Promise<string> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        const txHash = await state.sdkService.removeLiquidity(params);

        updateState({ isLoading: false });
        toast.success("Liquidity removed successfully!");

        return txHash;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to remove liquidity: ${errorMessage}`);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  /**
   * 4. COLLECTING FEES
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/collecting-fees
   */

  const collectFees = useCallback(
    async (params: {
      tokenId: number;
      recipient?: string; // Following docs: recipient address for fees
    }): Promise<CollectResult> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        const result = await state.sdkService.collectFees(params);

        updateState({ isLoading: false });
        toast.success("Fees collected successfully!");

        return result;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to collect fees: ${errorMessage}`);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  /**
   * 5. SWAPPING AND ADDING LIQUIDITY
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/swapping-and-adding-liquidity
   */

  const swapAndAddLiquidity = useCallback(
    async (params: {
      inputToken: TokenData;
      outputTokenA: TokenData;
      outputTokenB: TokenData;
      fee: number;
      inputAmount: string; // Human readable amount
      tickLower?: number; // Optional, will calculate if not provided
      tickUpper?: number; // Optional, will calculate if not provided
      slippageTolerance: number;
      deadline: number;
      positionId?: number; // Optional, for adding to existing position
    }): Promise<string> => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        updateState({ isLoading: true, error: null });

        const txHash = await state.sdkService.swapAndAddLiquidity(params);

        updateState({ isLoading: false });
        toast.success("Swap and add liquidity completed successfully!");

        return txHash;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(`Failed to swap and add liquidity: ${errorMessage}`);
        throw error;
      }
    },
    [state.sdkService, updateState]
  );

  /**
   * Helper functions
   */

  const createPool = useCallback(
    async (tokenA: TokenData, tokenB: TokenData, fee: number) => {
      if (!state.sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        const pool = await state.sdkService.getPool(tokenA, tokenB, fee);
        return pool;
      } catch (error) {
        console.error("Error creating pool:", error);
        return null;
      }
    },
    [state.sdkService]
  );

  const calculateOptimalTicks = useCallback(
    (currentTick: number, fee: number, range: number = 1000) => {
      if (!state.sdkService) {
        return { tickLower: 0, tickUpper: 0 };
      }

      return state.sdkService.calculateTicks(currentTick, fee, range);
    },
    [state.sdkService]
  );

  const getOptimalTickRange = useCallback(
    (currentTick: number, fee: number, rangeMultiplier: number = 1.2) => {
      if (!state.swapAddService) {
        return { tickLower: 0, tickUpper: 0 };
      }

      return state.swapAddService.getOptimalTickRange(
        currentTick,
        fee,
        rangeMultiplier
      );
    },
    [state.swapAddService]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    // State
    isLoading: state.isLoading,
    isConnecting: state.isConnecting,
    isReady: !!state.sdkService && !!state.swapAddService,
    error: state.error,
    positions: state.positions,

    // Position Management (Following official docs)
    fetchUserPositions,
    fetchEnhancedPositions, // For backward compatibility with existing components
    getPositionInfo,
    mintPosition,

    // Liquidity Management (Following official docs)
    addLiquidity,
    removeLiquidity,

    // Fee Collection (Following official docs)
    collectFees,

    // Swap and Add (Following official docs)
    swapAndAddLiquidity,

    // Pool Operations
    createPool,

    // Helper Functions
    calculateOptimalTicks,
    getOptimalTickRange,
    clearError,

    // Services (for advanced usage)
    sdkService: state.sdkService,
    swapAddService: state.swapAddService,
  };
}
