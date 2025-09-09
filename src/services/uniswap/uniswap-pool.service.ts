import { ethers } from "ethers";
import { UNISWAP_V3_ADDRESSES, getRPCUrl } from "@/data/constants";
import { RPCProviderService } from "@/services/rpc-provider.service";

const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

const POOL_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
  "function liquidity() external view returns (uint128)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];

export class UniswapPoolService {
  /**
   * Cek apakah pool sudah ada
   */
  static async checkPoolExists(
    tokenA: string,
    tokenB: string,
    fee: number,
    chainId: number
  ): Promise<string | null> {
    try {
      const addresses =
        UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
      if (!addresses) throw new Error(`Unsupported chain: ${chainId}`);

      // 🔧 Menggunakan RPC dinamis dari Terravest API
      const rpcUrl = await getRPCUrl(chainId);
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const factory = new ethers.Contract(
        addresses.FACTORY,
        FACTORY_ABI,
        provider
      );

      // Sort tokens (token0 < token1)
      const [token0, token1] =
        tokenA.toLowerCase() < tokenB.toLowerCase()
          ? [tokenA, tokenB]
          : [tokenB, tokenA];

      const poolAddress = await factory.getPool(token0, token1, fee);

      return poolAddress === ethers.ZeroAddress ? null : poolAddress;
    } catch (error) {
      throw new Error(`Failed to check pool: ${(error as Error).message}`);
    }
  }

  /**
   * Dapatkan informasi detail pool
   */
  static async getPoolInfo(poolAddress: string, chainId: number) {
    try {
      // 🔧 Menggunakan RPC dinamis dari Terravest API
      const rpcUrl = await getRPCUrl(chainId);
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);

      const [token0, token1, fee, liquidity, slot0] = await Promise.all([
        pool.token0(),
        pool.token1(),
        pool.fee(),
        pool.liquidity(),
        pool.slot0(),
      ]);

      return {
        token0,
        token1,
        fee: Number(fee),
        liquidity: liquidity.toString(),
        sqrtPriceX96: slot0.sqrtPriceX96.toString(),
        tick: Number(slot0.tick),
      };
    } catch (error) {
      throw new Error(`Failed to get pool info: ${(error as Error).message}`);
    }
  }

  /**
   * Helper function untuk sorting token addresses
   */
  static sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
  }

  /**
   * Validasi apakah chain ID didukung
   */
  static isSupportedChain(chainId: number): boolean {
    return chainId in UNISWAP_V3_ADDRESSES;
  }

  /**
   * Dapatkan RPC URL berdasarkan chain ID (async method using Terravest API)
   */
  static async getRpcUrl(chainId: number): Promise<string> {
    try {
      // 🔧 Menggunakan RPC dinamis dari Terravest API
      return await getRPCUrl(chainId);
    } catch (error) {
      console.error(`Failed to get RPC URL for chain ${chainId}:`, error);

      // Fallback jika API gagal
      const fallbackRpcUrls: { [key: number]: string } = {
        1: "https://ethereum.publicnode.com",
        137: "https://polygon.llamarpc.com",
        42161: "https://arb1.arbitrum.io/rpc",
        56: "https://bsc-dataseed1.binance.org/",
        43114: "https://avalanche.public-rpc.com",
        8453: "https://base.publicnode.com",
        11155111: "https://sepolia.publicnode.com",
        97: "https://bsc-testnet.publicnode.com",
      };

      return fallbackRpcUrls[chainId] || fallbackRpcUrls[1];
    }
  }
}
