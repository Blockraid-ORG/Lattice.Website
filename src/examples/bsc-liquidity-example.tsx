"use client";

/**
 * BSC Liquidity Pool Example Component
 *
 * Contoh lengkap untuk membuat liquidity pool di BSC menggunakan Uniswap V3 SDK
 *
 * Features:
 * - Create KS/USDC pool
 * - Create KS/BNB pool
 * - Auto network switching ke BSC
 * - Gas optimization untuk BSC
 * - Real-time transaction monitoring
 */

import { useState } from "react";
import { useUniswapV3SDK } from "@/hooks/useUniswapV3SDK";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { TokenData } from "@/types/uniswap";

export function BSCLiquidityExample() {
  const [isCreating, setIsCreating] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [nftTokenId, setNftTokenId] = useState<number | null>(null);

  const { connect, isConnected } = useWeb3AuthConnect();
  const { isReady, isConnecting, error, mintPosition } = useUniswapV3SDK(56); // Chain ID 56 = BSC

  // Get user address
  const getUserAddress = async (): Promise<string> => {
    const provider = await connect();
    if (!provider) throw new Error("No provider");

    const result = await provider.request({ method: "eth_accounts" });
    const accounts = Array.isArray(result) ? (result as string[]) : [];

    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    return accounts[0];
  };

  /**
   * EXAMPLE 1: Create KS/USDC Pool on BSC
   *
   * Token Pair: KS (Kostan Sini) / USDC
   * Initial Price: 1 USDC = 2500 KS
   * Fee Tier: 0.3% (most common)
   */
  const handleCreateKSUSDCPool = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Creating KS/USDC liquidity pool on BSC...");

      const userAddress = await getUserAddress();

      // Token A: USDC on BSC (Binance-Peg USD Coin)
      const usdcBSC: TokenData = {
        chainId: 56,
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        decimals: 18, // IMPORTANT: BSC USDC has 18 decimals (not 6!)
        symbol: "USDC",
        name: "Binance-Peg USD Coin",
        isNative: false,
      };

      // Token B: KS Token (Your project token)
      const ksBSC: TokenData = {
        chainId: 56,
        address: "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc",
        decimals: 18,
        symbol: "KS",
        name: "Kostan Sini",
        isNative: false,
      };

      // Create position with initial liquidity
      // Amount: 10 USDC + 25,000 KS (rate: 1 USDC = 2500 KS)
      const result = await mintPosition({
        tokenA: usdcBSC,
        tokenB: ksBSC,
        fee: 3000, // 0.3% fee tier (most common for standard pairs)
        amount0: "10", // 10 USDC
        amount1: "25000", // 25,000 KS
        recipient: userAddress,
        deadline: Math.floor(Date.now() / 1000) + 20 * 60, // 20 minutes deadline
        slippageTolerance: 0.5, // 0.5% slippage tolerance
      });

      setTransactionHash(result.hash);
      setNftTokenId(result.tokenId);

      toast.success(`🎉 KS/USDC Pool Created Successfully!`, {
        description: `NFT Token ID: ${result.tokenId}`,
        action: {
          label: "View on BSCScan",
          onClick: () => {
            window.open(`https://bscscan.com/tx/${result.hash}`, "_blank");
          },
        },
        duration: 10000,
      });
    } catch (error: any) {
      console.error("Error creating KS/USDC pool:", error);
      toast.error(`Failed to create pool: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * EXAMPLE 2: Create KS/BNB Pool on BSC
   *
   * Token Pair: KS (Kostan Sini) / BNB
   * Initial Price: 1 BNB = 500 KS
   * Fee Tier: 0.3%
   */
  const handleCreateKSBNBPool = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Creating KS/BNB liquidity pool on BSC...");

      const userAddress = await getUserAddress();

      // Token A: BNB (Native token, will be wrapped to WBNB automatically)
      const bnbNative: TokenData = {
        chainId: 56,
        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB address
        decimals: 18,
        symbol: "BNB",
        name: "Binance Coin",
        isNative: true, // SDK will handle wrapping to WBNB
      };

      // Token B: KS Token
      const ksBSC: TokenData = {
        chainId: 56,
        address: "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc",
        decimals: 18,
        symbol: "KS",
        name: "Kostan Sini",
        isNative: false,
      };

      // Create position with initial liquidity
      // Amount: 1 BNB + 500 KS (rate: 1 BNB = 500 KS)
      const result = await mintPosition({
        tokenA: bnbNative,
        tokenB: ksBSC,
        fee: 3000, // 0.3% fee tier
        amount0: "1", // 1 BNB
        amount1: "500", // 500 KS
        recipient: userAddress,
        deadline: Math.floor(Date.now() / 1000) + 20 * 60,
        slippageTolerance: 1.0, // Higher slippage for BNB pairs (more volatile)
      });

      setTransactionHash(result.hash);
      setNftTokenId(result.tokenId);

      toast.success(`🎉 KS/BNB Pool Created Successfully!`, {
        description: `NFT Token ID: ${result.tokenId}`,
        action: {
          label: "View on BSCScan",
          onClick: () => {
            window.open(`https://bscscan.com/tx/${result.hash}`, "_blank");
          },
        },
        duration: 10000,
      });
    } catch (error: any) {
      console.error("Error creating KS/BNB pool:", error);
      toast.error(`Failed to create pool: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * EXAMPLE 3: Create Pool with Custom Price Range
   *
   * Instead of full range, use custom price range for concentrated liquidity
   */
  const handleCreatePoolWithCustomRange = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Creating pool with custom price range...");

      const userAddress = await getUserAddress();

      const usdcBSC: TokenData = {
        chainId: 56,
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        decimals: 18,
        symbol: "USDC",
        name: "Binance-Peg USD Coin",
        isNative: false,
      };

      const ksBSC: TokenData = {
        chainId: 56,
        address: "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc",
        decimals: 18,
        symbol: "KS",
        name: "Kostan Sini",
        isNative: false,
      };

      // Custom tick range for concentrated liquidity
      // Example: Price range 2000-3000 KS per USDC (current price: 2500)
      const result = await mintPosition({
        tokenA: usdcBSC,
        tokenB: ksBSC,
        fee: 3000,
        amount0: "5", // 5 USDC
        amount1: "12500", // 12,500 KS
        tickLower: -10000, // Custom lower tick
        tickUpper: 10000, // Custom upper tick
        recipient: userAddress,
        deadline: Math.floor(Date.now() / 1000) + 20 * 60,
        slippageTolerance: 0.5,
      });

      setTransactionHash(result.hash);
      setNftTokenId(result.tokenId);

      toast.success(
        `Pool with custom range created! NFT ID: ${result.tokenId}`
      );
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            🟡 BSC Liquidity Pool Examples
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Contoh membuat liquidity pool di Binance Smart Chain menggunakan
            Uniswap V3 SDK
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Wallet Status:</span>
              <span
                className={`text-sm ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {isConnected ? "✅ Connected" : "❌ Not Connected"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SDK Status:</span>
              <span
                className={`text-sm ${
                  isReady ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {isConnecting
                  ? "⏳ Connecting..."
                  : isReady
                  ? "✅ Ready"
                  : "❌ Not Ready"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <span className="text-sm font-mono">
                BSC Mainnet (Chain ID: 56)
              </span>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {error}
              </div>
            )}
          </div>

          {/* Example 1: KS/USDC Pool */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">
              Example 1: Create KS/USDC Pool
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                • Token Pair: <strong>KS / USDC</strong>
              </p>
              <p>
                • Initial Amount: <strong>10 USDC + 25,000 KS</strong>
              </p>
              <p>
                • Initial Price: <strong>1 USDC = 2,500 KS</strong>
              </p>
              <p>
                • Fee Tier: <strong>0.3%</strong>
              </p>
              <p>
                • Range: <strong>Full Range</strong> (provides liquidity at all
                prices)
              </p>
            </div>
            <Button
              onClick={handleCreateKSUSDCPool}
              disabled={!isConnected || !isReady || isCreating}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create KS/USDC Pool"}
            </Button>
          </div>

          {/* Example 2: KS/BNB Pool */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">
              Example 2: Create KS/BNB Pool
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                • Token Pair: <strong>KS / BNB</strong>
              </p>
              <p>
                • Initial Amount: <strong>1 BNB + 500 KS</strong>
              </p>
              <p>
                • Initial Price: <strong>1 BNB = 500 KS</strong>
              </p>
              <p>
                • Fee Tier: <strong>0.3%</strong>
              </p>
              <p>
                • Range: <strong>Full Range</strong>
              </p>
              <p className="text-yellow-600">
                ⚠️ Requires BNB in wallet for both liquidity & gas
              </p>
            </div>
            <Button
              onClick={handleCreateKSBNBPool}
              disabled={!isConnected || !isReady || isCreating}
              className="w-full"
              variant="secondary"
            >
              {isCreating ? "Creating..." : "Create KS/BNB Pool"}
            </Button>
          </div>

          {/* Example 3: Custom Range */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">
              Example 3: Custom Price Range
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                • Token Pair: <strong>KS / USDC</strong>
              </p>
              <p>
                • Initial Amount: <strong>5 USDC + 12,500 KS</strong>
              </p>
              <p>
                • Price Range: <strong>Custom (Concentrated Liquidity)</strong>
              </p>
              <p>
                • Fee Tier: <strong>0.3%</strong>
              </p>
              <p className="text-blue-600">
                💡 Higher capital efficiency with custom range
              </p>
            </div>
            <Button
              onClick={handleCreatePoolWithCustomRange}
              disabled={!isConnected || !isReady || isCreating}
              className="w-full"
              variant="outline"
            >
              {isCreating ? "Creating..." : "Create with Custom Range"}
            </Button>
          </div>

          {/* Result Section */}
          {transactionHash && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <h4 className="font-semibold text-green-800">
                ✅ Transaction Success!
              </h4>
              {nftTokenId && (
                <p className="text-sm text-green-700">
                  NFT Position ID: <strong>{nftTokenId}</strong>
                </p>
              )}
              <p className="text-sm text-green-700 break-all">
                Transaction Hash:{" "}
                <code className="bg-white px-2 py-1 rounded">
                  {transactionHash}
                </code>
              </p>
              <Button
                variant="link"
                onClick={() =>
                  window.open(
                    `https://bscscan.com/tx/${transactionHash}`,
                    "_blank"
                  )
                }
                className="text-green-700 p-0"
              >
                View on BSCScan →
              </Button>
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <h4 className="font-semibold text-blue-800">ℹ️ Important Notes</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>
                Ensure you have enough BNB for gas fees (~0.01 BNB recommended)
              </li>
              <li>
                USDC on BSC has <strong>18 decimals</strong> (not 6 like
                Ethereum)
              </li>
              <li>Transactions on BSC are very cheap (usually &lt; $1)</li>
              <li>Pool creation will auto-switch network to BSC if needed</li>
              <li>
                You will receive an NFT representing your liquidity position
              </li>
            </ul>
          </div>

          {/* Gas Cost Info */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💰 <strong>Estimated Gas Cost on BSC:</strong> Pool creation +
              position minting typically costs less than $1 USD
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

