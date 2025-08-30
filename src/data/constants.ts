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
  { value: "4", label: "4 Month" },
  { value: "10", label: "10 Month" },
  { value: "20", label: "20 Month" },
  { value: "40", label: "40 Month" },
  { value: "50", label: "50 Month" },
  { value: "80", label: "80 Month" },
  { value: "100", label: "100 Month" },
];

export const presaleDurationCount = (count: number) => {
  const x = Array.from({ length: count || 10 }, (_, i) => i + 1);
  return x.map((i) => {
    return {
      value: `${i}`,
      label: `${i} Day`,
    };
  });
};

export const presalesDurations = presaleDurationCount(100);

// Uniswap V3 Contract Addresses for supported chains
export const UNISWAP_V3_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  // Polygon Mainnet
  137: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
  },
  // Arbitrum One
  42161: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH on Arbitrum
  },
  // Binance Smart Chain (PancakeSwap V3, Uniswap fork)
  56: {
    FACTORY: "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362",
    POSITION_MANAGER: "0x2fF3657F1e62d5D62f651A2cf457C27A1C6DcdC1",
    WETH: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
  // Avalanche C-Chain (Trader Joe, Uniswap fork style)
  43114: {
    FACTORY: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    POSITION_MANAGER: "0xb3C8F9d02aAac0fA82D4e1Ff93cBEE04A1f44c56", // Liquidity manager
    WETH: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
  },
  // Polygon Testnet (Mumbai)
  80001: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    WETH: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // WMATIC (native wrapped token)
  },
};
