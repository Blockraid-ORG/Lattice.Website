export const UNISWAP_V3_SUPPORTED_CHAINS = [1, 137, 42161]; // Ethereum, Polygon, Arbitrum
export const BSC_PANCAKESWAP_V3_CHAINS = [56]; // BSC menggunakan PancakeSwap V3

export const CHAIN_NAMES = {
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum",
  56: "BSC",
  43114: "Avalanche",
  80001: "Polygon Testnet",
};

export const NATIVE_TOKENS = {
  1: { symbol: "ETH", name: "Ethereum", decimals: 18 },
  137: { symbol: "MATIC", name: "Polygon", decimals: 18 },
  42161: { symbol: "ETH", name: "Ethereum", decimals: 18 },
  56: { symbol: "BNB", name: "Binance Coin", decimals: 18 },
  43114: { symbol: "AVAX", name: "Avalanche", decimals: 18 },
  80001: { symbol: "MATIC", name: "Polygon", decimals: 18 },
};

export const FEE_TIERS = {
  LOW: 500, // 0.05% - Stable pairs
  MEDIUM: 3000, // 0.30% - Most common
  HIGH: 10000, // 1.00% - Exotic pairs
};

export const TICK_RANGES = {
  FULL_RANGE_LOWER: -887220,
  FULL_RANGE_UPPER: 887220,
  NARROW_RANGE: 1000, // For tight price ranges
  MEDIUM_RANGE: 5000, // Balanced range
  WIDE_RANGE: 20000, // Conservative range
};

export const TICK_SPACINGS = {
  500: 10, // 0.05% fee tier
  3000: 60, // 0.30% fee tier
  10000: 200, // 1.00% fee tier
};

export const SLIPPAGE_TOLERANCE = {
  VERY_LOW: 0.1, // 0.1%
  LOW: 0.5, // 0.5%
  MEDIUM: 1.0, // 1.0%
  HIGH: 3.0, // 3.0%
  VERY_HIGH: 5.0, // 5.0%
};

export const DEADLINE_FROM_NOW = {
  SHORT: 10 * 60, // 10 minutes
  MEDIUM: 20 * 60, // 20 minutes
  LONG: 30 * 60, // 30 minutes
  VERY_LONG: 60 * 60, // 1 hour
};
