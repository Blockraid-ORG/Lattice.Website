import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import {
  Pool,
  Position,
  nearestUsableTick,
  NonfungiblePositionManager,
  CollectOptions,
  RemoveLiquidityOptions,
  AddLiquidityOptions,
  MintOptions,
  computePoolAddress,
  FeeAmount,
} from "@uniswap/v3-sdk";
import { Token, CurrencyAmount, Percent } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import {
  TokenData,
  PositionInfo,
  EnhancedPositionInfo,
  MintResult,
  CollectResult,
} from "@/types/uniswap";
import { UNISWAP_V3_ADDRESSES, getWorkingRPCUrl } from "@/data/constants";
import { RPCProviderService } from "@/services/rpc-provider.service";
import { FEE_TIERS, TICK_SPACINGS } from "@/lib/uniswap/constants";
import positionManagerABI from "@/lib/abis/position-manager.abi.json";

/**
 * Core Uniswap V3 Service menggunakan official SDK
 * Mengikuti dokumentasi resmi: https://docs.uniswap.org/sdk/v3/guides/
 */
export class UniswapV3SDKService {
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider;
  private signer?: ethers.Signer;
  private chainId: number;

  constructor(
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
    chainId: number,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.chainId = chainId;
    this.signer = signer;
  }

  /**
   * Create fallback provider menggunakan dynamic RPC dari Terravest API
   */
  private async createFallbackProvider(): Promise<ethers.JsonRpcProvider> {
    try {
      // 🔧 Menggunakan dynamic RPC providers dari Terravest API
      const fallbackRPCs = await RPCProviderService.getAllRPCProviders(
        this.chainId
      );

      for (const rpc of fallbackRPCs) {
        try {
          console.log(`🔍 Testing fallback provider: ${rpc}`);
          const fallbackProvider = new ethers.JsonRpcProvider(rpc);
          await fallbackProvider.getBlockNumber(); // Test connection

          console.log(`✅ Fallback provider working: ${rpc}`);
          return fallbackProvider;
        } catch (error: any) {
          console.error(`❌ Fallback provider failed: ${rpc}`, error.message);
          continue;
        }
      }
    } catch (error) {
      console.error("❌ Failed to get dynamic RPC providers:", error);
    }

    throw new Error("No working fallback provider available");
  }

