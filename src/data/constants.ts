export const detailProjectTabs = [
  {
    value: 0,
    label: "Detail",
  },
  {
    value: 1,
    label: "Token Unlocks",
  },
];

export const vestingCounts = [
  { value: "0", label: "0 Month" },
  { value: "1", label: "1 Month" },
  { value: "2", label: "2 Month" },
  { value: "3", label: "3 Month" },
  { value: "4", label: "4 Month" },
  { value: "5", label: "5 Month" },
  { value: "6", label: "6 Month" },
  { value: "7", label: "7 Month" },
  { value: "8", label: "8 Month" },
  { value: "9", label: "9 Month" },
  { value: "10", label: "10 Month" },
  { value: "20", label: "20 Month" },
  { value: "40", label: "30 Month" },
  { value: "30", label: "40 Month" },
  { value: "50", label: "50 Month" },
  { value: "80", label: "80 Month" },
  { value: "100", label: "100 Month" },
];

export const presaleDurationCount = (count: number) => {
  const x = Array.from({ length: count || 10 }, (_, i) => i + 0);
  return x.map((i) => {
    return {
      value: `${i}`,
      label: `${i} Day`,
    };
  });
};

export const presalesDurations = presaleDurationCount(100);

// Uniswap V3 Contract Addresses for supported chains
// Official Token Addresses for BSC
export const BSC_TOKENS = {
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC BSC Official
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB Official
  KS: "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc", // KS Token (User Project)
  // Backup test tokens
  USDT: "0x55d398326f99059fF775485246999027B3197955", // USDT BSC
  CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE BSC
} as const;

// Official Token Addresses for Arbitrum
export const ARBITRUM_TOKENS = {
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Native USDC Arbitrum (Circle Official)
  "USDC.e": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // Bridged USDC from Ethereum
  WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH Arbitrum Official
  TS: "0xacef9E8342FbC6468D49c32b6ADBA3f8F8b352Ec", // TS Token (User Project - Toko Sepatu)
  TH: "0xB0CED92BEEC892dA79551A6D0823510F17f1804F", // TH Token (User Project - Toko HP) - 18 decimals, 10,000 supply
  KM: "0xAe771AC9292c84ed2A6625Ae92380DedCF9A5076", // KM Token (KOSAN AN) - 18 decimals, 10,000 supply
  // Additional Arbitrum tokens
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT Arbitrum
  ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB Arbitrum
} as const;

// 🔧 Dynamic RPC Providers - Now fetched from Terravest API
// Menggantikan hardcoded URLs dengan API dinamis untuk keamanan dan fleksibilitas

import { RPCProviderService } from "@/services/rpc-provider.service";

/**
 * Get BSC RPC providers dinamis dari Terravest API
 * @returns Promise<string[]> Array of RPC URLs
 */
export const getBSCRPCProviders = async (): Promise<string[]> => {
  return await RPCProviderService.getAllRPCProviders(56);
};

/**
 * Get Arbitrum RPC providers dinamis dari Terravest API
 * @returns Promise<string[]> Array of RPC URLs
 */
export const getArbitrumRPCProviders = async (): Promise<string[]> => {
  return await RPCProviderService.getAllRPCProviders(42161);
};

/**
 * Get Ethereum RPC providers dinamis dari Terravest API
 * @returns Promise<string[]> Array of RPC URLs
 */
export const getEthereumRPCProviders = async (): Promise<string[]> => {
  return await RPCProviderService.getAllRPCProviders(1);
};

/**
 * Get Polygon RPC providers dinamis dari Terravest API
 * @returns Promise<string[]> Array of RPC URLs
 */
export const getPolygonRPCProviders = async (): Promise<string[]> => {
  return await RPCProviderService.getAllRPCProviders(137);
};

/**
 * Get Base RPC providers dinamis dari Terravest API
 * @returns Promise<string[]> Array of RPC URLs
 */
export const getBaseRPCProviders = async (): Promise<string[]> => {
  return await RPCProviderService.getAllRPCProviders(8453);
};

/**
 * Get RPC URL untuk chain ID tertentu
 * @param chainId Chain ID
 * @returns Promise<string> RPC URL
 */
export const getRPCUrl = async (chainId: number): Promise<string> => {
  return await RPCProviderService.getRPCUrl(chainId);
};

/**
 * Get working RPC URL dengan connection testing
 * @param chainId Chain ID
 * @returns Promise<string> Working RPC URL
 */
export const getWorkingRPCUrl = async (chainId: number): Promise<string> => {
  return await RPCProviderService.getWorkingRPCUrl(chainId);
};

export const UNISWAP_V3_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // SwapRouter02
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  // Polygon Mainnet
  137: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // SwapRouter02
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
  },
  // Arbitrum One
  42161: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // SwapRouter02
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
  },
  // Binance Smart Chain (Official Uniswap V3 Deployment)
  56: {
    FACTORY: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7", // Uniswap V3 Factory on BSC (Official)
    POSITION_MANAGER: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613", // Uniswap V3 Position Manager on BSC (Official)
    SWAP_ROUTER: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2", // Uniswap V3 SwapRouter02 on BSC (Official)
    WETH: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB (Wrapped BNB)
  },
  // Avalanche C-Chain (Trader Joe, Uniswap fork style)
  43114: {
    FACTORY: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    POSITION_MANAGER: "0xb3C8F9d02aAac0fA82D4e1Ff93cBEE04A1f44c56", // Liquidity manager
    SWAP_ROUTER: "0x5bc2b7e1afBD5F11e5E46Eb8E8C6068A02096473", // Trader Joe Router (example)
    WETH: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
  },
  // Polygon Testnet (Mumbai)
  80001: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // SwapRouter02
    WETH: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // WMATIC (native wrapped token)
  },
};
