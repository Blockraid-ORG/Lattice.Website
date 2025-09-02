import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { toast } from "sonner";
import { UniswapV3SDKService } from "@/services/uniswap/uniswap-v3-sdk.service";
import { UniswapLiquidityService } from "@/services/uniswap/uniswap-liquidity.service";
import { BSC_RPC_PROVIDERS, ARBITRUM_RPC_PROVIDERS } from "@/data/constants";
import BigNumber from "bignumber.js";

interface UnifiedUniswapState {
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  isReady: boolean;
  chainId: number;
}

interface AddLiquidityParams {
  tokenAAddress: string;
  tokenBAddress: string;
  tokenAAmount: string;
  tokenBAmount: string;
  feeTier: string; // "0.05", "0.3", "1"
  slippageTolerance?: number;
  userAddress: string;
}

/**
 * 🚀 Unified Uniswap Hook - Menggabungkan V3 SDK dan Liquidity Services
 * Dibuat lebih simple dan robust dengan error handling yang lebih baik
 */
export function useUniswapUnified(chainId: number = 56) {
  const [state, setState] = useState<UnifiedUniswapState>({
    isLoading: false,
    isConnecting: false,
    error: null,
    isReady: false,
    chainId,
  });

  const { connect, isConnected } = useWeb3AuthConnect();
  const [sdkService, setSdkService] = useState<UniswapV3SDKService | null>(
    null
  );

  // Update state helper
  const updateState = useCallback((updates: Partial<UnifiedUniswapState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Get reliable RPC provider
  const getReliableProvider = useCallback(async () => {
    const rpcProviders =
      chainId === 56 ? BSC_RPC_PROVIDERS : ARBITRUM_RPC_PROVIDERS;

    for (const rpcUrl of rpcProviders) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          ),
        ]);
        console.log(`✅ Connected to ${rpcUrl}`);
        return provider;
      } catch (error) {
        console.warn(`❌ Failed to connect to ${rpcUrl}`);
        continue;
      }
    }
    throw new Error("No working RPC provider found");
  }, [chainId]);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      if (!isConnected) {
        setSdkService(null);
        updateState({ isReady: false });
        return;
      }

      try {
        updateState({ isConnecting: true, error: null });

        // Get provider dan signer
        const web3Provider = await connect();
        if (!web3Provider) throw new Error("No wallet provider available");

        const ethersProvider = new ethers.BrowserProvider(web3Provider);
        const signer = await ethersProvider.getSigner();

        // Get reliable RPC provider as fallback
        const reliableProvider = await getReliableProvider();

        // Initialize SDK service dengan reliable provider
        const service = new UniswapV3SDKService(
          reliableProvider,
          chainId,
          signer
        );

        setSdkService(service);
        updateState({
          isConnecting: false,
          isReady: true,
        });

        console.log("✅ Uniswap services initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing services:", error);
        updateState({
          error: (error as Error).message,
          isConnecting: false,
          isReady: false,
        });
      }
    };

    initializeServices();
  }, [isConnected, connect, chainId, updateState, getReliableProvider]);

  // Convert fee tier string to number
  const convertFeeTier = useCallback((feeTierStr: string): number => {
    switch (feeTierStr) {
      case "0.05":
        return 500;
      case "0.3":
        return 3000;
      case "1":
        return 10000;
      default:
        return 3000;
    }
  }, []);

  // Add liquidity function dengan error handling yang lebih baik
  const addLiquidity = useCallback(
    async (params: AddLiquidityParams) => {
      if (!sdkService || !state.isReady) {
        throw new Error("Services not ready");
      }

      try {
        updateState({ isLoading: true, error: null });

        // Get wallet provider
        const web3Provider = await connect();
        if (!web3Provider) throw new Error("No wallet provider");

        // Prepare liquidity parameters
        const liquidityParams = {
          tokenA: params.tokenAAddress,
          tokenB: params.tokenBAddress,
          fee: convertFeeTier(params.feeTier),
          amountA: new BigNumber(params.tokenAAmount),
          amountB: new BigNumber(params.tokenBAmount),
          slippageTolerance: params.slippageTolerance || 0.01,
          chainId: state.chainId,
          walletClient: web3Provider,
          userAddress: params.userAddress,
          useFullRange: true,
        };

        const result = await UniswapLiquidityService.addLiquidity(
          liquidityParams
        );

        updateState({ isLoading: false });
        toast.success("🎉 Liquidity berhasil ditambahkan!");

        return result;
      } catch (error) {
        const errorMessage = (error as Error).message;
        updateState({
          error: errorMessage,
          isLoading: false,
        });

        // User-friendly error messages
        if (errorMessage.includes("Pool does not exist")) {
          toast.error("Pool belum ada. Buat pool terlebih dahulu.");
        } else if (errorMessage.includes("insufficient")) {
          toast.error("Saldo tidak mencukupi.");
        } else if (errorMessage.includes("rejected")) {
          toast.error("Transaksi dibatalkan.");
        } else {
          toast.error(`Gagal menambahkan liquidity: ${errorMessage}`);
        }

        throw error;
      }
    },
    [
      sdkService,
      state.isReady,
      state.chainId,
      connect,
      convertFeeTier,
      updateState,
    ]
  );

  // Get user positions
  const getUserPositions = useCallback(
    async (userAddress: string) => {
      if (!sdkService) {
        throw new Error("SDK service not initialized");
      }

      try {
        return await sdkService.fetchUserPositions(userAddress);
      } catch (error) {
        console.error("Error fetching positions:", error);
        return [];
      }
    },
    [sdkService]
  );

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    // State
    isLoading: state.isLoading,
    isConnecting: state.isConnecting,
    isReady: state.isReady,
    error: state.error,
    chainId: state.chainId,

    // Actions
    addLiquidity,
    getUserPositions,
    clearError,

    // Service (for advanced usage)
    sdkService,
  };
}
