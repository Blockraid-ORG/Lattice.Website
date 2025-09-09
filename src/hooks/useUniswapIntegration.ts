import { useState, useCallback } from "react";
import BigNumber from "bignumber.js";
import { toast } from "sonner";
import { UniswapPoolService } from "@/services/uniswap/uniswap-pool.service";
import { UniswapPoolCreationService } from "@/services/uniswap/uniswap-pool-creation.service";
import {
  UniswapLiquidityService,
  type AddLiquidityParams,
  type LiquidityResult,
} from "@/services/uniswap/uniswap-liquidity.service";
import { FEE_TIERS } from "@/lib/uniswap/constants";
import { TokenBalanceService } from "@/services/token-balance.service";

interface UniswapIntegrationState {
  isLoading: boolean;
  isChecking: boolean;
  isCreating: boolean;
  poolExists: boolean;
  poolAddress: string | null;
  error: string | null;
  transactionHash: string | null;
  nftTokenId: string | null;
}

interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  liquidity: string;
  tick: number;
  sqrtPriceX96: string;
}

interface AddLiquidityInput {
  tokenAAddress: string;
  tokenBAddress: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenAAmount: string;
  tokenBAmount: string;
  feeTier: string; // "0.05", "0.3", "1"
  startingPrice?: string;
  slippageTolerance?: number;
  chainId: number;
  userAddress: string;
}

