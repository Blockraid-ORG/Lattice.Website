import { ethers } from "ethers";
import { encodeSqrtRatioX96 } from "@uniswap/v3-sdk";
import BigNumber from "bignumber.js";
import { UNISWAP_V3_ADDRESSES } from "@/data/constants";
import { UniswapPoolService } from "./uniswap-pool.service";

export interface CreatePoolParams {
  tokenA: string;
  tokenB: string;
  fee: number;
  initialPriceRatio: BigNumber; // tokenA per tokenB
  chainId: number;
  walletClient: any;
}

export class UniswapPoolCreationService {
  /**
   * Fee tiers yang didukung Uniswap V3
   */
  static readonly FEE_TIERS = {
    LOW: 500, // 0.05% - Stable pairs
    MEDIUM: 3000, // 0.30% - Most common
    HIGH: 10000, // 1.00% - Exotic pairs
  };

  /**
   * Buat pool baru jika belum ada
   */
  static async createPool({
    tokenA,
    tokenB,
    fee,
    initialPriceRatio,
    chainId,
    walletClient,
  }: CreatePoolParams): Promise<string> {
    try {
      // Validasi fee tier
      if (!this.isValidFeeTier(fee)) {
        throw new Error(
          `Invalid fee tier: ${fee}. Supported: 500, 3000, 10000`
        );
      }

      // Validasi chain support
      if (!UniswapPoolService.isSupportedChain(chainId)) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }

      const addresses =
        UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Sort tokens (token0 harus lebih kecil dari token1)
      const [token0, token1] = this.sortTokens(tokenA, tokenB);

      // Adjust price ratio jika tokens di-swap
      const priceRatio = this.adjustPriceRatio(
        tokenA,
        tokenB,
        initialPriceRatio
      );

      // Convert ke sqrtPriceX96
      const sqrtPriceX96 = this.calculateSqrtPriceX96(priceRatio);

      const POSITION_MANAGER_ABI = [
        "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool)",
      ];

      const positionManager = new ethers.Contract(
        addresses.POSITION_MANAGER,
        POSITION_MANAGER_ABI,
        signer
      );

      "Creating pool with params:",
        {
          token0,
          token1,
          fee,
          sqrtPriceX96: sqrtPriceX96.toString(),
          chainId,
        };

      const tx = await positionManager.createAndInitializePoolIfNecessary(
        token0,
        token1,
        fee,
        sqrtPriceX96.toString(), // Convert JSBI to string for ethers.js
        {
          gasLimit: 3000000, // Conservative gas limit
        }
      );

      "Pool creation transaction sent:", tx.hash;
      const receipt = await tx.wait();
      "Pool created successfully:", receipt.hash;

      // Return the pool address
      const poolAddress = await UniswapPoolService.checkPoolExists(
        token0,
        token1,
        fee,
        chainId
      );

      if (!poolAddress) {
        throw new Error("Pool was not created successfully");
      }

      return poolAddress;
    } catch (error) {
      "Error creating pool:", error;
      throw new Error(`Failed to create pool: ${(error as Error).message}`);
    }
  }

  /**
   * Cek dan buat pool jika diperlukan
   */
  static async ensurePoolExists({
    tokenA,
    tokenB,
    fee,
    initialPriceRatio,
    chainId,
    walletClient,
  }: CreatePoolParams): Promise<string> {
    try {
      // Cek apakah pool sudah ada
      const existingPool = await UniswapPoolService.checkPoolExists(
        tokenA,
        tokenB,
        fee,
        chainId
      );

      if (existingPool) {
        "Pool already exists:", existingPool;
        return existingPool;
      }

      // Buat pool baru
      ("Pool not found, creating new pool...");
      return await this.createPool({
        tokenA,
        tokenB,
        fee,
        initialPriceRatio,
        chainId,
        walletClient,
      });
    } catch (error) {
      "Error ensuring pool exists:", error;
      throw error;
    }
  }

  /**
   * Validasi fee tier
   */
  static isValidFeeTier(fee: number): boolean {
    return Object.values(this.FEE_TIERS).includes(fee);
  }

  /**
   * Sort tokens sesuai address (token0 < token1)
   */
  static sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
  }

  /**
   * Adjust price ratio jika tokens di-swap
   */
  static adjustPriceRatio(
    tokenA: string,
    tokenB: string,
    initialPriceRatio: BigNumber
  ): BigNumber {
    // Jika tokens di-swap (tokenA tidak menjadi token0), balik price ratio
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? initialPriceRatio
      : new BigNumber(1).dividedBy(initialPriceRatio);
  }

  /**
   * Convert price ratio ke sqrtPriceX96 format
   */
  static calculateSqrtPriceX96(priceRatio: BigNumber) {
    try {
      // Uniswap menggunakan precision 18 decimal
      const price = priceRatio.multipliedBy(10 ** 18);

      // Convert ke format yang dibutuhkan encodeSqrtRatioX96
      const numerator = price.toFixed(0);
      const denominator = (10 ** 18).toString();

      const sqrtPriceX96 = encodeSqrtRatioX96(numerator, denominator);

      return sqrtPriceX96; // Return JSBI type directly
    } catch (error) {
      "Error calculating sqrtPriceX96:", error;
      throw new Error(
        `Failed to calculate sqrtPriceX96: ${(error as Error).message}`
      );
    }
  }

  /**
   * Estimate gas untuk pool creation
   */
  static async estimateCreatePoolGas({
    tokenA,
    tokenB,
    fee,
    initialPriceRatio,
    chainId,
    walletClient,
  }: CreatePoolParams): Promise<bigint> {
    try {
      const addresses =
        UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const [token0, token1] = this.sortTokens(tokenA, tokenB);
      const priceRatio = this.adjustPriceRatio(
        tokenA,
        tokenB,
        initialPriceRatio
      );
      const sqrtPriceX96 = this.calculateSqrtPriceX96(priceRatio);

      const POSITION_MANAGER_ABI = [
        "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool)",
      ];

      const positionManager = new ethers.Contract(
        addresses.POSITION_MANAGER,
        POSITION_MANAGER_ABI,
        signer
      );

      const estimatedGas =
        await positionManager.createAndInitializePoolIfNecessary.estimateGas(
          token0,
          token1,
          fee,
          sqrtPriceX96.toString() // Convert JSBI to string for ethers.js
        );

      // Add 20% buffer
      return (estimatedGas * BigInt(120)) / BigInt(100);
    } catch (error) {
      "Gas estimation failed:", error;
      return BigInt(3000000); // Conservative fallback
    }
  }

  /**
   * Get recommended fee tier berdasarkan token types
   */
  static getRecommendedFeeTier(
    tokenA: string,
    tokenB: string,
    chainId: number
  ): number {
    const addresses =
      UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];

    // Jika salah satu adalah WETH/native token, gunakan medium fee
    if (
      tokenA.toLowerCase() === addresses?.WETH?.toLowerCase() ||
      tokenB.toLowerCase() === addresses?.WETH?.toLowerCase()
    ) {
      return this.FEE_TIERS.MEDIUM;
    }

    // Untuk token pairs lainnya, gunakan medium sebagai default
    return this.FEE_TIERS.MEDIUM;
  }
}
