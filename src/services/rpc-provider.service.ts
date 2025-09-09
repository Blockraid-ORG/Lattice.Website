import { toast } from "sonner";

// Types berdasarkan API response Terravest
export interface ChainData {
  id: string;
  name: string;
  logo: string;
  ticker: string;
  type: "Mainnet" | "Testnet";
  urlScanner: string;
  chainid: number;
  urlApi: string;
  urlRpc: string;
}

export interface TerravestAPIResponse {
  message: string;
  data: ChainData[];
}

/**
 * RPC Provider Service - Dynamic RPC URLs dari Terravest API
 * Menggantikan semua hardcoded RPC URLs dengan API dinamis
 */
export class RPCProviderService {
  private static readonly API_URL =
    "https://api.terravest.capital/v1/chains?noPaginate=1";
  private static chainsCache: ChainData[] | null = null;
  private static cacheTimestamp: number | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit cache

  /**
   * Fetch semua chain data dari Terravest API dengan caching
   */
  private static async fetchChains(): Promise<ChainData[]> {
    try {
      // Check cache first
      if (
        this.chainsCache &&
        this.cacheTimestamp &&
        Date.now() - this.cacheTimestamp < this.CACHE_DURATION
      ) {
        return this.chainsCache;
      }

      console.log("🔄 Fetching chains from Terravest API...");

      const response = await fetch(this.API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout untuk avoid hanging requests
        signal: AbortSignal.timeout(10000), // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TerravestAPIResponse = await response.json();

      if (data.message !== "success" || !Array.isArray(data.data)) {
        throw new Error("Invalid API response format");
      }

      // Update cache
      this.chainsCache = data.data;
      this.cacheTimestamp = Date.now();

      console.log(
        `✅ Successfully fetched ${data.data.length} chains from Terravest API`
      );

      return data.data;
    } catch (error) {
      console.error("❌ Error fetching chains from Terravest API:", error);

      // Return fallback data jika API gagal
      return this.getFallbackChains();
    }
  }

  /**
   * Get RPC URL untuk specific chain ID
   */
  static async getRPCUrl(chainId: number): Promise<string> {
    try {
      const chains = await this.fetchChains();
      const chain = chains.find((c) => c.chainid === chainId);

      if (!chain) {
        console.warn(`⚠️ Chain ID ${chainId} not found in Terravest API`);
        return this.getFallbackRPCUrl(chainId);
      }

      if (!chain.urlRpc || chain.urlRpc === "-") {
        console.warn(
          `⚠️ No RPC URL available for chain ${chainId} (${chain.name})`
        );
        return this.getFallbackRPCUrl(chainId);
      }

      console.log(
        `✅ Got RPC URL for ${chain.name} (${chainId}): ${chain.urlRpc}`
      );
      return chain.urlRpc;
    } catch (error) {
      console.error(`❌ Error getting RPC URL for chain ${chainId}:`, error);
      return this.getFallbackRPCUrl(chainId);
    }
  }

  /**
   * Get multiple RPC URLs untuk load balancing (fallback providers)
   */
  static async getAllRPCProviders(chainId: number): Promise<string[]> {
    try {
      const primaryRpc = await this.getRPCUrl(chainId);
      const fallbackRpcs = this.getFallbackRPCProviders(chainId);

      // Combine primary RPC dengan fallback providers
      const allProviders = [primaryRpc, ...fallbackRpcs];

      // Remove duplicates dan filter out invalid URLs
      const uniqueProviders = Array.from(new Set(allProviders)).filter(
        (url) => url && url !== "-" && url.startsWith("http")
      );

      console.log(
        `📡 Available RPC providers for chain ${chainId}:`,
        uniqueProviders.length
      );

      return uniqueProviders;
    } catch (error) {
      console.error(
        `❌ Error getting RPC providers for chain ${chainId}:`,
        error
      );
      return this.getFallbackRPCProviders(chainId);
    }
  }

  /**
   * Get chain info by chain ID
   */
  static async getChainInfo(chainId: number): Promise<ChainData | null> {
    try {
      const chains = await this.fetchChains();
      const chain = chains.find((c) => c.chainid === chainId);

      if (!chain) {
        console.warn(`⚠️ Chain info for ${chainId} not found`);
        return null;
      }

      return chain;
    } catch (error) {
      console.error(`❌ Error getting chain info for ${chainId}:`, error);
      return null;
    }
  }

  /**
   * Get all supported chains
   */
  static async getSupportedChains(): Promise<ChainData[]> {
    return await this.fetchChains();
  }

  /**
   * Check if chain ID is supported
   */
  static async isChainSupported(chainId: number): Promise<boolean> {
    try {
      const chains = await this.fetchChains();
      return chains.some((c) => c.chainid === chainId);
    } catch (error) {
      console.error(`❌ Error checking chain support for ${chainId}:`, error);
      return false;
    }
  }

  /**
   * Test RPC connectivity
   */
  static async testRPCConnection(rpcUrl: string): Promise<boolean> {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
        signal: AbortSignal.timeout(5000), // 5 seconds timeout
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.result && typeof data.result === "string";
    } catch (error) {
      console.debug(`RPC connection test failed for ${rpcUrl}:`, error);
      return false;
    }
  }

