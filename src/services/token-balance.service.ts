"use client";

import { BrowserProvider, Contract, ethers } from "ethers";
import BigNumber from "bignumber.js";

// ERC20 ABI untuk membaca balance dan total supply
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

interface TokenInfo {
  symbol: string;
  name?: string;
  decimals: number;
  balance: BigNumber;
  totalSupply?: BigNumber;
  isNative: boolean;
}

export class TokenBalanceService {
  private static provider: BrowserProvider | null = null;
  private static walletAddress: string | null = null;

  /**
   * Initialize service dengan wallet provider
   */
  static async initialize(walletClient: any, address: string) {
    try {
      this.provider = new BrowserProvider(walletClient);
      this.walletAddress = address;
      return true;
    } catch (error) {
      console.error("❌ Error initializing TokenBalanceService:", error);
      return false;
    }
  }

  /**
   * Mendapatkan balance untuk native token (ETH, BNB, MATIC, dll)
   */
  static async getNativeTokenBalance(): Promise<BigNumber> {
    if (!this.provider || !this.walletAddress) {
      throw new Error("Service not initialized");
    }

    try {
      console.log("🔍 Getting native balance for wallet:", this.walletAddress);

      const balanceWei = await this.provider.getBalance(this.walletAddress);
      const balanceEther = ethers.formatEther(balanceWei);
      const balanceBN = new BigNumber(balanceEther);

      console.log("✅ Native balance fetched successfully:", {
        wallet: this.walletAddress,
        balanceWei: balanceWei.toString(),
        balanceEther: balanceEther,
        balanceBN: balanceBN.toString(),
        formatted: balanceBN.toFormat(),
      });

      return balanceBN;
    } catch (error) {
      console.error("❌ Error getting native balance:", error);
      return new BigNumber(0);
    }
  }

  /**
   * Validate if address is a valid contract
   */
  static async isValidContract(address: string): Promise<boolean> {
    if (!this.provider) return false;

    try {
      const code = await this.provider.getCode(address);
      return code !== "0x";
    } catch (error) {
      console.warn(`⚠️ Cannot check contract code for ${address}:`, error);
      return false;
    }
  }

  /**
   * Mendapatkan balance untuk ERC20 token
   */
  static async getTokenBalance(
    tokenAddress: string,
    useWalletBalance: boolean = true
  ): Promise<TokenInfo> {
    if (!this.provider || !this.walletAddress) {
      throw new Error("Service not initialized");
    }

    // Validate address format
    if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.warn(`⚠️ Invalid address format: ${tokenAddress}`);
      return {
        symbol: "INVALID",
        decimals: 18,
        balance: new BigNumber(0),
        totalSupply: new BigNumber(0),
        isNative: false,
      };
    }

    // Special validation for expected BU token
    if (
      tokenAddress.toLowerCase() ===
      "0xc518fc545c14fc990f269f8f9be79d7fc471d13f"
    ) {
      console.log(
        "🎯 Processing BU project token with expected contract address"
      );
    }

    // Check if it's a valid contract
    const isValid = await this.isValidContract(tokenAddress);
    if (!isValid) {
      console.warn(`⚠️ Address is not a valid contract: ${tokenAddress}`);
      return {
        symbol: "NO_CONTRACT",
        decimals: 18,
        balance: new BigNumber(0),
        totalSupply: new BigNumber(0),
        isNative: false,
      };
    }

