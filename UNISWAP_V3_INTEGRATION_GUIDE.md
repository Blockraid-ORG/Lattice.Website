# 🦄 Panduan Lengkap Integrasi Uniswap V3 - Lattice Website

**Last Updated**: Oktober 2025  
**Status**: ✅ PRODUCTION READY  
**Developer**: Lattice Team

---

## 📋 Daftar Isi

1. [Status & Overview](#status--overview)
2. [Quick Start](#quick-start)
3. [Contract Addresses](#contract-addresses)
4. [Supported Chains & Tokens](#supported-chains--tokens)
5. [Cara Penggunaan](#cara-penggunaan)
6. [Testing Guide](#testing-guide)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

---

## 📊 Status & Overview

### ✅ Implementasi Complete

Aplikasi ini telah mengintegrasikan **Uniswap V3 SDK** secara lengkap dengan fitur-fitur berikut:

| Fitur            | Status      | Deskripsi                          |
| ---------------- | ----------- | ---------------------------------- |
| Pool Creation    | ✅ Complete | Membuat liquidity pool baru        |
| Position Minting | ✅ Complete | Mint position NFT dengan liquidity |
| Add Liquidity    | ✅ Complete | Menambah liquidity ke position     |
| Remove Liquidity | ✅ Complete | Mengurangi liquidity dari position |
| Collect Fees     | ✅ Complete | Collect trading fees yang earned   |
| Fetch Positions  | ✅ Complete | Query user's liquidity positions   |

### 🌐 Supported Chains

| Chain             | Status            | Network | Chain ID |
| ----------------- | ----------------- | ------- | -------- |
| **BSC (Binance)** | ✅ **PRODUCTION** | Mainnet | 56       |
| Arbitrum One      | ✅ Ready          | Mainnet | 42161    |
| Ethereum          | ✅ Ready          | Mainnet | 1        |
| Polygon           | ✅ Ready          | Mainnet | 137      |
| Avalanche         | ✅ Ready          | C-Chain | 43114    |

---

## 🚀 Quick Start

### 1. Import Hook

```typescript
import { useUniswapV3SDK } from "@/hooks/useUniswapV3SDK";

const { isReady, mintPosition, fetchUserPositions } = useUniswapV3SDK(56); // BSC
```

### 2. Siapkan Token Data

```typescript
const tokenA = {
  chainId: 56,
  address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC BSC
  decimals: 18, // BSC USDC = 18 decimals
  symbol: "USDC",
  name: "Binance-Peg USD Coin",
};

const tokenB = {
  chainId: 56,
  address: "0xYourProjectTokenAddress",
  decimals: 18,
  symbol: "YOUR",
  name: "Your Project Token",
};
```

### 3. Create Pool & Mint Position

```typescript
const result = await mintPosition({
  tokenA,
  tokenB,
  fee: 3000, // 0.3% fee tier
  amount0: "1", // 1 USDC
  amount1: "2000", // 2000 YOUR (rate: 1 USDC = 2000 YOUR)
  recipient: userAddress,
  deadline: Math.floor(Date.now() / 1000) + 20 * 60, // 20 minutes
  slippageTolerance: 0.5, // 0.5%
});

console.log("✅ Position Created!");
console.log("NFT Token ID:", result.tokenId);
console.log("Transaction:", result.hash);
```

---

## 🔗 Contract Addresses

### BSC (Binance Smart Chain) - Chain ID: 56

```typescript
{
  FACTORY: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
  POSITION_MANAGER: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613",
  SWAP_ROUTER: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
}
```

**Verified Contracts:**

- ✅ [Factory](https://bscscan.com/address/0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7)
- ✅ [Position Manager](https://bscscan.com/address/0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613)
- ✅ [Swap Router](https://bscscan.com/address/0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2)

### Arbitrum One - Chain ID: 42161

```typescript
{
  FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
}
```

### Ethereum Mainnet - Chain ID: 1

```typescript
{
  FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
}
```

---

## 🪙 Supported Chains & Tokens

### BSC (Binance Smart Chain)

**Stablecoins:**

- **USDC**: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` - **18 decimals** ⚠️
- **USDT**: `0x55d398326f99059fF775485246999027B3197955` - 18 decimals

**Native & Wrapped:**

- **BNB**: `native` (auto-wrapped to WBNB)
- **WBNB**: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` - 18 decimals

**DeFi Tokens:**

- **CAKE**: `0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82` - 18 decimals

### Arbitrum One

**Stablecoins:**

- **USDC (Native)**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` - **6 decimals**
- **USDC.e**: `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8` - 6 decimals
- **USDT**: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` - 6 decimals

**Native & Wrapped:**

- **ETH**: `native` (auto-wrapped to WETH)
- **WETH**: `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` - 18 decimals

### ⚠️ PENTING: Token Decimals

| Token          | BSC Decimals | Arbitrum Decimals | Ethereum Decimals |
| -------------- | ------------ | ----------------- | ----------------- |
| USDC           | **18**       | **6**             | **6**             |
| USDT           | 18           | 6                 | 6                 |
| Native Token   | 18           | 18                | 18                |
| Project Tokens | 18 (default) | 18 (default)      | 18 (default)      |

**BSC USDC berbeda!** Binance-Peg USDC menggunakan 18 decimals, bukan 6 seperti di Ethereum/Arbitrum.

---

## 📖 Cara Penggunaan

### 1. Setup Project untuk Uniswap

Pastikan project data memiliki chain information:

```typescript
const projectData = {
  name: "Your Project",
  ticker: "YOUR",
  contractAddress: "0xYourTokenAddress",
  chains: [
    {
      chain: {
        id: "chain-id",
        name: "Binance", // akan di-map ke "binance"
        ticker: "BNB",
        chainid: 56,
        logo: "/images/networks/binance.png",
        type: "mainnet",
        urlScanner: "https://bscscan.com",
      },
    },
  ],
  logo: "/logo/project-logo.png",
};
```

### 2. Initialize SDK

```typescript
import { useUniswapV3SDK } from "@/hooks/useUniswapV3SDK";

function MyComponent() {
  const {
    isReady,
    isConnecting,
    error,
    mintPosition,
    fetchUserPositions,
    addLiquidity,
    removeLiquidity,
    collectFees,
  } = useUniswapV3SDK(56); // BSC Chain ID

  // SDK ready ketika isReady === true
}
```

### 3. Create Pool dengan USDC

```typescript
const handleCreatePool = async () => {
  try {
    const tokenA = {
      chainId: 56,
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC BSC
      decimals: 18, // IMPORTANT: BSC USDC = 18 decimals
      symbol: "USDC",
      name: "Binance-Peg USD Coin",
      isNative: false,
    };

    const tokenB = {
      chainId: 56,
      address: "0xYourProjectTokenAddress",
      decimals: 18,
      symbol: "YOUR",
      name: "Your Project Token",
      isNative: false,
    };

    const result = await mintPosition({
      tokenA,
      tokenB,
      fee: 3000, // 0.3% fee tier
      amount0: "1", // 1 USDC
      amount1: "2000", // 2000 YOUR
      recipient: userAddress,
      deadline: Math.floor(Date.now() / 1000) + 20 * 60,
      slippageTolerance: 0.5,
    });

    console.log("✅ Pool created!");
    console.log("NFT Token ID:", result.tokenId);
    console.log("TX Hash:", result.hash);
    console.log("View on BSCScan:", `https://bscscan.com/tx/${result.hash}`);
  } catch (error) {
    console.error("❌ Failed:", error);
  }
};
```

### 4. Create Pool dengan BNB (Native Token)

```typescript
const tokenA = {
  chainId: 56,
  address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  decimals: 18,
  symbol: "BNB",
  name: "Binance Coin",
  isNative: true, // SDK akan auto-wrap BNB ke WBNB
};

const tokenB = {
  chainId: 56,
  address: "0xYourProjectTokenAddress",
  decimals: 18,
  symbol: "YOUR",
  name: "Your Project Token",
  isNative: false,
};

await mintPosition({
  tokenA,
  tokenB,
  fee: 3000,
  amount0: "0.1", // 0.1 BNB
  amount1: "100", // 100 YOUR
  recipient: userAddress,
  deadline: Math.floor(Date.now() / 1000) + 20 * 60,
  slippageTolerance: 0.5,
});
```

### 5. Fetch User Positions

```typescript
const positions = await fetchUserPositions(userAddress);

console.log("User Positions:", positions);
// Output: Array of position info dengan liquidity details
```

### 6. Add Liquidity ke Position

```typescript
await addLiquidity({
  tokenId: 123, // NFT Position ID
  amount0: "0.5", // Additional 0.5 USDC
  amount1: "1000", // Additional 1000 YOUR
  slippageTolerance: 0.5,
  deadline: Math.floor(Date.now() / 1000) + 20 * 60,
});
```

### 7. Remove Liquidity dari Position

```typescript
await removeLiquidity({
  tokenId: 123,
  fractionToRemove: 0.5, // Remove 50% of liquidity
  collectFees: true, // Collect fees during removal
  slippageTolerance: 0.5,
  deadline: Math.floor(Date.now() / 1000) + 20 * 60,
});
```

### 8. Collect Trading Fees

```typescript
await collectFees({
  tokenId: 123,
  // recipient optional - defaults to signer address
});
```

---

## 🧪 Testing Guide

### Persiapan Testing

**Persyaratan:**

- [ ] Project token sudah deployed di BSC
- [ ] Wallet connected (MetaMask/Web3Auth)
- [ ] BNB untuk gas fee (minimal 0.01 BNB)
- [ ] Token balance untuk liquidity (contoh: 1 USDC + 2000 YOUR)

### Test Scenario 1: Create USDC Pool

```typescript
// 1. Connect wallet ke BSC (auto-switch by SDK)
// 2. Prepare tokens
const usdcBSC = {
  chainId: 56,
  address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  decimals: 18, // BSC USDC = 18 decimals!
  symbol: "USDC",
  name: "Binance-Peg USD Coin",
};

const yourToken = {
  chainId: 56,
  address: "0xYourTokenAddress",
  decimals: 18,
  symbol: "YOUR",
  name: "Your Token",
};

// 3. Create position
const result = await mintPosition({
  tokenA: usdcBSC,
  tokenB: yourToken,
  fee: 3000, // 0.3%
  amount0: "1", // 1 USDC
  amount1: "2000", // 2000 YOUR (rate: 1 USDC = 2000 YOUR)
  recipient: userAddress,
  deadline: Math.floor(Date.now() / 1000) + 20 * 60,
  slippageTolerance: 0.5,
});

console.log("✅ Success!");
console.log("Position NFT ID:", result.tokenId);
console.log("View:", `https://bscscan.com/tx/${result.hash}`);
```

### Test Scenario 2: Create BNB Pool

```typescript
const bnbNative = {
  chainId: 56,
  address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  decimals: 18,
  symbol: "BNB",
  name: "Binance Coin",
  isNative: true, // Auto-wrap to WBNB
};

const result = await mintPosition({
  tokenA: bnbNative,
  tokenB: yourToken,
  fee: 3000,
  amount0: "0.01", // 0.01 BNB
  amount1: "20", // 20 YOUR (rate: 1 BNB = 2000 YOUR)
  recipient: userAddress,
  deadline: Math.floor(Date.now() / 1000) + 20 * 60,
  slippageTolerance: 1.0, // Higher slippage untuk volatile pairs
});
```

### Expected Results

Setelah berhasil create position:

```
✅ Transaction Success!
NFT Position ID: 868545
Transaction Hash: 0x7d6ea26abcf0b4cad9...
Pool: USDC/YOUR di BSC
Fee Tier: 0.3%
Amounts:
  - USDC: 1.0
  - YOUR: 2000.0
```

**Verifikasi:**

1. Cek transaction di BSCScan
2. Cek NFT position di MetaMask (tab NFTs)
3. Cek wallet balance (token sudah terdeduct)
4. Position akan earn fees dari trading

---

## ✅ Verification

### 1. Cek Transaction di BSCScan

```
https://bscscan.com/tx/[YOUR_TX_HASH]
```

Di transaction detail, Anda akan melihat:

- ✅ Status: Success
- ✅ From: Your wallet address
- ✅ To: Uniswap V3 Position Manager
- ✅ Tokens Transferred: USDC & YOUR token

### 2. Cek NFT Position

**Di MetaMask Mobile:**

1. Buka tab **NFTs**
2. Network: BSC
3. Cari **Uniswap V3 Positions**
4. NFT dengan ID yang Anda terima

**Atau import manual:**

- Contract: `0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613`
- Token ID: [Your NFT ID]

### 3. Query Pool Info

```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://bsc-dataseed1.binance.org/"
);

const factoryAddress = "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7";
const factoryABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)",
];

const factory = new ethers.Contract(factoryAddress, factoryABI, provider);

const poolAddress = await factory.getPool(
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
  "0xYourTokenAddress", // YOUR
  3000 // 0.3% fee
);

console.log("Pool Address:", poolAddress);
// Pool address akan muncul jika pool berhasil dibuat
```

---

## 🆘 Troubleshooting

### Problem 1: "USDC decimals incorrect"

**Error:** Approval amount too large or transaction failing

**Root Cause:** BSC USDC menggunakan 18 decimals, bukan 6

**Solution:**

```typescript
// ❌ WRONG
decimals: 6; // Ini untuk Ethereum/Arbitrum

// ✅ CORRECT
decimals: 18; // BSC USDC (Binance-Peg)
```

### Problem 2: "Insufficient BNB for gas"

**Error:** Transaction failing or cannot submit

**Solution:**

- Pastikan wallet memiliki minimal **0.01 BNB** untuk gas
- BSC gas sangat murah: Pool creation < $1 total

### Problem 3: "Pool already exists"

**Message:** Pool already initialized

**Explanation:**

- Ini **NORMAL** dan **BUKAN ERROR**
- SDK akan detect existing pool dan skip creation
- Pool akan tetap berfungsi untuk mint position

### Problem 4: "MetaMask shows wrong amounts"

**Issue:** Preview menunjukkan amount berbeda dari input

**Explanation:**

- Uniswap V3 transactions kompleks
- MetaMask preview mungkin tidak akurat
- **Actual transaction** akan deduct **EXACT amounts** yang Anda input
- Verifikasi via BSCScan setelah transaction confirmed

### Problem 5: "RPC endpoint timeout"

**Error:** Network request timeout

**Solution:**

- SDK menggunakan dynamic RPC dengan auto-fallback
- Tunggu beberapa detik dan coba lagi
- Atau ganti RPC URL manual di MetaMask

### Problem 6: "Token approval failed"

**Error:** Approval transaction rejected

**Solution:**

1. Check BNB balance untuk gas
2. Retry approval
3. Clear pending transactions di MetaMask
4. Refresh page dan coba lagi

---

## 📚 API Reference

### Hook: `useUniswapV3SDK(chainId)`

```typescript
const {
  // State
  isReady: boolean,
  isConnecting: boolean,
  error: string | null,

  // Methods
  mintPosition: (params: MintPositionParams) => Promise<MintResult>,
  fetchUserPositions: (address: string) => Promise<PositionInfo[]>,
  addLiquidity: (params: AddLiquidityParams) => Promise<TransactionResult>,
  removeLiquidity: (params: RemoveLiquidityParams) => Promise<TransactionResult>,
  collectFees: (params: CollectFeesParams) => Promise<CollectResult>,

  // Helpers
  calculateOptimalTicks: (params: TickParams) => Promise<TickResult>,
  clearError: () => void,
} = useUniswapV3SDK(56); // Chain ID
```

### Types

```typescript
interface TokenData {
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  isNative?: boolean;
}

interface MintPositionParams {
  tokenA: TokenData;
  tokenB: TokenData;
  fee: number; // 100, 500, 3000, 10000
  amount0: string; // Human readable amount
  amount1: string; // Human readable amount
  recipient: string;
  deadline: number; // Unix timestamp
  slippageTolerance: number; // 0.0 - 1.0 (0.5 = 0.5%)
  tickLower?: number; // Optional, auto-calculated
  tickUpper?: number; // Optional, auto-calculated
}

interface MintResult {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  tokenId: number; // NFT Position ID
  liquidity: string;
  amount0: string;
  amount1: string;
}

interface PositionInfo {
  tokenId: number;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  tokensOwed0: string; // Fees owed
  tokensOwed1: string; // Fees owed
}
```

### Fee Tiers

```typescript
const FEE_TIERS = {
  100: "0.01%", // Stablecoins (USDC/USDT)
  500: "0.05%", // Stable pairs
  3000: "0.3%", // Most pairs (RECOMMENDED)
  10000: "1.0%", // Volatile pairs
};
```

### Gas Settings (BSC)

```typescript
const GAS_SETTINGS_BSC = {
  gasLimit: 150000,
  maxFeePerGas: ethers.parseUnits("5", "gwei"),
  maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
};
```

**Estimated Costs (BSC):**

- Pool Creation: < $0.50
- Position Minting: < $1.00
- Add/Remove Liquidity: < $0.50
- Collect Fees: < $0.30

---

## 🌐 Network Configuration

### BSC Network Auto-Switch

SDK akan otomatis switch network ke BSC jika user belum connect:

```typescript
const bscConfig = {
  chainId: "0x38", // 56 in hex
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: [
    "https://bsc-dataseed1.binance.org/",
    "https://bsc-dataseed2.binance.org/",
    "https://bsc-dataseed3.binance.org/",
  ],
  blockExplorerUrls: ["https://bscscan.com/"],
};
```

### RPC Providers

**Primary:** Dynamic RPC dari Terravest API  
**Fallback:**

```
1. https://bsc-dataseed1.binance.org/
2. https://bsc-dataseed2.binance.org/
3. https://bsc-dataseed3.binance.org/
4. https://bsc-dataseed4.binance.org/
```

---

## 📁 File Structure

```
src/
├── hooks/
│   └── useUniswapV3SDK.ts          # Main React hook
├── services/
│   └── uniswap/
│       └── uniswap-v3-sdk.service.ts  # Core SDK service
├── components/
│   └── liquidity-pool/
│       ├── modal-liquidity.tsx        # Main UI modal
│       ├── confirmation-modal.tsx     # Confirmation step
│       └── token-selection-modal.tsx  # Token picker
├── data/
│   └── constants.ts                   # Contract addresses & tokens
├── types/
│   └── uniswap.d.ts                   # TypeScript definitions
└── lib/
    └── uniswap/
        └── constants.ts               # Uniswap constants
```

---

## 🔐 Production Checklist

- [x] ✅ Uniswap V3 contract addresses configured
- [x] ✅ BSC token addresses (USDC, USDT, BNB) configured
- [x] ✅ Gas settings optimized untuk BSC
- [x] ✅ Network auto-switching implemented
- [x] ✅ Dynamic RPC providers dengan fallback
- [x] ✅ Error handling & recovery
- [x] ✅ Transaction monitoring & parsing
- [x] ✅ Modal UI dengan multi-step wizard
- [x] ✅ BSCScan integration
- [x] ✅ Token decimals handling (18 decimals BSC)
- [x] ✅ Native token (BNB) auto-wrapping
- [x] ✅ Full testing completed

---

## 📞 Support & Resources

### Documentation

- **Uniswap V3 Docs**: https://docs.uniswap.org/sdk/v3
- **BSC Docs**: https://docs.bnbchain.org/
- **Ethers.js Docs**: https://docs.ethers.org/v6/

### Explorers

- **BSCScan**: https://bscscan.com
- **BSC Gas Tracker**: https://bscscan.com/gastracker

### Code Files

- `src/hooks/useUniswapV3SDK.ts` - Main SDK hook
- `src/services/uniswap/uniswap-v3-sdk.service.ts` - Core service
- `src/components/liquidity-pool/` - UI components
- `src/data/constants.ts` - Configuration

---

## 🎉 Kesimpulan

**Status**: ✅ **PRODUCTION READY**

Integrasi Uniswap V3 untuk BSC Chain sudah **100% complete dan tested**. Semua fitur core Uniswap V3 sudah diimplementasikan dengan:

- ✅ Pool creation & initialization
- ✅ Position minting dengan NFT
- ✅ Add/Remove liquidity
- ✅ Collect trading fees
- ✅ Auto network switching
- ✅ Gas optimization
- ✅ Error handling & recovery
- ✅ Comprehensive UI/UX

**Key Features:**

- 🟡 Full BSC support
- 💰 Gas < $1 per transaction
- 🔄 Auto network switch
- 📡 Dynamic RPC dengan fallback
- 🎯 Multi-step wizard UI
- 🧪 Fully tested & verified

Aplikasi siap untuk **production use** dengan support untuk 5 major chains (BSC, Arbitrum, Ethereum, Polygon, Avalanche).

---

**Last Updated**: Oktober 2025  
**Version**: 1.0  
**Maintained by**: Lattice Development Team

_For questions or issues, refer to this documentation or check the code files listed in the API Reference section._
