import { ethers } from "ethers";
import {
  Pool,
  Position,
  nearestUsableTick,
  SwapRouter,
  SwapOptions,
  Route,
  Trade,
  MethodParameters,
} from "@uniswap/v3-sdk";
import {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
  Ether,
} from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { TokenData, SwapAndAddParams } from "@/types/uniswap";
import { UNISWAP_V3_ADDRESSES } from "@/data/constants";

/**
 * 6. SWAPPING AND ADDING LIQUIDITY - Following official docs
 * https://docs.uniswap.org/sdk/v3/guides/liquidity/swap-and-add
 */
export class UniswapSwapAndAddService {
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider;
  private signer: ethers.Signer;
  private chainId: number;

  constructor(
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
    signer: ethers.Signer,
    chainId: number
  ) {
    this.provider = provider;
    this.signer = signer;
    this.chainId = chainId;
  }

  /**
   * Create Token instance from TokenData
   */
  private createToken(tokenData: TokenData): Token {
    if (tokenData.isNative) {
      // For native tokens, we need to use the wrapped token address
      const WRAPPED_NATIVE_ADDRESSES = {
        1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
        137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
        43114: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
      };

      const wrappedAddress =
        WRAPPED_NATIVE_ADDRESSES[
          tokenData.chainId as keyof typeof WRAPPED_NATIVE_ADDRESSES
        ];
      if (!wrappedAddress) {
        throw new Error(
          `Unsupported native token on chain ${tokenData.chainId}`
        );
      }

      return new Token(
        tokenData.chainId,
        wrappedAddress,
        tokenData.decimals,
        tokenData.symbol,
        tokenData.name
      );
    }

    return new Token(
      tokenData.chainId,
      tokenData.address,
      tokenData.decimals,
      tokenData.symbol,
      tokenData.name
    );
  }

  /**
   * Get pool for token pair
   */
  private async getPool(
    token0Data: TokenData,
    token1Data: TokenData,
    fee: number
  ): Promise<Pool | null> {
    try {
      const token0 = this.createToken(token0Data);
      const token1 = this.createToken(token1Data);

      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      if (!addresses) throw new Error(`Unsupported chain: ${this.chainId}`);

      // Get pool contract
      const poolContract = new ethers.Contract(
        addresses.FACTORY,
        [
          "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
        ],
        this.provider
      );

      const poolAddress = await poolContract.getPool(
        token0.address,
        token1.address,
        fee
      );

      if (poolAddress === ethers.ZeroAddress) {
        return null;
      }

      // Get pool state
      const poolStateContract = new ethers.Contract(
        poolAddress,
        [
          "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
          "function liquidity() external view returns (uint128)",
        ],
        this.provider
      );

      const [slot0, liquidity] = await Promise.all([
        poolStateContract.slot0(),
        poolStateContract.liquidity(),
      ]);

      return new Pool(
        token0,
        token1,
        fee,
        JSBI.BigInt(slot0.sqrtPriceX96.toString()),
        JSBI.BigInt(liquidity.toString()),
        slot0.tick
      );
    } catch (error) {
      "Error getting pool:", error;
      return null;
    }
  }

  /**
   * Calculate optimal currency ratio for the pool
   */
  private calculateCurrencyRatio(
    pool: Pool,
    inputAmount: CurrencyAmount<Token>
  ): { amount0: CurrencyAmount<Token>; amount1: CurrencyAmount<Token> } {
    // Get current pool price
    const price = pool.token0Price;

    // Calculate optimal ratio based on current pool price
    if (inputAmount.currency.equals(pool.token0)) {
      // Input is token0, calculate how much token1 is needed
      const amount1 = price.quote(inputAmount);
      return {
        amount0: inputAmount,
        amount1: amount1 as CurrencyAmount<Token>,
      };
    } else {
      // Input is token1, calculate how much token0 is needed
      const amount0 = price.invert().quote(inputAmount);
      return {
        amount0: amount0 as CurrencyAmount<Token>,
        amount1: inputAmount,
      };
    }
  }