  /**
   * Get working RPC URL dengan connection testing
   */
  static async getWorkingRPCUrl(chainId: number): Promise<string> {
    try {
      const providers = await this.getAllRPCProviders(chainId);

      for (const rpcUrl of providers) {
        console.log(`🔍 Testing RPC connection: ${rpcUrl}`);

        const isWorking = await this.testRPCConnection(rpcUrl);
        if (isWorking) {
          console.log(`✅ Found working RPC: ${rpcUrl}`);
          return rpcUrl;
        }
      }

      // Jika semua gagal, return primary RPC
      console.warn(
        `⚠️ No working RPC found for chain ${chainId}, using primary`
      );
      return await this.getRPCUrl(chainId);
    } catch (error) {
      console.error(
        `❌ Error finding working RPC for chain ${chainId}:`,
        error
      );
      return this.getFallbackRPCUrl(chainId);
    }
  }

  /**
   * Clear cache (untuk testing atau force refresh)
   */
  static clearCache(): void {
    this.chainsCache = null;
    this.cacheTimestamp = null;
    console.log("🧹 RPC Provider cache cleared");
  }

  /**
   * Fallback chains jika API tidak available
   */
  private static getFallbackChains(): ChainData[] {
    return [
      {
        id: "fallback-arbitrum",
        name: "Arbitrum",
        logo: "",
        ticker: "ETH",
        type: "Mainnet",
        urlScanner: "https://arbiscan.io/",
        chainid: 42161,
        urlApi: "-",
        urlRpc: "https://arb1.arbitrum.io/rpc",
      },
      {
        id: "fallback-bsc",
        name: "BNB Smart Chain",
        logo: "",
        ticker: "BNB",
        type: "Mainnet",
        urlScanner: "https://bscscan.com",
        chainid: 56,
        urlApi: "-",
        urlRpc: "https://bsc-dataseed1.binance.org/",
      },
      {
        id: "fallback-ethereum",
        name: "Ethereum",
        logo: "",
        ticker: "ETH",
        type: "Mainnet",
        urlScanner: "https://etherscan.io",
        chainid: 1,
        urlApi: "https://api.etherscan.io/v2/api",
        urlRpc: "https://ethereum.publicnode.com",
      },
      {
        id: "fallback-polygon",
        name: "Polygon",
        logo: "",
        ticker: "MATIC",
        type: "Mainnet",
        urlScanner: "https://polygonscan.com",
        chainid: 137,
        urlApi: "-",
        urlRpc: "https://polygon.llamarpc.com",
      },
    ];
  }

  /**
   * Fallback RPC URLs per chain
   */
  private static getFallbackRPCUrl(chainId: number): string {
    const fallbackUrls: { [key: number]: string } = {
      1: "https://ethereum.publicnode.com",
      56: "https://bsc-dataseed1.binance.org/",
      137: "https://polygon.llamarpc.com",
      42161: "https://arb1.arbitrum.io/rpc",
      8453: "https://base.publicnode.com",
      43114: "https://avalanche.public-rpc.com",
      11155111: "https://sepolia.publicnode.com",
      97: "https://bsc-testnet.publicnode.com",
    };

    return fallbackUrls[chainId] || fallbackUrls[1];
  }

  /**
   * Fallback RPC providers untuk load balancing
   */
  private static getFallbackRPCProviders(chainId: number): string[] {
    const fallbackProviders: { [key: number]: string[] } = {
      1: [
        "https://ethereum.publicnode.com",
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth",
      ],
      56: [
        "https://bsc-dataseed1.binance.org/",
        "https://bsc-dataseed2.binance.org/",
        "https://bsc.publicnode.com",
        "https://rpc.ankr.com/bsc",
      ],
      137: [
        "https://polygon.llamarpc.com",
        "https://polygon.publicnode.com",
        "https://rpc.ankr.com/polygon",
      ],
      42161: [
        "https://arb1.arbitrum.io/rpc",
        "https://arbitrum.publicnode.com",
        "https://rpc.ankr.com/arbitrum",
      ],
      8453: ["https://base.publicnode.com", "https://base.llamarpc.com"],
      43114: [
        "https://avalanche.public-rpc.com",
        "https://rpc.ankr.com/avalanche",
      ],
    };

    return fallbackProviders[chainId] || [];
  }

  /**
   * Initialize RPC service (call this early in app)
   */
  static async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing RPC Provider Service...");

      const chains = await this.fetchChains();

      console.log(
        `✅ RPC Provider Service initialized with ${chains.length} chains`
      );

      // Log supported chains
      const supportedChains = chains
        .map((c) => `${c.name} (${c.chainid})`)
        .join(", ");
      console.log(`📡 Supported chains: ${supportedChains}`);

      // Show success toast
      toast.success(`RPC Provider initialized with ${chains.length} chains`);
    } catch (error) {
      console.error("❌ Failed to initialize RPC Provider Service:", error);
      toast.error("Failed to initialize RPC providers, using fallback");
    }
  }
}