    try {
      const tokenContract = new Contract(
        tokenAddress,
        ERC20_ABI,
        this.provider
      );

      // Test contract dengan timeout
      const contractCallPromise = Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
      ]);

      // Add timeout untuk prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Contract call timeout")), 10000)
      );

      const [symbol, decimals, totalSupplyRaw] = (await Promise.race([
        contractCallPromise,
        timeoutPromise,
      ])) as [string, number, bigint];

      console.log(
        `✅ Successfully got token info for ${symbol} (${tokenAddress})`
      );

      // Format total supply
      const totalSupply = new BigNumber(
        ethers.formatUnits(totalSupplyRaw, decimals)
      );

      let balance = new BigNumber(0);

      if (useWalletBalance) {
        // Ambil balance dari wallet
        const balanceRaw = await tokenContract.balanceOf(this.walletAddress);
        balance = new BigNumber(ethers.formatUnits(balanceRaw, decimals));
        console.log(`👛 Wallet balance for ${symbol}: ${balance.toString()}`);
      } else {
        // Untuk project token, gunakan total supply sebagai balance
        balance = totalSupply;
        console.log(
          `📊 Using total supply as balance for project token ${symbol}:`,
          {
            contractAddress: tokenAddress,
            totalSupplyRaw: totalSupplyRaw.toString(),
            decimals,
            totalSupply: totalSupply.toString(),
            balance: balance.toString(),
            formatted: this.formatBalance(balance),
            expected: "Should be 10,000 for BU token",
          }
        );
      }

      return {
        symbol,
        decimals,
        balance,
        totalSupply,
        isNative: false,
      };
    } catch (error: any) {
      console.error(`❌ Error getting token info for ${tokenAddress}:`, error);

      // Determine error type untuk better user feedback
      let errorSymbol = "ERROR";
      if (error.message?.includes("could not decode result")) {
        errorSymbol = "INVALID_ERC20";
      } else if (error.message?.includes("timeout")) {
        errorSymbol = "TIMEOUT";
      } else if (error.code === "NETWORK_ERROR") {
        errorSymbol = "NETWORK_ERROR";
      }

      return {
        symbol: errorSymbol,
        decimals: 18,
        balance: new BigNumber(0),
        totalSupply: new BigNumber(0),
        isNative: false,
      };
    }
  }

  /**
   * Mendapatkan balance untuk multiple tokens
   */
  static async getMultipleTokenBalances(
    tokens: Array<{
      symbol: string;
      address?: string;
      isNative?: boolean;
      useWalletBalance?: boolean;
    }>
  ): Promise<Record<string, TokenInfo>> {
    if (!this.provider || !this.walletAddress) {
      throw new Error("Service not initialized");
    }

    const results: Record<string, TokenInfo> = {};

    await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          if (token.isNative) {
            // Native token (BNB, ETH, MATIC, dll)
            console.log(
              `🪙 Fetching native token balance for ${token.symbol}...`
            );
            const balance = await this.getNativeTokenBalance();

            results[token.symbol] = {
              symbol: token.symbol,
              decimals: 18,
              balance,
              isNative: true,
            };

            console.log(
              `✅ Native ${
                token.symbol
              } balance: ${balance.toString()} (formatted: ${this.formatBalance(
                balance
              )})`
            );
          } else if (token.address) {
            // ERC20 token
            const tokenInfo = await this.getTokenBalance(
              token.address,
              token.useWalletBalance ?? true
            );
            results[token.symbol] = tokenInfo;
          } else {
            // Fallback untuk token tanpa address
            results[token.symbol] = {
              symbol: token.symbol,
              decimals: 18,
              balance: new BigNumber(0),
              isNative: false,
            };
          }
        } catch (error) {
          console.error(`❌ Error getting balance for ${token.symbol}:`, error);
          results[token.symbol] = {
            symbol: token.symbol,
            decimals: 18,
            balance: new BigNumber(0),
            isNative: false,
          };
        }
      })
    );

    return results;
  }

  /**
   * Helper untuk format balance dengan decimals yang tepat
   */
  static formatBalance(balance: BigNumber, decimals?: number): string {
    if (balance.isZero()) return "0";

    // Special formatting for exact values like 10,000
    if (balance.isInteger() && balance.gte(1)) {
      return balance.toFormat(); // Shows 10,000 dengan koma
    }

    if (balance.lt(0.01)) {
      // Untuk angka kecil, tampilkan lebih banyak decimal places
      return balance.toFixed();
    } else if (balance.lt(1000)) {
      // Untuk angka sedang
      return balance.decimalPlaces(6).toFixed();
    } else {
      // Untuk angka besar, gunakan format dengan koma
      return balance.decimalPlaces(2).toFormat();
    }
  }

  /**
   * Helper untuk memeriksa apakah service sudah diinisialisasi
   */
  static isInitialized(): boolean {
    return !!(this.provider && this.walletAddress);
  }

  /**
   * Reset service
   */
  static reset() {
    this.provider = null;
    this.walletAddress = null;
  }
}