  /**
   * Swap and add liquidity in one atomic transaction
   * Following official docs: https://docs.uniswap.org/sdk/v3/guides/liquidity/swap-and-add
   */
  async swapAndAddLiquidity(params: {
    inputToken: TokenData;
    outputTokenA: TokenData;
    outputTokenB: TokenData;
    fee: number;
    inputAmount: string;
    tickLower: number;
    tickUpper: number;
    recipient: string;
    slippageTolerance: number;
    deadline: number;
  }): Promise<string> {
    try {
      ("🔄 Starting swap and add liquidity process...");

      // Create token instances
      const inputToken = this.createToken(params.inputToken);
      const tokenA = this.createToken(params.outputTokenA);
      const tokenB = this.createToken(params.outputTokenB);

      // Create input amount
      const inputAmount = CurrencyAmount.fromRawAmount(
        inputToken,
        JSBI.BigInt(params.inputAmount)
      );

      // Get the target pool (tokenA/tokenB)
      const targetPool = await this.getPool(
        params.outputTokenA,
        params.outputTokenB,
        params.fee
      );
      if (!targetPool) {
        throw new Error("Target pool does not exist");
      }

      // Calculate optimal currency amounts for the position
      const { amount0, amount1 } = this.calculateCurrencyRatio(
        targetPool,
        inputAmount
      );

      // Determine if we need to swap input token to get both tokens
      let swapAmount0: CurrencyAmount<Token> | null = null;
      let swapAmount1: CurrencyAmount<Token> | null = null;

      if (!inputToken.equals(tokenA) && !inputToken.equals(tokenB)) {
        // Input token is different from both pool tokens
        // Need to swap input to get both tokenA and tokenB

        // Split input amount (e.g., 50% to tokenA, 50% to tokenB)
        const halfInput = CurrencyAmount.fromRawAmount(
          inputToken,
          JSBI.divide(inputAmount.quotient, JSBI.BigInt(2))
        );

        swapAmount0 = halfInput; // Swap to tokenA
        swapAmount1 = CurrencyAmount.fromRawAmount(
          inputToken,
          JSBI.subtract(inputAmount.quotient, halfInput.quotient)
        ); // Swap to tokenB
      } else if (inputToken.equals(tokenA)) {
        // Input token is tokenA, need to swap part to tokenB
        const swapPortion = this.calculateSwapPortion(
          amount0,
          amount1,
          inputAmount
        );
        swapAmount1 = CurrencyAmount.fromRawAmount(inputToken, swapPortion);
      } else if (inputToken.equals(tokenB)) {
        // Input token is tokenB, need to swap part to tokenA
        const swapPortion = this.calculateSwapPortion(
          amount1,
          amount0,
          inputAmount
        );
        swapAmount0 = CurrencyAmount.fromRawAmount(inputToken, swapPortion);
      }

      // Create multicall parameters array
      const multicallData: string[] = [];

      // Add swap calls if needed
      if (swapAmount0) {
        const swapParams0 = await this.createSwapParameters(
          inputToken,
          tokenA,
          swapAmount0,
          params.slippageTolerance,
          params.deadline
        );
        if (swapParams0) {
          multicallData.push(swapParams0.calldata);
        }
      }

      if (swapAmount1) {
        const swapParams1 = await this.createSwapParameters(
          inputToken,
          tokenB,
          swapAmount1,
          params.slippageTolerance,
          params.deadline
        );
        if (swapParams1) {
          multicallData.push(swapParams1.calldata);
        }
      }

      // Create position after swaps
      const position = Position.fromAmounts({
        pool: targetPool,
        tickLower: params.tickLower,
        tickUpper: params.tickUpper,
        amount0: amount0.quotient,
        amount1: amount1.quotient,
        useFullPrecision: true,
      });

      // Create mint parameters
      const mintCalldata = this.createMintCalldata(
        position,
        params.recipient,
        params.deadline,
        params.slippageTolerance
      );
      multicallData.push(mintCalldata);

      // Execute multicall transaction
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

      const multicallContract = new ethers.Contract(
        addresses.POSITION_MANAGER,
        [
          "function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)",
        ],
        this.signer
      );

      const tx = await multicallContract.multicall(multicallData, {
        value: this.calculateEthValue(inputAmount, inputToken),
        gasLimit: 800000, // Conservative gas limit for complex transaction
      });

      const receipt = await tx.wait();
      "✅ Swap and add liquidity completed:", receipt.hash;

      return receipt.hash;
    } catch (error) {
      "❌ Error in swap and add liquidity:", error;
      throw error;
    }
  }

