import { ethers } from "ethers";
import { nearestUsableTick, TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import BigNumber from "bignumber.js";
import { UNISWAP_V3_ADDRESSES } from "@/data/constants";
import {
  TICK_RANGES,
  SLIPPAGE_TOLERANCE,
  DEADLINE_FROM_NOW,
} from "@/lib/uniswap/constants";
import { UniswapPoolService } from "./uniswap-pool.service";

export interface AddLiquidityParams {
  tokenA: string;
  tokenB: string;
  fee: number;
  amountA: BigNumber;
  amountB: BigNumber;
  minPriceRange?: number; // Default: 0.8 (20% below current price)
  maxPriceRange?: number; // Default: 1.2 (20% above current price)
  slippageTolerance?: number; // Default: 1% (0.01)
  deadline?: number; // Default: 20 minutes from now
  chainId: number;
  walletClient: any;
  userAddress: string;
  useFullRange?: boolean; // Default: true
}

export interface LiquidityResult {
  transactionHash: string;
  tokenId: string;
  liquidity: string;
  amount0: string;
  amount1: string;
  blockNumber: number;
  gasUsed?: string;
}

export class UniswapLiquidityService {
  /**
   * Add liquidity ke Uniswap V3 Pool
   */
  static async addLiquidity({
    tokenA,
    tokenB,
    fee,
    amountA,
    amountB,
    minPriceRange = 0.8,
    maxPriceRange = 1.2,
    slippageTolerance = SLIPPAGE_TOLERANCE.MEDIUM / 100, // Convert to decimal
    deadline,
    chainId,
    walletClient,
    userAddress,
    useFullRange = true,
  }: AddLiquidityParams): Promise<LiquidityResult> {
    try {
      "🚀 Starting liquidity addition process...",
        {
          tokenA,
          tokenB,
          fee,
          amountA: amountA.toString(),
          amountB: amountB.toString(),
          chainId,
        };

      // Validasi input
      this.validateAddLiquidityParams({
        tokenA,
        tokenB,
        fee,
        amountA,
        amountB,
        chainId,
        userAddress,
      });

      const addresses =
        UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Sort tokens dan amounts
      const [token0, token1, amount0Desired, amount1Desired] =
        this.sortTokensAndAmounts(tokenA, tokenB, amountA, amountB);

      // Cek apakah pool sudah ada
      const poolAddress = await UniswapPoolService.checkPoolExists(
        token0,
        token1,
        fee,
        chainId
      );

      if (!poolAddress) {
        throw new Error("Pool does not exist. Please create the pool first.");
      }

      "✅ Pool found:", poolAddress;

      // Ambil pool info untuk current price
      const poolInfo = await UniswapPoolService.getPoolInfo(
        poolAddress,
        chainId
      );

      // Calculate tick range
      const { tickLower, tickUpper } = useFullRange
        ? this.getFullRangeTicks(fee)
        : await this.calculateTickRange(
            poolInfo,
            minPriceRange,
            maxPriceRange,
            fee
          );

      "📊 Calculated ticks:", { tickLower, tickUpper };

      // Ensure token approvals
      await this.ensureTokenApprovals(
        [
          { address: token0, amount: amount0Desired },
          { address: token1, amount: amount1Desired },
        ],
        chainId
      );

      // Calculate slippage protection
      const { amount0Min, amount1Min } = this.calculateSlippageProtection(
        amount0Desired,
        amount1Desired,
        slippageTolerance
      );

      // Set deadline
      const txDeadline =
        deadline || Math.floor(Date.now() / 1000) + DEADLINE_FROM_NOW.MEDIUM;

      const POSITION_MANAGER_ABI = [
        `function mint((
          address token0,
          address token1,
          uint24 fee,
          int24 tickLower,
          int24 tickUpper,
          uint256 amount0Desired,
          uint256 amount1Desired,
          uint256 amount0Min,
          uint256 amount1Min,
          address recipient,
          uint256 deadline
        )) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)`,
      ];

      const positionManager = new ethers.Contract(
        addresses.POSITION_MANAGER,
        POSITION_MANAGER_ABI,
        signer
      );

      // Get token decimals for proper amount formatting
      const [token0Decimals, token1Decimals] = await Promise.all([
        this.getTokenDecimals(token0, provider),
        this.getTokenDecimals(token1, provider),
      ]);

      const params = {
        token0,
        token1,
        fee,
        tickLower,
        tickUpper,
        amount0Desired: ethers.parseUnits(
          amount0Desired.toFixed(),
          token0Decimals
        ),
        amount1Desired: ethers.parseUnits(
          amount1Desired.toFixed(),
          token1Decimals
        ),
        amount0Min: ethers.parseUnits(amount0Min.toFixed(), token0Decimals),
        amount1Min: ethers.parseUnits(amount1Min.toFixed(), token1Decimals),
        recipient: userAddress,
        deadline: txDeadline,
      };

      "📝 Transaction parameters:",
        {
          ...params,
          amount0Desired: params.amount0Desired.toString(),
          amount1Desired: params.amount1Desired.toString(),
          amount0Min: params.amount0Min.toString(),
          amount1Min: params.amount1Min.toString(),
        };

      // Estimate gas
      const estimatedGas = await this.estimateAddLiquidityGas(
        params,
        positionManager
      );

      const tx = await positionManager.mint(params, {
        gasLimit: estimatedGas,
      });

      "🚀 Liquidity transaction sent:", tx.hash;
      const receipt = await tx.wait();
      "✅ Liquidity added successfully:", receipt.hash;

      // Extract hasil dari transaction logs
      const result = this.parseAddLiquidityResult(
        receipt,
        token0Decimals,
        token1Decimals
      );

      return result;
    } catch (error) {
      "❌ Error adding liquidity:", error;
      throw error;
    }
  }

  /**
   * Validasi parameter input
   */
  private static validateAddLiquidityParams({
    tokenA,
    tokenB,
    fee,
    amountA,
    amountB,
    chainId,
    userAddress,
  }: Partial<AddLiquidityParams>) {
    if (!ethers.isAddress(tokenA!) || !ethers.isAddress(tokenB!)) {
      throw new Error("Invalid token addresses");
    }

    if (tokenA!.toLowerCase() === tokenB!.toLowerCase()) {
      throw new Error("Cannot add liquidity for identical tokens");
    }

    if (![500, 3000, 10000].includes(fee!)) {
      throw new Error("Invalid fee tier. Supported: 500, 3000, 10000");
    }

    if (amountA!.lte(0) || amountB!.lte(0)) {
      throw new Error("Token amounts must be greater than 0");
    }

    if (!UniswapPoolService.isSupportedChain(chainId!)) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    if (!ethers.isAddress(userAddress!)) {
      throw new Error("Invalid user address");
    }
  }

  /**
   * Sort tokens dan amounts sesuai address (token0 < token1)
   */
  private static sortTokensAndAmounts(
    tokenA: string,
    tokenB: string,
    amountA: BigNumber,
    amountB: BigNumber
  ): [string, string, BigNumber, BigNumber] {
    if (tokenA.toLowerCase() < tokenB.toLowerCase()) {
      return [tokenA, tokenB, amountA, amountB];
    } else {
      return [tokenB, tokenA, amountB, amountA];
    }
  }

  /**
   * Get full range ticks berdasarkan fee tier
   */
  private static getFullRangeTicks(fee: number): {
    tickLower: number;
    tickUpper: number;
  } {
    const tickSpacing = this.getTickSpacing(fee);

    return {
      tickLower: nearestUsableTick(TICK_RANGES.FULL_RANGE_LOWER, tickSpacing),
      tickUpper: nearestUsableTick(TICK_RANGES.FULL_RANGE_UPPER, tickSpacing),
    };
  }

  /**
   * Calculate tick range berdasarkan current price dan range
   */
  private static async calculateTickRange(
    poolInfo: any,
    minPriceRange: number,
    maxPriceRange: number,
    fee: number
  ): Promise<{ tickLower: number; tickUpper: number }> {
    const currentTick = poolInfo.tick;
    const tickSpacing = this.getTickSpacing(fee);
    const currentSqrtPriceX96 = BigInt(poolInfo.sqrtPriceX96);

    // Calculate price bounds
    const minSqrtPriceX96 =
      (currentSqrtPriceX96 * BigInt(Math.floor(minPriceRange * 1000))) /
      BigInt(1000);
    const maxSqrtPriceX96 =
      (currentSqrtPriceX96 * BigInt(Math.floor(maxPriceRange * 1000))) /
      BigInt(1000);

    // Convert bigint to JSBI for Uniswap SDK compatibility
    const minSqrtPriceJSBI = JSBI.BigInt(minSqrtPriceX96.toString());
    const maxSqrtPriceJSBI = JSBI.BigInt(maxSqrtPriceX96.toString());

    const minTick = nearestUsableTick(
      TickMath.getTickAtSqrtRatio(minSqrtPriceJSBI),
      tickSpacing
    );

    const maxTick = nearestUsableTick(
      TickMath.getTickAtSqrtRatio(maxSqrtPriceJSBI),
      tickSpacing
    );

    return {
      tickLower: Math.min(minTick, maxTick),
      tickUpper: Math.max(minTick, maxTick),
    };
  }

  /**
   * Ensure both tokens are approved for Position Manager
   */
  private static async ensureTokenApprovals(
    tokens: Array<{ address: string; amount: BigNumber }>,
    chainId: number
  ): Promise<void> {
    ("🔄 Ensuring token approvals...");

    for (const token of tokens) {
      const txHash = await TokenBalanceService.ensureApproval(
        token.address,
        token.amount,
        chainId,
        true // Use infinite approval
      );

      if (txHash) {
        `✅ Token ${token.address} approved:`, txHash;
      } else {
        `✅ Token ${token.address} already approved`;
      }
    }
  }

  /**
   * Calculate slippage protection amounts
   */
  private static calculateSlippageProtection(
    amount0Desired: BigNumber,
    amount1Desired: BigNumber,
    slippageTolerance: number
  ): { amount0Min: BigNumber; amount1Min: BigNumber } {
    const tolerance = new BigNumber(1 - slippageTolerance);

    return {
      amount0Min: amount0Desired.multipliedBy(tolerance),
      amount1Min: amount1Desired.multipliedBy(tolerance),
    };
  }

  /**
   * Get tick spacing berdasarkan fee tier
   */
  private static getTickSpacing(fee: number): number {
    switch (fee) {
      case 500:
        return 10;
      case 3000:
        return 60;
      case 10000:
        return 200;
      default:
        throw new Error(`Unknown fee tier: ${fee}`);
    }
  }

  /**
   * Get token decimals
   */
  private static async getTokenDecimals(
    tokenAddress: string,
    provider: ethers.BrowserProvider
  ): Promise<number> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function decimals() view returns (uint8)"],
      provider
    );
    return await tokenContract.decimals();
  }

  /**
   * Estimate gas untuk add liquidity transaction
   */
  private static async estimateAddLiquidityGas(
    params: any,
    positionManager: ethers.Contract
  ): Promise<bigint> {
    try {
      const estimatedGas = await positionManager.mint.estimateGas(params);
      // Add 20% buffer
      return (estimatedGas * BigInt(120)) / BigInt(100);
    } catch (error) {
      "Gas estimation failed:", error;
      return BigInt(500000); // Conservative fallback
    }
  }

  /**
   * Parse hasil dari transaction receipt
   */
  private static parseAddLiquidityResult(
    receipt: any,
    token0Decimals: number,
    token1Decimals: number
  ): LiquidityResult {
    // Cari Mint event dari logs
    let tokenId = "0";
    let liquidity = "0";
    let amount0 = "0";
    let amount1 = "0";

    // Parse logs untuk mengambil event data
    for (const log of receipt.logs) {
      try {
        // Look for IncreaseLiquidity event atau similar
        if (log.topics && log.topics.length > 3) {
          tokenId = log.topics[3] || "0";
        }

        // Parse data jika ada
        if (log.data && log.data.length > 2) {
          // This is a simplified parsing - in production, use proper ABI decoding
          const dataWithoutPrefix = log.data.slice(2);
          if (dataWithoutPrefix.length >= 192) {
            // 3 * 64 hex characters
            liquidity = BigInt(
              "0x" + dataWithoutPrefix.slice(0, 64)
            ).toString();
            amount0 = ethers.formatUnits(
              BigInt("0x" + dataWithoutPrefix.slice(64, 128)),
              token0Decimals
            );
            amount1 = ethers.formatUnits(
              BigInt("0x" + dataWithoutPrefix.slice(128, 192)),
              token1Decimals
            );
          }
        }
      } catch (error) {
        // Continue parsing other logs
        continue;
      }
    }

    return {
      transactionHash: receipt.hash,
      tokenId: BigInt(tokenId).toString(),
      liquidity,
      amount0,
      amount1,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
    };
  }

  /**
   * Get user's liquidity positions
   */
  static async getUserPositions(
    userAddress: string,
    chainId: number,
    walletClient: any
  ): Promise<any[]> {
    try {
      const addresses =
        UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      const provider = new ethers.BrowserProvider(walletClient);

      const POSITION_MANAGER_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
      ];

      const positionManager = new ethers.Contract(
        addresses.POSITION_MANAGER,
        POSITION_MANAGER_ABI,
        provider
      );

      const balance = await positionManager.balanceOf(userAddress);
      const positions = [];

      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await positionManager.tokenOfOwnerByIndex(
          userAddress,
          i
        );
        const position = await positionManager.positions(tokenId);

        positions.push({
          tokenId: tokenId.toString(),
          ...position,
        });
      }

      return positions;
    } catch (error) {
      "Error fetching user positions:", error;
      return [];
    }
  }
}