  /**
   * 🔧 Quick provider health check untuk circuit breaker detection
   */
  private async quickProviderHealthCheck(): Promise<void> {
    try {
      // Quick network check dengan timeout
      const healthPromise = Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
      ]);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Provider health timeout")), 3000)
      );

      await Promise.race([healthPromise, timeoutPromise]);
    } catch (error: any) {
      console.debug(
        "quickProviderHealthCheck encountered an error (non-fatal):",
        error.message
      );
      // Don't throw, just log warning
    }
  }

  /**
   * Create Token instance for USDC/KS pair on BSC
   * Following official Uniswap V3 documentation
   */
  private async createToken(tokenData: TokenData): Promise<Token> {
    // Special handling for USDC/KS on BSC
    if (this.chainId === 56) {
      // USDC BSC handling
      if (
        tokenData.symbol === "USDC" ||
        tokenData.address?.toLowerCase() ===
          "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
      ) {
        return new Token(
          56,
          "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          18, // USDC BSC has 18 decimals
          "USDC",
          "USD Coin"
        );
      }

      // KS Token handling
      if (
        tokenData.symbol === "KS" ||
        tokenData.address?.toLowerCase() ===
          "0xc327d83686f6b491b1d93755fcee036abd4877dc"
      ) {
        console.debug("🔍 Creating KS project token");
        return new Token(
          56,
          "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc",
          tokenData.decimals || 18, // Use provided decimals or default to 18
          "KS",
          tokenData.name || "Kostan Sini"
        );
      }
    }

    // Get actual token decimals dengan enhanced fallback
    let decimals = tokenData.decimals;

    if (!decimals && tokenData.address && !tokenData.isNative) {
      try {
        const tokenContract = new ethers.Contract(
          tokenData.address,
          ["function decimals() view returns (uint8)"],
          this.provider
        );
        const result = await tokenContract.decimals();
        decimals = Number(result);
      } catch (error) {
        // Enhanced fallback untuk known tokens (FIXED for Arbitrum)
        console.debug(
          "decimals() call failed; using fallback decimals for known tokens:",
          (error as any)?.message || error
        );
        if (
          tokenData.address?.toLowerCase() ===
          "0xaf88d065e77c8cc2239327c5edb3a432268e5831" // Native USDC Arbitrum
        ) {
          decimals = 6; // USDC ALWAYS has 6 decimals on ALL chains!
        } else if (
          tokenData.address?.toLowerCase() ===
          "0xae771ac9292c84ed2a6625ae92380dedcf9a5076" // KM Token Arbitrum (KOSAN AN)
        ) {
          decimals = 18; // KM token has 18 decimals
        } else if (
          tokenData.address?.toLowerCase() ===
          "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" // USDC BSC (fallback)
        ) {
          decimals = 18; // Binance-Peg USDC on BSC uses 18 decimals
        } else if (
          tokenData.address?.toLowerCase() ===
          "0xc327d83686f6b491b1d93755fcee036abd4877dc" // KS Token BSC (fallback)
        ) {
          decimals = 18; // KS token assumed 18 decimals
        } else {
          decimals = 18; // Default fallback
        }
      }
    }

    // Ensure decimals has a valid value
    decimals = decimals || 18;

    // CRITICAL DEBUG: Log final decimals being used

    // CRITICAL FIX: Ensure proper token symbol and name for MetaMask recognition
    let finalSymbol = tokenData.symbol || "TOKEN";
    let finalName = tokenData.name || tokenData.symbol || "Token";
    const finalAddress = tokenData.address;

    // Fix for Arbitrum chain (42161)
    if (this.chainId === 42161) {
      // Ensure correct USDC data
      if (
        tokenData.address?.toLowerCase() ===
        "0xaf88d065e77c8cc2239327c5edb3a432268e5831"
      ) {
        finalSymbol = "USDC";
        finalName = "USD Coin";
        decimals = 6;
      }
      // Ensure correct KM data
      if (
        tokenData.address?.toLowerCase() ===
        "0xae771ac9292c84ed2a6625ae92380dedcf9a5076"
      ) {
        finalSymbol = "KM";
        finalName = "KOSAN AN";
        decimals = 18;
      }
    }

    // Handle native tokens (but for USDC/TS pair, both should be ERC20)
    if (tokenData.isNative && this.chainId === 56) {
      const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      return new Token(56, WBNB_ADDRESS, 18, "WBNB", "Wrapped BNB");
    }

    if (tokenData.isNative) {
      // APPROACH 2: For other chains, use wrapped addresses
      const WRAPPED_NATIVE_ADDRESSES = {
        1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
        43114: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
        97: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", // WBNB Testnet
        11155111: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WETH Sepolia
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
        decimals || 18,
        tokenData.symbol,
        tokenData.name
      );
    }

    return new Token(
      tokenData.chainId,
      finalAddress || tokenData.address,
      decimals || 18,
      finalSymbol,
      finalName
    );
  }

  /**
   * Get pool instance from on-chain data with proper token ordering
   */
  async getPool(
    token0Data: TokenData,
    token1Data: TokenData,
    fee: number
  ): Promise<Pool | null> {
    try {
      const token0 = await this.createToken(token0Data);
      const token1 = await this.createToken(token1Data);

      // Sort tokens for proper ordering (token0 < token1 by address)
      const [sortedToken0, sortedToken1] =
        token0.address.toLowerCase() < token1.address.toLowerCase()
          ? [token0, token1]
          : [token1, token0];

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
        sortedToken0.address,
        sortedToken1.address,
        fee
      );

      if (poolAddress === ethers.ZeroAddress) {
        console.debug(
          `Pool not found for ${sortedToken0.symbol}/${sortedToken1.symbol} with fee ${fee}`
        );
        return null;
      }

      // Get pool state with comprehensive data
      const poolStateContract = new ethers.Contract(
        poolAddress,
        [
          "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
          "function liquidity() external view returns (uint128)",
          "function token0() external view returns (address)",
          "function token1() external view returns (address)",
          "function tickSpacing() external view returns (int24)",
        ],
        this.provider
      );

      const [slot0, liquidity, contractToken0] = await Promise.all([
        poolStateContract.slot0(),
        poolStateContract.liquidity(),
        poolStateContract.token0(),
      ]);

      // Verify token ordering matches contract
      if (contractToken0.toLowerCase() !== sortedToken0.address.toLowerCase()) {
        throw new Error("Token ordering mismatch with pool contract");
      }

      // Create Pool instance with SDK - use sorted tokens
      const pool = new Pool(
        sortedToken0,
        sortedToken1,
        fee,
        JSBI.BigInt(slot0.sqrtPriceX96.toString()),
        JSBI.BigInt(liquidity.toString()),
        slot0.tick
      );

      console.debug(
        `✅ Pool created: ${sortedToken0.symbol}/${sortedToken1.symbol} (${
          fee / 10000
        }%)`
      );
      return pool;
    } catch {
      return null;
    }
  }

  /**
   * Calculate optimal ticks based on current tick and fee tier
   * Following: https://docs.uniswap.org/sdk/v3/guides/liquidity/position-data
   */
  calculateTicks(
    currentTick: number,
    fee: number,
    rangeMultiplier: number = 1.2
  ): { tickLower: number; tickUpper: number } {
    // Get tick spacing for fee tier
    const tickSpacing = this.getTickSpacing(fee);

    // Calculate tick range based on current tick and multiplier
    const tickRange = Math.floor(Math.abs(currentTick) * (rangeMultiplier - 1));

    // Calculate lower and upper ticks
    const tickLower = nearestUsableTick(currentTick - tickRange, tickSpacing);
    const tickUpper = nearestUsableTick(currentTick + tickRange, tickSpacing);

    // Validate ticks are within acceptable range
    const MIN_TICK = -887272;
    const MAX_TICK = 887272;

    const validTickLower = Math.max(MIN_TICK, tickLower);
    const validTickUpper = Math.min(MAX_TICK, tickUpper);

    return {
      tickLower: validTickLower,
      tickUpper: validTickUpper,
    };
  }

  /**
   * Get tick spacing for fee tier
   */
  private getTickSpacing(fee: number): number {
    const validFees = [100, 500, 3000, 10000] as const;
    type ValidFee = (typeof validFees)[number];

    if (validFees.includes(fee as ValidFee)) {
      return TICK_SPACINGS[fee as ValidFee];
    }
    return TICK_SPACINGS[FEE_TIERS.MEDIUM as keyof typeof TICK_SPACINGS];
  }

  /**
   * Create Position instances - Following official docs
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/position-data
   *
   * There are four ways to construct a position as shown in docs:
   * 1. Direct constructor
   * 2. fromAmounts()
   * 3. fromAmount0()
   * 4. fromAmount1()
   */

  /**
   * Create position using direct constructor
   */
  createPositionDirect(
    pool: Pool,
    liquidity: string | number,
    tickLower: number,
    tickUpper: number
  ): Position {
    // Make sure ticks are usable
    const spacing = this.getTickSpacing(pool.fee);
    const usableTickLower = nearestUsableTick(tickLower, spacing);
    const usableTickUpper = nearestUsableTick(tickUpper, spacing);

    return new Position({
      pool,
      liquidity: JSBI.BigInt(liquidity.toString()),
      tickLower: usableTickLower,
      tickUpper: usableTickUpper,
    });
  }

  /**
   * Create position using fromAmounts() - most common approach
   * Following official docs example
   */
  createPositionFromAmounts(
    pool: Pool,
    tickLower: number,
    tickUpper: number,
    amount0: string,
    amount1: string,
    useFullPrecision: boolean = true
  ): Position {
    // Make sure ticks are usable
    const spacing = this.getTickSpacing(pool.fee);
    const usableTickLower = nearestUsableTick(tickLower, spacing);
    const usableTickUpper = nearestUsableTick(tickUpper, spacing);

    return Position.fromAmounts({
      pool,
      tickLower: usableTickLower,
      tickUpper: usableTickUpper,
      amount0: JSBI.BigInt(amount0),
      amount1: JSBI.BigInt(amount1),
      useFullPrecision,
    });
  }

  /**
   * Create position using fromAmount0() - when you know amount0
   */
  createPositionFromAmount0(
    pool: Pool,
    tickLower: number,
    tickUpper: number,
    amount0: string,
    useFullPrecision: boolean = true
  ): Position {
    const spacing = this.getTickSpacing(pool.fee);
    const usableTickLower = nearestUsableTick(tickLower, spacing);
    const usableTickUpper = nearestUsableTick(tickUpper, spacing);

    return Position.fromAmount0({
      pool,
      tickLower: usableTickLower,
      tickUpper: usableTickUpper,
      amount0: JSBI.BigInt(amount0),
      useFullPrecision,
    });
  }

  /**
   * Create position using fromAmount1() - when you know amount1
   */
  createPositionFromAmount1(
    pool: Pool,
    tickLower: number,
    tickUpper: number,
    amount1: string
  ): Position {
    const spacing = this.getTickSpacing(pool.fee);
    const usableTickLower = nearestUsableTick(tickLower, spacing);
    const usableTickUpper = nearestUsableTick(tickUpper, spacing);

    return Position.fromAmount1({
      pool,
      tickLower: usableTickLower,
      tickUpper: usableTickUpper,
      amount1: JSBI.BigInt(amount1),
      // useFullPrecision is not supported in fromAmount1; amounts are exact
    });
  }

  /**
   * 2. MINTING A POSITION - Following official docs
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/minting
   *
   * Step 1: Giving approval to transfer our tokens
   * Step 2: Creating an instance of a Pool
   * Step 3: Calculating our Position from our input tokens
   * Step 4: Configuring and executing our minting transaction
   */

  /**
   * Step 1: Get token transfer approval
   * Following docs: We need to give approval to NonfungiblePositionManager to transfer tokens
   */
  async getTokenTransferApproval(
    tokenAddress: string,
    amount: string
  ): Promise<boolean> {
    if (!this.signer) {
      throw new Error("Signer is required for token approval");
    }

    try {
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

      if (!addresses) {
        throw new Error(
          `No Uniswap V3 addresses found for chainId: ${this.chainId}`
        );
      }

      // Validate token address first
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        throw new Error(`Invalid token address: ${tokenAddress}`);
      }

      // Check if address is valid format
      try {
        ethers.getAddress(tokenAddress); // This will throw if invalid
      } catch {
        throw new Error(`Invalid token address format: ${tokenAddress}`);
      }

      console.debug("✅ Token address validation passed");

      // Create token contract
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
          "function balanceOf(address account) external view returns (uint256)",
          "function symbol() external view returns (string)",
          "function decimals() external view returns (uint8)",
        ],
        this.signer
      );

      const signerAddress = await this.signer.getAddress();

      console.debug(
        "🔄 Checking if contract exists and has allowance function..."
      );

      // First, check if the contract exists by calling a simple function
      try {
        // First, test basic network connectivity
        try {
          const blockNumber = await this.provider.getBlockNumber();
          console.debug("Block check ok:", blockNumber);
          const network = await this.provider.getNetwork();
          console.debug("Network check ok:", network.chainId);
        } catch {
          throw new Error(`RPC connection failed: provider not reachable`);
        }

        const code = await this.provider.getCode(tokenAddress);
        console.debug("Token bytecode length:", code?.length || 0);

        if (code === "0x") {
          // Additional debugging: Try alternative RPC endpoint
          console.debug(
            "🔄 Trying alternative RPC endpoint for verification..."
          );

          try {
            // 🔧 Test dengan dynamic RPC dari Terravest API
            const dynamicRpcUrl = await getWorkingRPCUrl(this.chainId);
            const rpcResponse = await fetch(dynamicRpcUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getCode",
                params: [tokenAddress, "latest"],
                id: 1,
              }),
            });

            const rpcData = await rpcResponse.json();

            if (rpcData.result && rpcData.result !== "0x") {
              console.debug("✅ Token verified with dynamic RPC");
            }
          } catch (rpcError) {
            console.debug(
              "Dynamic RPC verification failed:",
              (rpcError as any)?.message || rpcError
            );
          }

          throw new Error(`No contract deployed at address: ${tokenAddress}`);
        }

        console.debug(
          `✅ Contract bytecode found at ${tokenAddress}, length: ${code.length}`
        );

        // 🔧 ROBUST ERC20 FUNCTION CALLS dengan fallback mechanism
        let symbol, decimals;

        // Try to call symbol function dengan error handling
        try {
          console.debug(`🔍 Calling symbol() function...`);
          symbol = await tokenContract.symbol();
          console.debug(`✅ Contract symbol: ${symbol}`);
        } catch {
          // Fallback berdasarkan address (Updated for Arbitrum)
          if (
            tokenAddress.toLowerCase() ===
            "0xaf88d065e77c8cc2239327c5edb3a432268e5831" // Native USDC Arbitrum
          ) {
            symbol = "USDC";
          } else if (
            tokenAddress.toLowerCase() ===
            "0xae771ac9292c84ed2a6625ae92380dedcf9a5076" // KM Token Arbitrum
          ) {
            symbol = "KM";
          } else if (
            tokenAddress.toLowerCase() ===
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" // USDC BSC (fallback)
          ) {
            symbol = "USDC";
          } else if (
            tokenAddress.toLowerCase() ===
            "0xc327d83686f6b491b1d93755fcee036abd4877dc" // KS Token BSC (fallback)
          ) {
            symbol = "TS";
          } else {
            symbol = "UNKNOWN";
          }
          console.debug(`🔄 Using fallback symbol: ${symbol}`);
        }

        // Try to call decimals function dengan error handling
        try {
          console.debug(`🔍 Calling decimals() function...`);
          const rawDecimals = await tokenContract.decimals();
          decimals = Number(rawDecimals);
          console.debug(`✅ Contract decimals: ${decimals}`);
        } catch {
          // Fallback untuk known tokens (Updated for Arbitrum)
          if (
            tokenAddress.toLowerCase() ===
            "0xaf88d065e77c8cc2239327c5edb3a432268e5831" // Native USDC Arbitrum
          ) {
            decimals = 6; // USDC has 6 decimals on all chains
          } else if (
            tokenAddress.toLowerCase() ===
            "0xae771ac9292c84ed2a6625ae92380dedcf9a5076" // KM Token Arbitrum
          ) {
            decimals = 18; // KM Token (18 decimals)
          } else if (
            tokenAddress.toLowerCase() ===
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" // USDC BSC (fallback)
          ) {
            decimals = 6; // USDC BSC (FIXED: USDC has 6 decimals, not 18!)
          } else if (
            tokenAddress.toLowerCase() ===
            "0xc327d83686f6b491b1d93755fcee036abd4877dc" // KS Token BSC (fallback)
          ) {
            decimals = 18; // TH Token (assumed)
          } else {
            decimals = 18; // Default
          }
          console.debug(`🔄 Using fallback decimals: ${decimals}`);
        }
        // Final validation
      } catch {
        // Provide more specific error messages
        if (false) {
          throw new Error(
            `KONTRAK_TIDAK_DITEMUKAN: Token contract tidak ditemukan di address: ${tokenAddress} pada BSC chain. Silakan verifikasi bahwa token sudah benar-benar di-deploy ke BSC network.`
          );
        } else {
          throw new Error(
            `KONTRAK_TIDAK_VALID: Contract di address ${tokenAddress} tidak valid atau tidak memiliki function ERC20 standard.`
          );
        }
      }

      console.debug("🔄 Checking allowance...");

      // 🔧 ROBUST ALLOWANCE CHECK dengan fallback mechanism
      let currentAllowance: bigint;
      try {
        currentAllowance = await tokenContract.allowance(
          signerAddress,
          addresses.POSITION_MANAGER
        );
      } catch (allowanceError) {
        // Safe fallback - assume no allowance, akan trigger approval
        currentAllowance = BigInt(0);

        // Don't throw error - continue dengan fallback allowance
        console.debug(
          "allowance() call failed; falling back to zero allowance:",
          (allowanceError as any)?.message || allowanceError
        );
      }

      // Check if approval is already sufficient
      const amountBigInt = BigInt(amount);
      if (currentAllowance >= amountBigInt) {
        return true;
      }

      // Enhanced balance check dengan fallback
      let balance: bigint;
      try {
        balance = await tokenContract.balanceOf(signerAddress);

        if (balance < amountBigInt) {
          throw new Error(
            `Insufficient token balance. Required: ${amount}, Available: ${balance.toString()}`
          );
        }
      } catch {}
      // add minimal debug to satisfy linter
      // even if balanceError is intentionally ignored above, at least reference it
      // without changing behavior

      // 🔧 Execute approval dengan Circuit Breaker Protection & Retry Logic
      // FIXED: Use amount as-is since it's already in correct wei units
      const approvalAmountBigInt = BigInt(amount);

      // DEBUG: Log approval amount details for transparency (using correct Arbitrum addresses)
      const isArbitrumUSDC =
        tokenAddress.toLowerCase() ===
        "0xaf88d065e77c8cc2239327c5edb3a432268e5831"; // Native USDC Arbitrum
      const isArbitrumTH =
        tokenAddress.toLowerCase() ===
        "0xae771ac9292c84ed2a6625ae92380dedcf9a5076"; // KM Token Arbitrum
      const isBscUSDC =
        tokenAddress.toLowerCase() ===
        "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"; // USDC BSC

      const tokenSymbol =
        isArbitrumUSDC || isBscUSDC ? "USDC" : isArbitrumTH ? "KM" : "UNKNOWN";
      const tokenDecimals =
        isArbitrumUSDC || isBscUSDC ? 6 : isArbitrumTH ? 18 : 18;

      // SAFETY CHECK: Prevent absurdly large approval amounts (likely decimal conversion bug)
      const humanReadableAmount = new BigNumber(amount).dividedBy(
        new BigNumber(10).pow(tokenDecimals)
      );
      if (humanReadableAmount.gt(1000000)) {
        // More than 1 million tokens

        throw new Error(
          `Approval amount too large: ${humanReadableAmount.toFixed(
            2
          )} ${tokenSymbol}. ` +
            `This is likely a decimal conversion error. Maximum reasonable: 1,000,000 ${tokenSymbol}`
        );
      }

      // Retry mechanism untuk approval transaction
      let approveTx;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          // 🔧 Pre-check provider health sebelum approval
          await this.quickProviderHealthCheck();

          // Add timeout protection untuk circuit breaker issues
          const approvalPromise = tokenContract.approve(
            addresses.POSITION_MANAGER,
            approvalAmountBigInt
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error("Approval timeout - possible circuit breaker")
                ),
              45000 // Increased timeout untuk circuit breaker recovery
            )
          );

          approveTx = await Promise.race([approvalPromise, timeoutPromise]);

          break; // Success, exit retry loop
        } catch (retryError: any) {
          retryCount++;
          const isCircuitBreaker =
            retryError.message?.includes("circuit breaker") ||
            retryError.code === -32603;
          // const isTimeout = retryError.message?.includes("timeout");

          if (retryCount >= maxRetries) {
            if (isCircuitBreaker) {
              throw new Error(
                `🚨 CIRCUIT BREAKER: All BSC RPC providers are overloaded. This is a network-wide issue. Please wait 5-10 minutes and try again. Current provider: ${this.provider.constructor.name}`
              );
            } else {
              throw new Error(
                `Approval failed after ${maxRetries} attempts: ${retryError.message}. Provider: ${this.provider.constructor.name}`
              );
            }
          }

          // Wait before retry (exponential backoff untuk circuit breaker recovery)
          const waitTime = Math.pow(2, retryCount) * 2000; // 4s, 8s, 16s
          console.debug(
            `⏳ Waiting ${waitTime}ms for circuit breaker recovery...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      const receipt = await approveTx.wait();
      console.debug(`✅ Token approval successful. Hash: ${receipt.hash}`);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Step 2: Create Pool instance using computePoolAddress
   * Following docs: We compute pool address and get pool data
   */
  async createPoolInstance(
    token0: Token,
    token1: Token,
    fee: number
  ): Promise<Pool | null> {
    try {
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

      // Sort tokens for proper ordering
      const [sortedToken0, sortedToken1] =
        token0.address.toLowerCase() < token1.address.toLowerCase()
          ? [token0, token1]
          : [token1, token0];

      // Compute pool address using SDK function
      const currentPoolAddress = computePoolAddress({
        factoryAddress: addresses.FACTORY,
        tokenA: sortedToken0,
        tokenB: sortedToken1,
        fee: fee as FeeAmount,
      });

      console.debug(`🔍 Computed pool address: ${currentPoolAddress}`);

      // Get pool data from contract
      const poolContract = new ethers.Contract(
        currentPoolAddress,
        [
          "function liquidity() external view returns (uint128)",
          "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
        ],
        this.provider
      );

      // Check if pool exists by trying to call liquidity function with retries
      let liquidity, slot0;
      let poolDataRetrieved = false;
      let attemptCount = 0;
      const maxAttempts = 6; // Increased from 3 to 6

      while (!poolDataRetrieved && attemptCount < maxAttempts) {
        try {
          console.debug(
            `🔄 Attempt ${
              attemptCount + 1
            }/${maxAttempts} to fetch pool data...`
          );

          [liquidity, slot0] = await Promise.all([
            poolContract.liquidity(),
            poolContract.slot0(),
          ]);

          // Validate that we got meaningful data
          // Note: New pools may have sqrtPriceX96 but liquidity = 0, which is valid
          if (slot0.sqrtPriceX96.toString() !== "0") {
            poolDataRetrieved = true;
          } else {
            throw new Error("Pool data appears to be uninitialized");
          }
        } catch {
          attemptCount++;

          if (attemptCount < maxAttempts) {
            const waitTime = Math.min(5 + attemptCount * 3, 20); // Progressive wait: 5, 8, 11, 14, 17, 20 seconds max

            await new Promise((resolve) =>
              setTimeout(resolve, waitTime * 1000)
            );
          }
        }
      }

      if (!poolDataRetrieved) {
        // Try with fallback provider for Arbitrum
        if (this.chainId === 42161) {
          try {
            console.debug("🔄 Trying with fallback RPC provider...");
            const fallbackProvider = await this.createFallbackProvider();
            const fallbackPoolContract = new ethers.Contract(
              currentPoolAddress,
              [
                "function liquidity() external view returns (uint128)",
                "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
              ],
              fallbackProvider
            );

            const [fallbackLiquidity, fallbackSlot0] = await Promise.all([
              fallbackPoolContract.liquidity(),
              fallbackPoolContract.slot0(),
            ]);

            if (fallbackSlot0.sqrtPriceX96.toString() !== "0") {
              liquidity = fallbackLiquidity;
              slot0 = fallbackSlot0;
              poolDataRetrieved = true;
            }
          } catch (fallbackError) {
            console.debug("Fallback provider attempt failed:", fallbackError);
          }
        }

        if (!poolDataRetrieved) {
          console.debug(
            `❌ Pool does not exist at address: ${currentPoolAddress}`
          );
          return null;
        }
      }

      // Validate and fix tick if necessary
      let validTick = slot0.tick;

      // Handle tick validation for new or uninitialized pools
      if (typeof validTick === "bigint") {
        validTick = Number(validTick);
      }

      // Validate tick is within acceptable range for Uniswap V3
      const MIN_TICK = -887272;
      const MAX_TICK = 887272;

      if (validTick < MIN_TICK || validTick > MAX_TICK || isNaN(validTick)) {
        // Calculate tick from sqrtPriceX96 if tick is invalid
        try {
          // const sqrtPriceX96JSBI = JSBI.BigInt(slot0.sqrtPriceX96.toString());
          // const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

          // Convert to regular number for mathematical operations
          const sqrtPriceX96Number = parseFloat(slot0.sqrtPriceX96.toString());
          const Q96Number = Math.pow(2, 96);

          // Calculate price: price = (sqrtPriceX96 / 2^96)^2
          const sqrtPrice = sqrtPriceX96Number / Q96Number;
          const price = sqrtPrice * sqrtPrice;

          // Adjust for token decimals if needed
          const decimalAdjustedPrice =
            price * Math.pow(10, sortedToken0.decimals - sortedToken1.decimals);

          if (decimalAdjustedPrice > 0) {
            // Calculate tick from price: tick = log₁.₀₀₀₁(price)
            validTick = Math.floor(
              Math.log(decimalAdjustedPrice) / Math.log(1.0001)
            );
            validTick = Math.max(MIN_TICK, Math.min(MAX_TICK, validTick));
          } else {
            throw new Error("Invalid price calculation");
          }
        } catch {
          // Fallback to middle tick for new pools
          validTick = 0;
        }
      }

      // Create Pool instance using SDK with validated tick
      let configuredPool;
      try {
        configuredPool = new Pool(
          sortedToken0,
          sortedToken1,
          fee,
          JSBI.BigInt(slot0.sqrtPriceX96.toString()),
          JSBI.BigInt(liquidity.toString()),
          validTick
        );
      } catch (poolConstructorError: any) {
        // If it's a tick invariant error, try with tick 0
        if (
          poolConstructorError.message?.includes("TICK") ||
          poolConstructorError.message?.includes("Invariant")
        ) {
          console.debug("🔄 Retrying pool creation with tick 0...");
          try {
            configuredPool = new Pool(
              sortedToken0,
              sortedToken1,
              fee,
              JSBI.BigInt(slot0.sqrtPriceX96.toString()),
              JSBI.BigInt(liquidity.toString()),
              0 // Use tick 0 as final fallback
            );
            console.debug("✅ Pool created successfully with fallback tick 0");
          } catch {
            throw new Error(
              `Pool instance creation failed: ${poolConstructorError.message}. This may indicate the pool data is corrupted or not fully initialized. Please try again in a few minutes.`
            );
          }
        } else {
          throw poolConstructorError;
        }
      }

      console.debug(
        `✅ Pool instance created: ${sortedToken0.symbol}/${
          sortedToken1.symbol
        } (${fee / 10000}%)`
      );
      return configuredPool;
    } catch {
      return null;
    }
  }

  /**
   * Mint Position - Following Official Uniswap V3 SDK Documentation
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/minting
   */
  async mintPosition(params: {
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
  }): Promise<MintResult> {
    if (!this.signer) {
      throw new Error("Signer is required for minting position");
    }

    try {
      // 1. INPUT VALIDATION (Following official validation pattern)
      if (!params.amount0 || !params.amount1) {
        throw new Error("Both token amounts are required");
      }
      if (!params.recipient || !ethers.isAddress(params.recipient)) {
        throw new Error("Valid recipient address is required");
      }
      const validFees = [
        FEE_TIERS.VERY_LOW,
        FEE_TIERS.LOW,
        FEE_TIERS.MEDIUM,
        FEE_TIERS.HIGH,
      ];
      if (!validFees.includes(params.fee)) {
        throw new Error(`Invalid fee tier: ${params.fee}`);
      }

      // 2. CREATE TOKEN INSTANCES (Official pattern)
      const token0 = await this.createToken(params.tokenA);
      const token1 = await this.createToken(params.tokenB);

      const amount0Raw = ethers.parseUnits(params.amount0, token0.decimals);
      const amount1Raw = ethers.parseUnits(params.amount1, token1.decimals);

      // 4. TOKEN APPROVALS TO NONFUNGIBLE POSITION MANAGER (Official pattern)
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      const positionManagerAddress = addresses.POSITION_MANAGER;

      const approvals: Promise<any>[] = [];

      if (!params.tokenA.isNative) {
        approvals.push(
          this.getTokenTransferApproval(token0.address, amount0Raw.toString())
        );
      }

      if (!params.tokenB.isNative) {
        approvals.push(
          this.getTokenTransferApproval(token1.address, amount1Raw.toString())
        );
      }

      if (approvals.length > 0) {
        await Promise.all(approvals);
        // Wait for confirmation
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      let pool = await this.createPoolInstance(token0, token1, params.fee);

      if (!pool) {
        // CRITICAL: Determine correct token order for pool (Uniswap sorts by address)
        // tokenA = USDC, tokenB = TH
        const tokenAAmount = new BigNumber(params.amount0); // 1 USDC
        const tokenBAmount = new BigNumber(params.amount1); // 2500 TH

        // Explicitly determine sorted token order
        let sortedToken0, sortedToken1, sorted0Amount, sorted1Amount;

        if (token0.address.toLowerCase() < token1.address.toLowerCase()) {
          // tokenA (USDC) becomes pool token0, tokenB (TH) becomes pool token1
          sortedToken0 = {
            symbol: params.tokenA.symbol,
            address: token0.address,
          }; // USDC
          sortedToken1 = {
            symbol: params.tokenB.symbol,
            address: token1.address,
          }; // TS
          sorted0Amount = tokenAAmount; // 1 USDC
          sorted1Amount = tokenBAmount; // 2500 TH
        } else {
          // tokenB (TH) becomes pool token0, tokenA (USDC) becomes pool token1
          sortedToken0 = {
            symbol: params.tokenB.symbol,
            address: token1.address,
          }; // TH
          sortedToken1 = {
            symbol: params.tokenA.symbol,
            address: token0.address,
          }; // USDC
          sorted0Amount = tokenBAmount; // 2500 TH
          sorted1Amount = tokenAAmount; // 1 USDC
        }

        // Calculate price as token1/token0 (Uniswap V3 standard)
        // User wants: 1 USDC = 2500 TH
        const initialPrice = sorted1Amount.dividedBy(sorted0Amount).toString();

        try {
          const addresses =
            UNISWAP_V3_ADDRESSES[
              this.chainId as keyof typeof UNISWAP_V3_ADDRESSES
            ];
          const factoryContract = new ethers.Contract(
            addresses.FACTORY,
            [
              "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)",
            ],
            this.provider
          );

          // Check all fee tiers
          const feeTiers = [
            FEE_TIERS.VERY_LOW,
            FEE_TIERS.LOW,
            FEE_TIERS.MEDIUM,
            FEE_TIERS.HIGH,
          ];
          for (const feeToCheck of feeTiers) {
            const existingPoolAddress = await factoryContract.getPool(
              token0.address,
              token1.address,
              feeToCheck
            );

            if (
              existingPoolAddress &&
              existingPoolAddress !== ethers.ZeroAddress
            ) {
              if (feeToCheck === params.fee) {
                // Skip pool creation since it already exists
                const existingPool = await this.createPoolInstance(
                  token0,
                  token1,
                  params.fee
                );
                if (existingPool) {
                  pool = existingPool;
                  break; // Exit loop to use existing pool
                }
              }
            }
          }
        } catch {}

        // Only create pool if we didn't find an existing one
        if (!pool) {
          await this.createPool({
            tokenA: params.tokenA,
            tokenB: params.tokenB,
            fee: params.fee,
            initialPrice,
          });

          // Wait for pool creation and try again
          await new Promise((resolve) => setTimeout(resolve, 10000));

          pool = await this.createPoolInstance(token0, token1, params.fee);
        } else {
        }

        if (!pool) {
          throw new Error("Failed to create or retrieve pool after creation");
        }
      }

      // VALIDATE POOL PRICE: Ensure pool has correct price ratio
      const currentPoolPrice = parseFloat(pool.token1Price.toFixed(8));
      const expectedPrice =
        token0.address.toLowerCase() < token1.address.toLowerCase()
          ? parseFloat(
              new BigNumber(params.amount1).dividedBy(params.amount0).toString()
            )
          : parseFloat(
              new BigNumber(params.amount0).dividedBy(params.amount1).toString()
            );

      const priceTolerance = 0.02; // 2% tolerance
      const priceRatio = Math.abs(
        (currentPoolPrice - expectedPrice) / expectedPrice
      );

      // 6. CALCULATE TICKS FOR POSITION (Following official pattern)
      const tickSpacing = this.getTickSpacing(params.fee);

      // Center default range around current pool tick so both tokens are deposited
      let tickLower: number;
      let tickUpper: number;
      if (
        typeof params.tickLower === "number" &&
        typeof params.tickUpper === "number"
      ) {
        tickLower = params.tickLower;
        tickUpper = params.tickUpper;
      } else {
        // Use full range to ensure both tokens are used in exact proportions
        const MIN_TICK = -887272;
        const MAX_TICK = 887272;
        tickLower = nearestUsableTick(MIN_TICK, tickSpacing);
        tickUpper = nearestUsableTick(MAX_TICK, tickSpacing);
      }

      // FIXED: Better token mapping logic
      let finalAmount0: string, finalAmount1: string;

      // Check which input token matches which pool token
      if (token0.address.toLowerCase() === pool.token0.address.toLowerCase()) {
        // tokenA(token0) maps to pool.token0, tokenB(token1) maps to pool.token1
        finalAmount0 = amount0Raw.toString(); // tokenA amount goes to pool.token0
        finalAmount1 = amount1Raw.toString(); // tokenB amount goes to pool.token1
      } else if (
        token0.address.toLowerCase() === pool.token1.address.toLowerCase()
      ) {
        // tokenA(token0) maps to pool.token1, tokenB(token1) maps to pool.token0
        finalAmount0 = amount1Raw.toString(); // tokenB amount goes to pool.token0
        finalAmount1 = amount0Raw.toString(); // tokenA amount goes to pool.token1
      } else {
        throw new Error(
          `Token mapping failed! Input tokens don't match pool tokens.\n` +
            `Input: ${params.tokenA.symbol}(${token0.address}) / ${params.tokenB.symbol}(${token1.address})\n` +
            `Pool: ${pool.token0.symbol}(${pool.token0.address}) / ${pool.token1.symbol}(${pool.token1.address})`
        );
      }

      // Calculate liquidity manually to ensure exact amounts
      const position = Position.fromAmounts({
        pool,
        tickLower,
        tickUpper,
        amount0: JSBI.BigInt(finalAmount0),
        amount1: JSBI.BigInt(finalAmount1),
        useFullPrecision: false, // Don't adjust amounts
      });

      // CRITICAL FIX: Use wide but realistic range around current price
      const optimizedTickSpacing = this.getTickSpacing(params.fee);
      const currentTick = pool.tickCurrent;

      // Use a very wide range but not full range to avoid liquidity calculation issues
      const wideRangeWidth = 1000 * optimizedTickSpacing; // Much wider range
      const optimizedTickLower = nearestUsableTick(
        currentTick - wideRangeWidth,
        optimizedTickSpacing
      );
      const optimizedTickUpper = nearestUsableTick(
        currentTick + wideRangeWidth,
        optimizedTickSpacing
      );

      // Use absolute full range to minimize price impact
      const fullRangeTickSpacing = this.getTickSpacing(params.fee);
      const MIN_TICK = -887272;
      const MAX_TICK = 887272;
      const fullRangeTickLower = nearestUsableTick(
        MIN_TICK,
        fullRangeTickSpacing
      );
      const fullRangeTickUpper = nearestUsableTick(
        MAX_TICK,
        fullRangeTickSpacing
      );

      const exactPosition = Position.fromAmounts({
        pool,
        tickLower: fullRangeTickLower,
        tickUpper: fullRangeTickUpper,
        amount0: JSBI.BigInt(finalAmount0),
        amount1: JSBI.BigInt(finalAmount1),
        useFullPrecision: true,
      });

      // Use improved slippage tolerance for mint options
      const effectiveSlippage = Math.max(params.slippageTolerance, 0.1); // Minimum 10% slippage
      const improvedSlippageTolerance = new Percent(
        Math.floor(effectiveSlippage * 10000),
        10_000
      );

      const improvedMintOptions: MintOptions = {
        recipient: params.recipient,
        deadline: params.deadline,
        slippageTolerance: improvedSlippageTolerance,
      };

      try {
        const { calldata, value } =
          NonfungiblePositionManager.addCallParameters(
            exactPosition,
            improvedMintOptions
          );

        // Continue with transaction
        const transaction = {
          to: positionManagerAddress,
          data: calldata,
          value: value || "0",
        };

        const txResponse = await this.signer.sendTransaction(transaction);

        const receipt = await txResponse.wait();
        if (!receipt) {
          throw new Error("Transaction receipt not available");
        }

        // Parse result and return
        const result = this.parseMintResult(receipt);

        if (!result.tokenId || result.tokenId.toString() === "0") {
          throw new Error(
            "Position creation failed: No NFT position was minted"
          );
        }

        return result;
      } catch (calldataError) {
        console.error(
          "❌ Error in calldata generation or transaction:",
          calldataError
        );
        throw new Error(
          `Mint position failed: ${(calldataError as Error).message}`
        );
      }
    } catch (error) {
      console.error("❌ Mint position failed:", error);
      throw error;
    }
  }

  /**
   * Check if pool exists for given token pair and fee
   */
  async checkPoolExists(params: {
    tokenA: TokenData;
    tokenB: TokenData;
    fee: number;
  }): Promise<boolean> {
    try {
      // Create token instances
      const token0 = await this.createToken(params.tokenA);
      const token1 = await this.createToken(params.tokenB);

      // Sort tokens to get canonical order
      const [sortedToken0, sortedToken1] = token0.sortsBefore(token1)
        ? [token0, token1]
        : [token1, token0];

      // Get pool address using computePoolAddress
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      const poolAddress = computePoolAddress({
        factoryAddress: addresses.FACTORY,
        tokenA: sortedToken0,
        tokenB: sortedToken1,
        fee: params.fee as FeeAmount,
      });

      // Check if pool has been initialized by checking if it has price set
      try {
        const poolContract = new ethers.Contract(
          poolAddress,
          [
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
            "function liquidity() external view returns (uint128)",
          ],
          this.provider
        );

        const slot0 = await poolContract.slot0();
        const sqrt =
          typeof slot0.sqrtPriceX96 === "bigint"
            ? slot0.sqrtPriceX96
            : BigInt(slot0.sqrtPriceX96.toString());
        const isInitialized = sqrt !== BigInt(0);

        return isInitialized;
      } catch {
        return false;
      }
    } catch (error) {
      console.debug(
        "checkPoolExists failed:",
        (error as any)?.message || error
      );
      return false;
    }
  }

  /**
   * Create new pool for token pair with initial price
   */
  async createPool(params: {
    tokenA: TokenData;
    tokenB: TokenData;
    fee: number;
    initialPrice: string; // Price of tokenA in terms of tokenB
  }): Promise<{ hash: string; poolAddress: string }> {
    if (!this.signer) {
      throw new Error("Signer is required for creating pool");
    }

    // Declare variables outside try block so they're accessible in catch block
    let sortedToken0: Token | null = null;
    let sortedToken1: Token | null = null;
    let factoryContract: ethers.Contract | null = null;

    try {
      console.debug("🚀 Starting pool creation process...");

      // Create token instances
      const token0 = await this.createToken(params.tokenA);
      const token1 = await this.createToken(params.tokenB);

      // Sort tokens to get canonical order (token0 < token1)
      [sortedToken0, sortedToken1] = token0.sortsBefore(token1)
        ? [token0, token1]
        : [token1, token0];

      // Get factory contract
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      factoryContract = new ethers.Contract(
        addresses.FACTORY,
        [
          "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
          "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)",
        ],
        this.signer
      );

      // Calculate initial sqrtPriceX96 from price (decimals-aware)
      // params.initialPrice represents token1 per token0 in human units after sorting
      // Convert to base-units ratio by multiplying 10^(dec1 - dec0)
      const priceHuman = new BigNumber(params.initialPrice);
      const decimalFactor = new BigNumber(10).pow(
        (sortedToken1.decimals || 18) - (sortedToken0.decimals || 18)
      );
      const priceAdjusted = priceHuman.multipliedBy(decimalFactor);
      const sqrtPriceX96 = BigInt(
        new BigNumber(2)
          .pow(96)
          .multipliedBy(priceAdjusted.sqrt())
          .integerValue(BigNumber.ROUND_FLOOR)
          .toFixed(0)
      );

      // Step 0: Validate tokens before pool creation
      console.debug("🔍 Step 0: Validating tokens before pool creation...");

      try {
        // Test token contracts are valid and callable
        const token0Contract = new ethers.Contract(
          sortedToken0.address,
          [
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
          ],
          this.provider
        );
        const token1Contract = new ethers.Contract(
          sortedToken1.address,
          [
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
          ],
          this.provider
        );
        await Promise.all([
          token0Contract.symbol(),
          token0Contract.decimals(),
          token1Contract.symbol(),
          token1Contract.decimals(),
        ]);
      } catch (tokenValidationError) {
        throw new Error(
          `Token contracts invalid: ${
            (tokenValidationError as Error).message
          }. Please verify token addresses are correct and deployed on Arbitrum.`
        );
      }

      // Step 1: FIRST CHECK IF POOL ALREADY EXISTS
      console.debug("🔍 Step 1: Comprehensive pool existence check...");

      try {
        const existingPool = await factoryContract.getPool(
          sortedToken0.address,
          sortedToken1.address,
          params.fee
        );

        if (existingPool !== "0x0000000000000000000000000000000000000000") {
          // If pool already exists, ensure it's initialized with a price
          const readOnlyPoolContract = new ethers.Contract(
            existingPool,
            [
              "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
            ],
            this.provider
          );

          const existingSlot0 = await readOnlyPoolContract.slot0();
          const existingSqrt = BigInt(existingSlot0.sqrtPriceX96.toString());

          if (existingSqrt === BigInt(0)) {
            // Not initialized yet → initialize now with provided initial price (decimals-aware)
            const priceHuman = new BigNumber(params.initialPrice);
            const decimalFactor = new BigNumber(10).pow(
              (sortedToken1.decimals || 18) - (sortedToken0.decimals || 18)
            );
            const priceAdjusted = priceHuman.multipliedBy(decimalFactor);
            const sqrtPriceX96 = BigInt(
              new BigNumber(2)
                .pow(96)
                .multipliedBy(priceAdjusted.sqrt())
                .integerValue(BigNumber.ROUND_FLOOR)
                .toFixed(0)
            );

            const poolWriter = new ethers.Contract(
              existingPool,
              ["function initialize(uint160 sqrtPriceX96) external"],
              this.signer
            );

            try {
              const initGasEstimate = await poolWriter.initialize.estimateGas(
                sqrtPriceX96
              );
              const initTx = await poolWriter.initialize(sqrtPriceX96, {
                gasLimit: (initGasEstimate * BigInt(120)) / BigInt(100),
                maxFeePerGas: ethers.parseUnits("0.1", "gwei"),
                maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"),
              });
              await initTx.wait();
            } catch {
              // Fallback with fixed gas if estimation fails
              const initTx = await poolWriter.initialize(sqrtPriceX96, {
                gasLimit: 120000,
                maxFeePerGas: ethers.parseUnits("0.1", "gwei"),
                maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"),
              });
              await initTx.wait();
            }

            // Return after successful initialization
            return {
              hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
              poolAddress: existingPool,
            };
          }

          // Already initialized → return as-is
          return {
            hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            poolAddress: existingPool,
          };
        }
      } catch {
        console.debug(
          "🔍 Pool existence check failed, proceeding with creation..."
        );
      }

      // Step 2: Create pool via factory with enhanced error handling
      console.debug(
        "📤 Step 2: Creating pool via factory with enhanced gas settings..."
      );

      let createPoolTx: any;

      try {
        // First estimate gas to check if transaction would succeed
        console.debug("🔍 Step 1a: Estimating gas for pool creation...");

        const gasEstimate = await factoryContract.createPool.estimateGas(
          sortedToken0.address,
          sortedToken1.address,
          params.fee
        );

        // Execute with manual gas settings
        createPoolTx = await factoryContract.createPool(
          sortedToken0.address,
          sortedToken1.address,
          params.fee,
          {
            gasLimit: (gasEstimate * BigInt(120)) / BigInt(100), // 20% buffer
            // FIXED: Much lower gas prices for Arbitrum
            maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // 0.1 gwei for Arbitrum
            maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // 0.05 gwei for Arbitrum
          }
        );
      } catch (gasEstimationError: any) {
        // Check if error is because pool already exists
        if (
          gasEstimationError.message?.includes("execution reverted") ||
          gasEstimationError.message?.includes("PoolAlreadyInitialized")
        ) {
          console.debug("🔍 Pool might already exist, checking again...");

          try {
            const existingPool = await factoryContract.getPool(
              sortedToken0.address,
              sortedToken1.address,
              params.fee
            );

            if (existingPool !== "0x0000000000000000000000000000000000000000") {
              return {
                hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                poolAddress: existingPool,
              };
            }
          } catch {
            console.debug("Pool recheck failed, trying different fee tier...");
          }

          // Try different fee tier (fallback from 0.3%)
          if (params.fee === FEE_TIERS.MEDIUM) {
            console.debug("🔄 Trying 0.05% fee tier as fallback from 0.3%...");

            try {
              createPoolTx = await factoryContract.createPool(
                sortedToken0.address,
                sortedToken1.address,
                FEE_TIERS.LOW, // 0.05% fee tier
                {
                  gasLimit: 150000, // FIXED: Lower gas for Arbitrum
                  maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // FIXED: Much lower for Arbitrum
                  maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // FIXED: Much lower for Arbitrum
                }
              );
            } catch {
              console.debug("0.05% fee tier also failed, trying 0.05% fee...");

              // Final fallback: 0.05% fee tier
              createPoolTx = await factoryContract.createPool(
                sortedToken0.address,
                sortedToken1.address,
                FEE_TIERS.LOW, // 0.05% fee tier
                {
                  gasLimit: 150000, // FIXED: Lower gas for Arbitrum
                  maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // FIXED: Much lower for Arbitrum
                  maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // FIXED: Much lower for Arbitrum
                }
              );
            }
          } else {
            throw new Error(
              "Pool creation failed with execution revert. This token pair may not be compatible with Uniswap V3 or have transfer restrictions."
            );
          }
        } else {
          // Try with higher fixed gas limit as fallback

          createPoolTx = await factoryContract.createPool(
            sortedToken0.address,
            sortedToken1.address,
            params.fee,
            {
              gasLimit: 180000, // FIXED: Much lower gas limit for Arbitrum
              maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // FIXED: Much lower gas price for Arbitrum
              maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // FIXED: Much lower for Arbitrum
            }
          );
        }
      }

      const createPoolReceipt = await createPoolTx.wait();

      if (!createPoolReceipt) {
        throw new Error("Pool creation transaction receipt not available");
      }

      // Get pool address from factory
      const poolAddress = await factoryContract.getPool(
        sortedToken0.address,
        sortedToken1.address,
        params.fee
      );

      // Step 2: Initialize pool with initial price and enhanced gas settings
      console.debug(
        "📤 Step 2: Initializing pool with price and enhanced gas..."
      );
      const poolContract = new ethers.Contract(
        poolAddress,
        ["function initialize(uint160 sqrtPriceX96) external"],
        this.signer
      );

      let initializeTx: any;

      try {
        // Estimate gas for initialization
        const initGasEstimate = await poolContract.initialize.estimateGas(
          sqrtPriceX96
        );

        initializeTx = await poolContract.initialize(sqrtPriceX96, {
          gasLimit: (initGasEstimate * BigInt(120)) / BigInt(100), // 20% buffer
          // FIXED: Much lower gas prices for Arbitrum
          maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // 0.1 gwei for Arbitrum
          maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // 0.05 gwei for Arbitrum
        });
      } catch {
        // Fallback with fixed high gas
        initializeTx = await poolContract.initialize(sqrtPriceX96, {
          gasLimit: 120000, // FIXED: Lower gas limit for Arbitrum initialization
          maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // FIXED: Much lower for Arbitrum
          maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // FIXED: Much lower for Arbitrum
        });
      }

      const initializeReceipt = await initializeTx.wait();
      if (!initializeReceipt) {
        throw new Error(
          "Pool initialization transaction receipt not available"
        );
      }

      return {
        hash: initializeReceipt.hash, // Return initialization tx hash as main
        poolAddress: poolAddress,
      };
    } catch (error: any) {
      // Handle specific RPC errors
      if (
        error.message?.includes("Internal JSON-RPC error") ||
        error.code === -32603 ||
        error.code === "UNKNOWN_ERROR"
      ) {
        console.debug(
          "🔍 RPC error detected, checking if pool was created despite error..."
        );

        try {
          // Wait a bit and check if pool was created
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Check if variables were initialized before the error occurred
          if (!factoryContract || !sortedToken0 || !sortedToken1) {
            console.debug("Variables not initialized, cannot check for pool");
            throw error; // Re-throw original error
          }

          const possiblePool = await factoryContract.getPool(
            sortedToken0.address,
            sortedToken1.address,
            params.fee
          );

          if (possiblePool !== "0x0000000000000000000000000000000000000000") {
            return {
              hash: "0x0000000000000000000000000000000000000000000000000000000000000000", // Dummy hash
              poolAddress: possiblePool,
            };
          }
        } catch {
          console.debug("Pool check after RPC error failed");
        }

        // If no pool found, try alternative fee tiers
        console.debug(
          "🔄 RPC error occurred, trying different fee tier as workaround..."
        );

        if (params.fee === FEE_TIERS.MEDIUM) {
          try {
            console.debug(
              "🔄 Attempting 0.05% fee tier due to RPC issues (fallback from 0.3%)..."
            );

            // Check if variables were initialized before the error occurred
            if (!factoryContract || !sortedToken0 || !sortedToken1) {
              console.debug(
                "Variables not initialized for alternative pool creation"
              );
              throw error; // Re-throw original error
            }

            // Try 1% fee tier with different gas settings
            const altCreatePoolTx = await factoryContract.createPool(
              sortedToken0.address,
              sortedToken1.address,
              500, // 0.05% fee tier
              {
                gasLimit: 80000, // FIXED: Lower gas for Arbitrum // FIXED: Much lower gas limit for Arbitrum
                maxFeePerGas: ethers.parseUnits("0.1", "gwei"), // FIXED: Much lower gas price for Arbitrum
                maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"), // FIXED: Much lower for Arbitrum
              }
            );

            const altCreatePoolReceipt = await altCreatePoolTx.wait();
            if (!altCreatePoolReceipt) {
              throw new Error(
                "Alternative pool creation receipt not available"
              );
            }

            // Get alternative pool address
            const altPoolAddress = await factoryContract.getPool(
              sortedToken0.address,
              sortedToken1.address,
              FEE_TIERS.LOW // 0.05% fee
            );

            return {
              hash: altCreatePoolReceipt.hash,
              poolAddress: altPoolAddress,
            };
          } catch (altPoolError: any) {
            throw new Error(
              `Pool creation failed due to RPC issues. Original error: ${error.message}. Alternative attempt also failed: ${altPoolError.message}. Please try again with a different fee tier manually. 0.05% fee tier.`
            );
          }
        } else {
          throw new Error(
            `Pool creation failed due to RPC error: ${error.message}. This may be a temporary network issue. Please try again in a few moments. 0.05% fee tier.`
          );
        }
      } else {
        // Re-throw other errors as is
        throw error;
      }
    }
  }

  /**
   * 3. FETCHING POSITIONS - Following official docs
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/fetching-positions
   *
   * Steps:
   * 1. Creating an ethers.JS contract to interact with NonfungiblePositionManager
   * 2. Fetching all positions for an address
   * 3. Fetching the position info for the positions
   */

  /**
   * Step 1: Create ethers.JS contract following official docs pattern
   */
  private createNFTPositionManagerContract(): ethers.Contract {
    const addresses =
      UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

    // Create contract exactly as shown in docs
    const nfpmContract = new ethers.Contract(
      addresses.POSITION_MANAGER,
      positionManagerABI,
      this.provider
    );

    return nfpmContract;
  }

  /**
   * Step 2: Fetch all positions for an address following official docs
   * Pattern: balanceOf -> tokenOfOwnerByIndex (batch with Promise.all) -> positions (batch)
   */
  async fetchUserPositions(userAddress: string): Promise<PositionInfo[]> {
    try {
      console.debug(`🔍 Fetching positions for address: ${userAddress}`);

      // Create NonfungiblePositionManager contract
      const nfpmContract = this.createNFTPositionManagerContract();

      // Step 2.1: Fetch number of positions using balanceOf (following docs exactly)
      const numPositions = await nfpmContract.balanceOf(userAddress);
      console.debug(`📊 User ${userAddress} has ${numPositions} positions`);

      if (numPositions.toString() === "0") {
        return [];
      }

      // Step 2.2: Fetch position IDs using tokenOfOwnerByIndex (batch with Promise.all as in docs)
      const calls = [];

      for (let i = 0; i < Number(numPositions); i++) {
        calls.push(nfpmContract.tokenOfOwnerByIndex(userAddress, i));
      }

      console.debug(`🔄 Fetching ${calls.length} position IDs...`);
      const positionIds = await Promise.all(calls);

      // Step 2.3: Fetch position info for all positions (batch as shown in docs)
      return await this.fetchPositionInfoBatch(positionIds);
    } catch {
      return [];
    }
  }

  /**
   * Step 3: Fetch position info batch following official docs pattern
   * Uses Promise.all for efficient batch processing
   */
  private async fetchPositionInfoBatch(
    positionIds: bigint[]
  ): Promise<PositionInfo[]> {
    try {
      const nfpmContract = this.createNFTPositionManagerContract();

      // Create position calls array (following docs pattern exactly)
      const positionCalls = [];

      for (const id of positionIds) {
        positionCalls.push(nfpmContract.positions(id));
      }

      console.debug(
        `🔄 Fetching position info for ${positionCalls.length} positions...`
      );

      // Execute all calls in parallel (as shown in docs)
      const callResponses = await Promise.all(positionCalls);

      // Map RPC responses to our interface (following docs pattern exactly)
      const positionInfos = callResponses.map((position, index) => {
        const tokenId = Number(positionIds[index]);

        return {
          tokenId,
          nonce: Number(position.nonce),
          operator: position.operator,
          token0: position.token0,
          token1: position.token1,
          fee: Number(position.fee),
          tickLower: Number(position.tickLower),
          tickUpper: Number(position.tickUpper),
          liquidity: position.liquidity.toString(), // JSBI string as per docs
          feeGrowthInside0LastX128:
            position.feeGrowthInside0LastX128.toString(), // JSBI string
          feeGrowthInside1LastX128:
            position.feeGrowthInside1LastX128.toString(), // JSBI string
          tokensOwed0: position.tokensOwed0.toString(), // JSBI string
          tokensOwed1: position.tokensOwed1.toString(), // JSBI string
        } as PositionInfo;
      });

      console.debug(
        `✅ Successfully fetched ${positionInfos.length} position infos`
      );
      return positionInfos;
    } catch {
      return [];
    }
  }

  /**
   * Get single position info for specific token ID
   * Following official docs structure - wrapper for batch function
   */
  async getPositionInfo(tokenId: number): Promise<PositionInfo | null> {
    try {
      // Use batch function for consistency (efficiency for single call)
      const positions = await this.fetchPositionInfoBatch([BigInt(tokenId)]);
      return positions.length > 0 ? positions[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get enhanced position info with SDK instances for backward compatibility
   * This creates full Position and Pool instances from the basic PositionInfo
   */
  async getEnhancedPositionInfo(
    tokenId: number
  ): Promise<EnhancedPositionInfo | null> {
    try {
      // First get basic position info using docs pattern
      const basicPositionInfo = await this.getPositionInfo(tokenId);
      if (!basicPositionInfo) {
        return null;
      }

      // Create enhanced version with SDK instances for backward compatibility
      const token0Data: TokenData = {
        address: basicPositionInfo.token0,
        chainId: this.chainId,
        decimals: 0, // Will be fetched in createToken
        symbol: "TOKEN0",
        name: "Token 0",
        isNative: false,
      };

      const token1Data: TokenData = {
        address: basicPositionInfo.token1,
        chainId: this.chainId,
        decimals: 0, // Will be fetched in createToken
        symbol: "TOKEN1",
        name: "Token 1",
        isNative: false,
      };

      const token0 = await this.createToken(token0Data);
      const token1 = await this.createToken(token1Data);

      // Get pool using the token data with proper decimals
      const pool = await this.getPool(
        token0Data,
        token1Data,
        basicPositionInfo.fee
      );

      if (!pool) {
        console.debug(`Pool not found for tokenId ${tokenId}`);
        return null;
      }

      // Create Position instance using direct constructor
      const position = this.createPositionDirect(
        pool,
        basicPositionInfo.liquidity,
        basicPositionInfo.tickLower,
        basicPositionInfo.tickUpper
      );

      // Return enhanced position info with all SDK instances
      return {
        ...basicPositionInfo, // Include all basic info from docs pattern
        position,
        pool,
        token0Instance: token0,
        token1Instance: token1,
        liquidityAmount: CurrencyAmount.fromRawAmount(
          token0,
          position.liquidity
        ),
        amount0: CurrencyAmount.fromRawAmount(
          token0,
          position.amount0.quotient
        ),
        amount1: CurrencyAmount.fromRawAmount(
          token1,
          position.amount1.quotient
        ),
      };
    } catch {
      return null;
    }
  }

  /**
   * 4. ADDING & REMOVING LIQUIDITY - Following official docs
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/modifying-position
   */

  /**
   * Helper: fromReadableAmount - Convert human readable amount to token units
   * Following docs pattern for amount calculation
   */
  private fromReadableAmount(amount: string, decimals: number): JSBI {
    const amountFloat = parseFloat(amount);
    const amountBigInt = JSBI.BigInt(
      Math.floor(amountFloat * Math.pow(10, decimals))
    );
    return amountBigInt;
  }

  /**
   * Helper: constructPosition - Create Position from amounts
   * Following docs exact pattern for position construction
   */
  private constructPosition(
    pool: Pool,
    tickLower: number,
    tickUpper: number,
    amount0: JSBI,
    amount1: JSBI
  ): Position {
    return Position.fromAmounts({
      pool,
      tickLower: nearestUsableTick(tickLower, this.getTickSpacing(pool.fee)),
      tickUpper: nearestUsableTick(tickUpper, this.getTickSpacing(pool.fee)),
      amount0,
      amount1,
      useFullPrecision: true,
    });
  }

  /**
   * Adding liquidity to our position - Following official docs exactly
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/modifying-position
   */
  async addLiquidity(params: {
    tokenId: number;
    amount0: string; // Human readable amount (e.g., "1000")
    amount1: string; // Human readable amount (e.g., "1000")
    fractionToAdd?: number; // Multiplier (e.g., 0.5 = 50% increase), optional
    slippageTolerance: number;
    deadline: number;
  }): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer is required for adding liquidity");
    }

    try {
      console.debug("🔄 Adding liquidity to position...");

      // Get enhanced position info for SDK instances
      const positionInfo = await this.getEnhancedPositionInfo(params.tokenId);
      if (!positionInfo) {
        throw new Error("Position not found");
      }

      const { position } = positionInfo;

      // Calculate amounts using fromReadableAmount (following docs)
      const amount0Increased = this.fromReadableAmount(
        params.amount0,
        position.pool.token0.decimals
      );

      const amount1Increased = this.fromReadableAmount(
        params.amount1,
        position.pool.token1.decimals
      );

      // If fractionToAdd is provided, multiply by existing amounts (docs pattern)
      let finalAmount0 = amount0Increased;
      let finalAmount1 = amount1Increased;

      if (params.fractionToAdd !== undefined) {
        console.debug(
          `📊 Using fractionToAdd multiplier: ${params.fractionToAdd}`
        );

        const existingAmount0 = this.fromReadableAmount(
          params.amount0,
          position.pool.token0.decimals
        );
        const existingAmount1 = this.fromReadableAmount(
          params.amount1,
          position.pool.token1.decimals
        );

        finalAmount0 = JSBI.multiply(
          existingAmount0,
          JSBI.BigInt(Math.floor(params.fractionToAdd * 1000))
        );
        finalAmount0 = JSBI.divide(finalAmount0, JSBI.BigInt(1000));

        finalAmount1 = JSBI.multiply(
          existingAmount1,
          JSBI.BigInt(Math.floor(params.fractionToAdd * 1000))
        );
        finalAmount1 = JSBI.divide(finalAmount1, JSBI.BigInt(1000));
      }

      // Create position to increase (using constructPosition following docs)
      const positionToIncreaseBy = this.constructPosition(
        position.pool,
        position.tickLower,
        position.tickUpper,
        finalAmount0,
        finalAmount1
      );

      console.debug(`✅ Position constructed for increase`);

      // Create AddLiquidityOptions following docs exactly
      const addLiquidityOptions: AddLiquidityOptions = {
        deadline: params.deadline,
        slippageTolerance: new Percent(50, 10_000), // 0.50% as in docs
        tokenId: params.tokenId,
      };

      // Get call parameters (following docs pattern)
      const { calldata, value } = NonfungiblePositionManager.addCallParameters(
        positionToIncreaseBy,
        addLiquidityOptions
      );

      console.debug(`📤 Transaction calldata prepared for adding liquidity`);

      // Execute transaction (following docs pattern)
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

      const transaction = {
        data: calldata,
        to: addresses.POSITION_MANAGER,
        value: value,
        from: await this.signer.getAddress(),
        gasLimit: 100000, // FIXED: Lower gas for Arbitrum
      };

      const txResponse = await this.signer.sendTransaction(transaction);
      console.debug(`🔄 Add liquidity transaction sent: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      if (!receipt) {
        throw new Error("Transaction receipt not available");
      }

      console.debug(`✅ Liquidity added successfully! Hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Removing liquidity from our position - Following official docs exactly
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/modifying-position
   */
  async removeLiquidity(params: {
    tokenId: number;
    fractionToRemove: number; // 0.0 - 1.0 (e.g., 0.5 = remove 50%)
    slippageTolerance: number;
    deadline: number;
    collectFees?: boolean; // Whether to collect fees during removal
  }): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer is required for removing liquidity");
    }

    try {
      console.debug("🔄 Removing liquidity from position...");

      // Get basic position info (we need raw values from contract)
      const basicPositionInfo = await this.getPositionInfo(params.tokenId);
      if (!basicPositionInfo) {
        throw new Error("Position not found");
      }

      // Create tokens for constructing current position (following docs)
      const token0Data: TokenData = {
        address: basicPositionInfo.token0,
        chainId: this.chainId,
        decimals: 0,
        symbol: "TOKEN0",
        name: "Token 0",
        isNative: false,
      };

      const token1Data: TokenData = {
        address: basicPositionInfo.token1,
        chainId: this.chainId,
        decimals: 0,
        symbol: "TOKEN1",
        name: "Token 1",
        isNative: false,
      };

      const token0 = await this.createToken(token0Data);
      const token1 = await this.createToken(token1Data);

      // Get pool
      const pool = await this.getPool(
        token0Data,
        token1Data,
        basicPositionInfo.fee
      );
      if (!pool) {
        throw new Error("Pool not found");
      }

      // Calculate amounts to remove using fractionToRemove (following docs)
      const amount0 = this.fromReadableAmount("1000", token0.decimals); // Base amount
      const amount1 = this.fromReadableAmount("1000", token1.decimals); // Base amount

      const amount0ToRemove = JSBI.multiply(
        amount0,
        JSBI.BigInt(Math.floor(params.fractionToRemove * 1000))
      );
      const finalAmount0 = JSBI.divide(amount0ToRemove, JSBI.BigInt(1000));

      const amount1ToRemove = JSBI.multiply(
        amount1,
        JSBI.BigInt(Math.floor(params.fractionToRemove * 1000))
      );
      const finalAmount1 = JSBI.divide(amount1ToRemove, JSBI.BigInt(1000));

      console.debug(`📊 Using fractionToRemove: ${params.fractionToRemove}`);

      // Create position identical to the one we minted (following docs)
      const currentPosition = this.constructPosition(
        pool,
        basicPositionInfo.tickLower,
        basicPositionInfo.tickUpper,
        finalAmount0,
        finalAmount1
      );

      console.debug(`✅ Current position constructed for removal`);

      // Create collectOptions (following docs pattern)
      const collectOptions = params.collectFees
        ? {
            expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(token0, 0),
            expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(token1, 0),
            recipient: await this.signer.getAddress(),
          }
        : {
            expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(token0, 0),
            expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(token1, 0),
            recipient: await this.signer.getAddress(),
          };

      // Create RemoveLiquidityOptions following docs exactly
      const removeLiquidityOptions: RemoveLiquidityOptions = {
        deadline: params.deadline,
        slippageTolerance: new Percent(50, 10_000), // 0.50% as in docs
        tokenId: params.tokenId,
        liquidityPercentage: new Percent(
          Math.floor(params.fractionToRemove * 100),
          100
        ), // Convert fraction to Percent
        collectOptions,
      };

      console.debug(`📋 RemoveLiquidityOptions configured`);

      // Get call parameters (following docs pattern)
      const { calldata, value } =
        NonfungiblePositionManager.removeCallParameters(
          currentPosition,
          removeLiquidityOptions
        );

      console.debug(`📤 Transaction calldata prepared for removing liquidity`);

      // Execute transaction (following docs pattern)
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

      const transaction = {
        data: calldata,
        to: addresses.POSITION_MANAGER,
        value: value,
        from: await this.signer.getAddress(),
        gasLimit: 100000, // FIXED: Lower gas for Arbitrum
      };

      const txResponse = await this.signer.sendTransaction(transaction);
      console.debug(`🔄 Remove liquidity transaction sent: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      if (!receipt) {
        throw new Error("Transaction receipt not available");
      }

      console.debug(`✅ Liquidity removed successfully! Hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 5. COLLECTING FEES - Following official docs exactly
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/collecting-fees
   */

  /**
   * Setting up our fee collection - Following docs pattern
   * Fetch position to get fees owed, construct CollectOptions
   */
  async collectFees(params: {
    tokenId: number;
    recipient?: string;
  }): Promise<CollectResult> {
    if (!this.signer) {
      throw new Error("Signer is required for collecting fees");
    }

    try {
      console.debug("🔄 Setting up fee collection...");

      // Step 1: Fetch position from NonfungiblePositionManager Contract (following docs)
      const nfpmContract = this.createNFTPositionManagerContract();
      const position = await nfpmContract.positions(params.tokenId);

      console.debug(
        `📊 Position fetched, tokensOwed0: ${position.tokensOwed0}, tokensOwed1: ${position.tokensOwed1}`
      );

      // Get token instances for CurrencyAmount creation
      const token0Data: TokenData = {
        address: position.token0,
        chainId: this.chainId,
        decimals: 0, // Will be fetched from contract
        symbol: "TOKEN0",
        name: "Token 0",
        isNative: false,
      };

      const token1Data: TokenData = {
        address: position.token1,
        chainId: this.chainId,
        decimals: 0, // Will be fetched from contract
        symbol: "TOKEN1",
        name: "Token 1",
        isNative: false,
      };

      const token0 = await this.createToken(token0Data);
      const token1 = await this.createToken(token1Data);

      const recipient = params.recipient || (await this.signer.getAddress());

      console.debug(`💰 Recipient address: ${recipient}`);

      // Step 2: Construct CollectOptions (following docs exactly)
      const collectOptions: CollectOptions = {
        tokenId: params.tokenId,
        expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
          token0,
          JSBI.BigInt(position.tokensOwed0.toString())
        ),
        expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
          token1,
          JSBI.BigInt(position.tokensOwed1.toString())
        ),
        recipient: recipient,
      };

      console.debug("✅ CollectOptions constructed with fees owed");

      // Step 3: Get call parameters for collecting fees (following docs)
      const { calldata, value } =
        NonfungiblePositionManager.collectCallParameters(collectOptions);

      console.debug("📤 Transaction calldata prepared for fee collection");

      // Step 4: Execute transaction (following docs pattern)
      const addresses =
        UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];

      const transaction = {
        data: calldata,
        to: addresses.POSITION_MANAGER,
        value: value,
        from: await this.signer.getAddress(),
        gasLimit: 80000, // FIXED: Lower gas for Arbitrum
      };

      const txResponse = await this.signer.sendTransaction(transaction);
      console.debug(`🔄 Fee collection transaction sent: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      if (!receipt) {
        throw new Error("Transaction receipt not available");
      }

      console.debug(`✅ Fees collected successfully! Hash: ${receipt.hash}`);

      // Parse collect result from transaction logs
      const result = this.parseCollectResult(receipt);

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 6. SWAPPING AND ADDING LIQUIDITY - Following official docs exactly
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/swapping-and-adding-liquidity
   */

  /**
   * Setup a router instance - Following docs step 1
   */
  // private async setupRouterInstance(): Promise<any> {
  //   // Note: This would require @uniswap/smart-order-router package
  //   // For now, we'll implement a basic version following the docs pattern
  //   console.debug("🔄 Setting up router instance...");

  //   // In production, this would be:
  //   // import { AlphaRouter } from '@uniswap/smart-order-router'
  //   // const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  //   // const router = new AlphaRouter({ chainId: 1, provider })

  //   throw new Error(
  //     "AlphaRouter not implemented - requires @uniswap/smart-order-router package"
  //   );
  // }

  /**
   * Get token transfer approval for SwapRouter - Following docs
   */
  private async getSwapRouterTokenApproval(
    tokenAddress: string,
    amount: string
  ): Promise<void> {
    console.debug("🔐 Getting token approval for SwapRouter...");

    if (!this.signer) {
      throw new Error("Signer is required for token approval");
    }

    const addresses =
      UNISWAP_V3_ADDRESSES[this.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
    if (!addresses || !addresses.SWAP_ROUTER) {
      throw new Error(`SwapRouter not available for chain: ${this.chainId}`);
    }

    // Create token contract
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
      ],
      this.signer
    );

    const userAddress = await this.signer.getAddress();
    const swapRouterAddress = addresses.SWAP_ROUTER;

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(
      userAddress,
      swapRouterAddress
    );
    const requiredAmount = BigInt(amount);

    if (currentAllowance < requiredAmount) {
      console.debug(`📝 Approving ${amount} tokens for SwapRouter...`);
      const approveTx = await tokenContract.approve(
        swapRouterAddress,
        requiredAmount
      );
      await approveTx.wait();
      console.debug("✅ SwapRouter approval completed");
    } else {
      console.debug("✅ SwapRouter already has sufficient allowance");
    }
  }

  /**
   * Swapping and Adding Liquidity - Following official docs exactly
   * https://docs.uniswap.org/sdk/v3/guides/liquidity/swapping-and-adding-liquidity
   */
  async swapAndAddLiquidity(params: {
    inputToken: TokenData;
    outputTokenA: TokenData;
    outputTokenB: TokenData;
    fee: number;
    inputAmount: string;
    tickLower?: number;
    tickUpper?: number;
    slippageTolerance: number;
    deadline: number;
    positionId?: number; // For adding to existing position
  }): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer is required for swap and add liquidity");
    }

    try {
      console.debug("🔄 Starting swap and add liquidity process...");

      // Step 1: Setup router instance and approve tokens (following docs)

      // Get token transfer approval for SwapRouter (following docs)
      await this.getSwapRouterTokenApproval(
        params.inputToken.address,
        params.inputAmount
      );

      console.debug("📋 Token approval completed for SwapRouter");

      // Step 2: Configuring our ratio calculation (following docs exactly)

      // Create token instances
      const inputToken = await this.createToken(params.inputToken);
      const tokenA = await this.createToken(params.outputTokenA);
      const tokenB = await this.createToken(params.outputTokenB);

      // Create currency amounts (following docs)
      // const inputCurrencyAmount = CurrencyAmount.fromRawAmount(
      //   inputToken,
      //   this.fromReadableAmount(params.inputAmount, inputToken.decimals)
      // );

      console.debug(
        `💰 Input amount: ${params.inputAmount} ${inputToken.symbol}`
      );

      // Get pool for the token pair
      const pool = await this.getPool(
        params.outputTokenA,
        params.outputTokenB,
        params.fee
      );
      if (!pool) {
        throw new Error("Pool does not exist for the given token pair");
      }

      // Create placeholder position with liquidity = 1 (following docs exactly)
      const tickLower =
        params.tickLower ||
        this.calculateTicks(pool.tickCurrent, params.fee, 1.2).tickLower;
      const tickUpper =
        params.tickUpper ||
        this.calculateTicks(pool.tickCurrent, params.fee, 1.2).tickUpper;

      throw new Error(
        "Full swap-and-add implementation requires @uniswap/smart-order-router package. Please install and configure AlphaRouter."
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private parseMintResult(receipt: any): MintResult {
    // Parse mint result from transaction logs
    // Following Uniswap V3 position manager events

    try {
      // IncreaseLiquidity event signature
      const increaseLiquidityEventSignature =
        "IncreaseLiquidity(uint256,uint128,uint256,uint256)";
      const increaseLiquidityTopic = ethers.id(increaseLiquidityEventSignature);

      // Transfer event signature for NFT
      const transferEventSignature = "Transfer(address,address,uint256)";
      const transferTopic = ethers.id(transferEventSignature);

      let tokenId = 0;
      let liquidity = "0";
      let amount0 = "0";
      let amount1 = "0";

      // Parse logs to find relevant events
      for (const log of receipt.logs) {
        try {
          // Parse Transfer event to get tokenId (NFT minting)
          if (log.topics[0] === transferTopic) {
            // Transfer from zero address indicates minting
            const fromAddress = ethers.getAddress(
              "0x" + log.topics[1].slice(26)
            );
            if (fromAddress === ethers.ZeroAddress) {
              tokenId = parseInt(log.topics[3], 16);
              console.debug(`📝 Found NFT mint - Token ID: ${tokenId}`);
            }
          }

          // Parse IncreaseLiquidity event
          if (log.topics[0] === increaseLiquidityTopic) {
            const parsedTokenId = parseInt(log.topics[1], 16);
            const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
              ["uint128", "uint256", "uint256"],
              log.data
            );

            if (parsedTokenId === tokenId || tokenId === 0) {
              tokenId = parsedTokenId;
              liquidity = decodedData[0].toString();
              amount0 = decodedData[1].toString();
              amount1 = decodedData[2].toString();
              console.debug(
                `📝 Found IncreaseLiquidity - TokenID: ${tokenId}, Liquidity: ${liquidity}`
              );
            }
          }
        } catch (logError: any) {
          console.debug(
            "parseMintResult encountered an error (non-fatal):",
            logError.message
          );
          // Continue parsing other logs if one fails
          continue;
        }
      }

      const result: MintResult = {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString() || "0",
        tokenId,
        liquidity,
        amount0,
        amount1,
      };

      return result;
    } catch {
      // Return basic result if parsing fails
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString() || "0",
        tokenId: 0,
        liquidity: "0",
        amount0: "0",
        amount1: "0",
      };
    }
  }

  private parseCollectResult(receipt: any): CollectResult {
    // Parse collect result from transaction logs
    // Following Uniswap V3 position manager Collect event

    try {
      // Collect event signature: Collect(uint256,address,uint256,uint256)
      const collectEventSignature = "Collect(uint256,address,uint256,uint256)";
      const collectTopic = ethers.id(collectEventSignature);

      let amount0 = "0";
      let amount1 = "0";

      // Find the Collect event in the logs
      for (const log of receipt.logs) {
        if (log.topics && log.topics[0] === collectTopic) {
          const decodedLog = ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256", "address", "uint256", "uint256"],
            log.data
          );

          // decodedLog[2] is amount0, decodedLog[3] is amount1
          amount0 = decodedLog[2].toString();
          amount1 = decodedLog[3].toString();

          console.debug(
            `📊 Collect event parsed: amount0=${amount0}, amount1=${amount1}`
          );
          break;
        }
      }

      const result: CollectResult = {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString() || "0",
        amount0,
        amount1,
      };

      return result;
    } catch (error: any) {
      console.debug(
        "parseCollectResult encountered an error (non-fatal):",
        error.message
      );
      // Return basic result if parsing fails
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString() || "0",
        amount0: "0",
        amount1: "0",
      };
    }
  }

  /**
   * Helper method to get optimized gas prices based on chain
   */
  private getOptimizedGasPrices() {
    if (this.chainId === 42161) {
      // Arbitrum - very low gas prices
      return {
        maxFeePerGas: "0.1 gwei",
        maxPriorityFeePerGas: "0.05 gwei",
      };
    } else if (this.chainId === 56) {
      // BSC - moderate gas prices
      return {
        maxFeePerGas: "5 gwei",
        maxPriorityFeePerGas: "2 gwei",
      };
    } else {
      // Ethereum mainnet - default
      return "default";
    }
  }

  /**
   * Helper method to get optimized gas parameters for transactions
   */
  private getOptimizedGasParams() {
    if (this.chainId === 42161) {
      // Arbitrum optimization
      return {
        maxFeePerGas: ethers.parseUnits("0.1", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("0.05", "gwei"),
      };
    } else if (this.chainId === 56) {
      // BSC optimization
      return {
        maxFeePerGas: ethers.parseUnits("5", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
      };
    } else {
      // Ethereum mainnet - let wallet decide
      return {};
    }
  }

  /**
   * Helper method to estimate transaction cost
   */
  private getEstimatedCost(): string {
    if (this.chainId === 42161) {
      return "< $0.50"; // Arbitrum is very cheap
    } else if (this.chainId === 56) {
      return "< $2.00"; // BSC is moderate
    } else {
      return "varies"; // Ethereum mainnet varies greatly
    }
  }
}
