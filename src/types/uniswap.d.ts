import { Position, Pool } from "@uniswap/v3-sdk";
import { Token, CurrencyAmount, Price, Percent } from "@uniswap/sdk-core";
import { BigintIsh } from "@uniswap/sdk-core";

// Types following official Uniswap SDK v3 documentation
export interface TokenData {
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string;
  isNative?: boolean;
}

export interface PoolData {
  token0: TokenData;
  token1: TokenData;
  fee: number;
  sqrtPriceX96: string;
  liquidity: string;
  tick: number;
  tickSpacing: number;
  poolAddress: string;
}

export interface PositionData {
  tokenId: number;
  owner: string;
  operator?: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  tokensOwed0: string;
  tokensOwed1: string;
}

// Position info following SDK patterns
// Position info interface following official Uniswap SDK v3 docs
// https://docs.uniswap.org/sdk/v3/guides/liquidity/fetching-positions
export interface PositionInfo {
  tokenId: number;
  nonce: number;
  operator: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string; // JSBI string representation
  feeGrowthInside0LastX128: string; // JSBI string representation
  feeGrowthInside1LastX128: string; // JSBI string representation
  tokensOwed0: string; // JSBI string representation
  tokensOwed1: string; // JSBI string representation
}

// Enhanced position info with SDK Position and Pool instances (for backward compatibility)
export interface EnhancedPositionInfo extends PositionInfo {
  position: Position;
  pool: Pool;
  token0Instance: Token;
  token1Instance: Token;
  liquidityAmount: CurrencyAmount<Token>;
  amount0: CurrencyAmount<Token>;
  amount1: CurrencyAmount<Token>;
  fees0?: CurrencyAmount<Token>;
  fees1?: CurrencyAmount<Token>;
}

// Minting parameters following SDK documentation
export interface MintParams {
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: string;
  amount1Desired: string;
  amount0Min: string;
  amount1Min: string;
  recipient: string;
  deadline: number;
}

// Pool creation parameters
export interface CreatePoolParams {
  tokenA: TokenData;
  tokenB: TokenData;
  fee: number;
  initialPrice: Price<Token, Token>;
  chainId: number;
}

// Liquidity modification parameters
export interface ModifyLiquidityParams {
  tokenId: number;
  liquidityAmount: string;
  amount0Min: string;
  amount1Min: string;
  deadline: number;
}

// Fee collection parameters
export interface CollectFeesParams {
  tokenId: number;
  recipient: string;
  amount0Max: string;
  amount1Max: string;
}

// Swap and add liquidity parameters
export interface SwapAndAddParams {
  token0: TokenData;
  token1: TokenData;
  fee: number;
  inputToken: TokenData;
  inputAmount: string;
  recipientAddress: string;
  slippageTolerance: Percent;
  deadline: number;
}

// SDK wrapper classes
export interface UniswapV3Service {
  // Position management
  createPosition(params: MintParams): Promise<PositionInfo>;
  fetchPositions(userAddress: string): Promise<PositionInfo[]>;
  getPosition(tokenId: number): Promise<PositionInfo>;

  // Liquidity management
  addLiquidity(params: ModifyLiquidityParams): Promise<string>;
  removeLiquidity(params: ModifyLiquidityParams): Promise<string>;

  // Fee collection
  collectFees(params: CollectFeesParams): Promise<string>;

  // Pool operations
  createPool(params: CreatePoolParams): Promise<Pool>;
  getPool(
    tokenA: TokenData,
    tokenB: TokenData,
    fee: number
  ): Promise<Pool | null>;

  // Swap and add
  swapAndAdd(params: SwapAndAddParams): Promise<string>;
}

// Transaction result types
export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export interface MintResult extends TransactionResult {
  tokenId: number;
  liquidity: string;
  amount0: string;
  amount1: string;
}

export interface CollectResult extends TransactionResult {
  amount0: string;
  amount1: string;
}

// Error types
export interface UniswapError extends Error {
  code?: string;
  reason?: string;
  transaction?: any;
}
