import { getRPCUrl } from "@/data/constants";

/**
 * Network Configuration Helper
 * Menggunakan dynamic RPC URLs dari Terravest API
 */

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

/**
 * Get network configuration dengan dynamic RPC
 */
export async function getNetworkConfig(
  chainId: number
): Promise<NetworkConfig> {
  // Get dynamic RPC URL dari Terravest API
  const dynamicRpcUrl = await getRPCUrl(chainId).catch(() => {
    // Fallback URLs jika API gagal
    const fallbacks: { [key: number]: string } = {
      42161: "https://arb1.arbitrum.io/rpc",
      56: "https://bsc-dataseed1.binance.org/",
      1: "https://ethereum.publicnode.com",
      137: "https://polygon.llamarpc.com",
      8453: "https://base.publicnode.com",
      11155111: "https://sepolia.publicnode.com",
      97: "https://bsc-testnet.publicnode.com",
    };
    return fallbacks[chainId] || fallbacks[1];
  });

  const configs: { [key: number]: NetworkConfig } = {
    42161: {
      chainId: "0xa4b1", // 42161 in hex
      chainName: "Arbitrum One",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://arbiscan.io/"],
    },
    56: {
      chainId: "0x38", // 56 in hex
      chainName: "Binance Smart Chain",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://bscscan.com/"],
    },
    1: {
      chainId: "0x1", // 1 in hex
      chainName: "Ethereum Mainnet",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://etherscan.io/"],
    },
    137: {
      chainId: "0x89", // 137 in hex
      chainName: "Polygon",
      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://polygonscan.com/"],
    },
    8453: {
      chainId: "0x2105", // 8453 in hex
      chainName: "Base",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://basescan.org/"],
    },
    11155111: {
      chainId: "0xaa36a7", // 11155111 in hex
      chainName: "Ethereum Sepolia",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://sepolia.etherscan.io/"],
    },
    97: {
      chainId: "0x61", // 97 in hex
      chainName: "BSC Testnet",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: [dynamicRpcUrl],
      blockExplorerUrls: ["https://testnet.bscscan.com/"],
    },
  };

  const config = configs[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return config;
}

/**
 * Get multiple network configurations
 */
export async function getMultipleNetworkConfigs(
  chainIds: number[]
): Promise<{ [key: number]: NetworkConfig }> {
  const configs: { [key: number]: NetworkConfig } = {};

  for (const chainId of chainIds) {
    try {
      configs[chainId] = await getNetworkConfig(chainId);
    } catch (error) {
      console.error(`Failed to get config for chain ${chainId}:`, error);
    }
  }

  return configs;
}

/**
 * Network switching helper dengan dynamic RPC
 */
export async function switchNetwork(
  chainId: number,
  provider: any
): Promise<void> {
  try {
    const config = await getNetworkConfig(chainId);

    try {
      // Try to switch to the network
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.chainId }],
      });
    } catch (switchError: any) {
      // If network not added, add it first
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [config],
        });
      } else {
        throw switchError;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to switch to chain ${chainId}:`, error);
    throw new Error(
      `Failed to switch to chain ${chainId}: ${(error as Error).message}`
    );
  }
}