export function useUniswapIntegration() {
  const [state, setState] = useState<UniswapIntegrationState>({
    isLoading: false,
    isChecking: false,
    isCreating: false,
    poolExists: false,
    poolAddress: null,
    error: null,
    transactionHash: null,
    nftTokenId: null,
  });

  // Helper untuk update state
  const updateState = useCallback(
    (updates: Partial<UniswapIntegrationState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Convert fee tier string ke number
  const convertFeeTier = useCallback((feeTierStr: string): number => {
    switch (feeTierStr) {
      case "0.05":
        return FEE_TIERS.LOW;
      case "0.3":
        return FEE_TIERS.MEDIUM;
      case "1":
        return FEE_TIERS.HIGH;
      default:
        return FEE_TIERS.MEDIUM;
    }
  }, []);

  // Cek apakah pool sudah ada
  const checkPoolExists = useCallback(
    async (
      tokenA: string,
      tokenB: string,
      feeTier: string,
      chainId: number
    ): Promise<string | null> => {
      updateState({ isChecking: true, error: null });

      try {
        const fee = convertFeeTier(feeTier);
        const poolAddress = await UniswapPoolService.checkPoolExists(
          tokenA,
          tokenB,
          fee,
          chainId
        );

        updateState({
          isChecking: false,
          poolExists: !!poolAddress,
          poolAddress,
        });

        return poolAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to check pool";
        updateState({
          isChecking: false,
          error: errorMessage,
          poolExists: false,
          poolAddress: null,
        });

        "Error checking pool:", error;
        return null;
      }
    },
    [convertFeeTier, updateState]
  );

  // Buat pool baru
  const createPool = useCallback(
    async (
      tokenA: string,
      tokenB: string,
      feeTier: string,
      initialPrice: string,
      chainId: number,
      walletClient: any
    ): Promise<string | null> => {
      if (!walletClient) {
        toast.error("Wallet tidak terhubung");
        return null;
      }

      updateState({ isCreating: true, error: null });

      try {
        const fee = convertFeeTier(feeTier);
        const priceRatio = new BigNumber(initialPrice || "1");

        const poolAddress = await UniswapPoolCreationService.createPool({
          tokenA,
          tokenB,
          fee,
          initialPriceRatio: priceRatio,
          chainId,
          walletClient,
        });

        updateState({
          isCreating: false,
          poolExists: true,
          poolAddress,
        });

        toast.success("Pool berhasil dibuat!");
        return poolAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create pool";
        updateState({
          isCreating: false,
          error: errorMessage,
        });

        toast.error(`Gagal membuat pool: ${errorMessage}`);
        "Error creating pool:", error;
        return null;
      }
    },
    [convertFeeTier, updateState]
  );

  // Dapatkan informasi pool
  const getPoolInfo = useCallback(
    async (poolAddress: string, chainId: number): Promise<PoolInfo | null> => {
      try {
        const poolInfo = await UniswapPoolService.getPoolInfo(
          poolAddress,
          chainId
        );
        return {
          address: poolAddress,
          ...poolInfo,
        };
      } catch (error) {
        "Error getting pool info:", error;
        return null;
      }
    },
    []
  );

  // Initialize TokenBalanceService
  const initializeServices = useCallback(
    async (walletClient: any, userAddress: string): Promise<boolean> => {
      try {
        const initialized = await TokenBalanceService.initialize(
          walletClient,
          userAddress
        );
        return initialized;
      } catch (error) {
        return false;
      }
    },
    []
  );

  // Tambah liquidity
  const addLiquidity = useCallback(
    async (
      input: AddLiquidityInput,
      walletClient: any
    ): Promise<LiquidityResult | null> => {
      if (!walletClient) {
        toast.error("Wallet tidak terhubung");
        return null;
      }

      updateState({ isLoading: true, error: null });

      try {
        // Initialize services
        const initialized = await initializeServices(
          walletClient,
          input.userAddress
        );
        if (!initialized) {
          throw new Error("Failed to initialize services");
        }

        // Prepare parameters
        const params: AddLiquidityParams = {
          tokenA: input.tokenAAddress,
          tokenB: input.tokenBAddress,
          fee: convertFeeTier(input.feeTier),
          amountA: new BigNumber(input.tokenAAmount),
          amountB: new BigNumber(input.tokenBAmount),
          slippageTolerance: input.slippageTolerance || 0.01, // 1% default
          chainId: input.chainId,
          walletClient,
          userAddress: input.userAddress,
          useFullRange: true, // Default ke full range
        };

        // Execute add liquidity
        const result = await UniswapLiquidityService.addLiquidity(params);

        updateState({
          isLoading: false,
          transactionHash: result.transactionHash,
          nftTokenId: result.tokenId,
        });

        toast.success("Liquidity berhasil ditambahkan!");

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add liquidity";
        updateState({
          isLoading: false,
          error: errorMessage,
        });

        // Provide user-friendly error messages
        let userMessage = "Gagal menambahkan liquidity";
        if (errorMessage.includes("Pool does not exist")) {
          userMessage = "Pool belum dibuat. Silakan buat pool terlebih dahulu.";
        } else if (errorMessage.includes("insufficient")) {
          userMessage = "Saldo tidak mencukupi untuk transaksi ini.";
        } else if (errorMessage.includes("slippage")) {
          userMessage =
            "Transaksi gagal karena slippage. Coba tingkatkan toleransi slippage.";
        } else if (errorMessage.includes("rejected")) {
          userMessage = "Transaksi dibatalkan oleh user.";
        }

        toast.error(userMessage);
        return null;
      }
    },
    [convertFeeTier, initializeServices, updateState]
  );

  // Ambil posisi user
  const getUserPositions = useCallback(
    async (
      userAddress: string,
      chainId: number,
      walletClient: any
    ): Promise<any[]> => {
      if (!walletClient) return [];

      try {
        const positions = await UniswapLiquidityService.getUserPositions(
          userAddress,
          chainId,
          walletClient
        );
        return positions;
      } catch (error) {
        return [];
      }
    },
    []
  );

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isChecking: false,
      isCreating: false,
      poolExists: false,
      poolAddress: null,
      error: null,
      transactionHash: null,
      nftTokenId: null,
    });
    TokenBalanceService.reset();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    // State
    ...state,

    // Actions
    checkPoolExists,
    createPool,
    getPoolInfo,
    addLiquidity,
    getUserPositions,
    reset,
    clearError,

    // Utils
    convertFeeTier,
  };
}