  /**
   * Create swap parameters for SwapRouter
   */
  private async createSwapParameters(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: CurrencyAmount<Token>,
    slippageTolerance: number,
    deadline: number
  ): Promise<MethodParameters | null> {
    try {
      // Find the best route (simplified - should use routing algorithm)
      const fee = 3000; // Default to 0.3% fee tier

      // Get pool for swap
      const swapPool = await this.getPool(
        {
          chainId: tokenIn.chainId,
          address: tokenIn.address,
          decimals: tokenIn.decimals,
          symbol: tokenIn.symbol || "",
          name: tokenIn.name || "",
        },
        {
          chainId: tokenOut.chainId,
          address: tokenOut.address,
          decimals: tokenOut.decimals,
          symbol: tokenOut.symbol || "",
          name: tokenOut.name || "",
        },
        fee
      );

      if (!swapPool) {
        return null;
      }

      // Create route
      const route = new Route([swapPool], tokenIn, tokenOut);

      // Create trade
      const trade = await Trade.fromRoute(
        route,
        amountIn,
        TradeType.EXACT_INPUT
      );

      // Create swap options
      const options: SwapOptions = {
        slippageTolerance: new Percent(
          Math.floor(slippageTolerance * 100),
          10000
        ),
        deadline,
        recipient: ethers.ZeroAddress, // Will be set by multicall
      };

      // Return swap call parameters
      return SwapRouter.swapCallParameters([trade], options);
    } catch (error) {
      "Error creating swap parameters:", error;
      return null;
    }
  }

  /**
   * Create mint calldata for adding liquidity
   */
  private createMintCalldata(
    position: Position,
    recipient: string,
    deadline: number,
    slippageTolerance: number
  ): string {
    // Simplified mint calldata creation
    // In production, use NonfungiblePositionManager.addCallParameters

    const mintParams = {
      token0: position.pool.token0.address,
      token1: position.pool.token1.address,
      fee: position.pool.fee,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      amount0Desired: position.amount0.quotient.toString(),
      amount1Desired: position.amount1.quotient.toString(),
      amount0Min: "0", // Should calculate with slippage
      amount1Min: "0", // Should calculate with slippage
      recipient,
      deadline,
    };

    // Encode function call (simplified)
    const mintInterface = new ethers.Interface([
      "function mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))",
    ]);

    return mintInterface.encodeFunctionData("mint", [mintParams]);
  }

  /**
   * Calculate swap portion needed
   */
  private calculateSwapPortion(
    needed: CurrencyAmount<Token>,
    available: CurrencyAmount<Token>,
    total: CurrencyAmount<Token>
  ): JSBI {
    // Simplified calculation - in production, use more sophisticated algorithm
    return JSBI.divide(total.quotient, JSBI.BigInt(2));
  }

  /**
   * Calculate ETH value for native token transactions
   */
  private calculateEthValue(
    amount: CurrencyAmount<Token>,
    token: Token
  ): string {
    if (token.isNative) {
      return amount.quotient.toString();
    }
    return "0";
  }

  /**
   * Get optimal tick range for position
   */
  getOptimalTickRange(
    currentTick: number,
    fee: number,
    rangeMultiplier: number = 1.2
  ): { tickLower: number; tickUpper: number } {
    const tickSpacing = fee === 500 ? 10 : fee === 3000 ? 60 : 200;
    const range = Math.floor(tickSpacing * 10 * rangeMultiplier);

    const tickLower = nearestUsableTick(currentTick - range, tickSpacing);
    const tickUpper = nearestUsableTick(currentTick + range, tickSpacing);

    return { tickLower, tickUpper };
  }
}
