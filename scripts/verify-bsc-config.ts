/**
 * BSC Configuration Verification Script
 *
 * Script ini memverifikasi bahwa semua konfigurasi BSC sudah benar
 * dan siap untuk production.
 *
 * Run: npx ts-node scripts/verify-bsc-config.ts
 */

import { ethers } from "ethers";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg: string) =>
    console.log(
      `\n${colors.cyan}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${
        colors.reset
      }\n`
    ),
};

// BSC Configuration
const BSC_CONFIG = {
  chainId: 56,
  name: "Binance Smart Chain",
  rpcUrls: [
    "https://bsc-dataseed1.binance.org/",
    "https://bsc-dataseed2.binance.org/",
    "https://bsc-dataseed3.binance.org/",
  ],
  contracts: {
    FACTORY: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
    POSITION_MANAGER: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613",
    SWAP_ROUTER: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  tokens: {
    USDC: {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      expectedDecimals: 18,
      symbol: "USDC",
    },
    USDT: {
      address: "0x55d398326f99059fF775485246999027B3197955",
      expectedDecimals: 18,
      symbol: "USDT",
    },
    WBNB: {
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      expectedDecimals: 18,
      symbol: "WBNB",
    },
    CAKE: {
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      expectedDecimals: 18,
      symbol: "CAKE",
    },
    KS: {
      address: "0xC327D83686f6B491B1D93755fCEe036aBd4877Dc",
      expectedDecimals: 18,
      symbol: "KS",
    },
  },
};

/**
 * Test RPC endpoint connectivity
 */
async function testRPCEndpoint(rpcUrl: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Test basic connectivity
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    if (Number(network.chainId) !== BSC_CONFIG.chainId) {
      log.error(
        `RPC endpoint returned wrong chain ID: ${network.chainId} (expected ${BSC_CONFIG.chainId})`
      );
      return false;
    }

    log.success(`${rpcUrl} - Block: ${blockNumber}`);
    return true;
  } catch (error: any) {
    log.error(`${rpcUrl} - Failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify contract exists and has code
 */
async function verifyContract(
  provider: ethers.JsonRpcProvider,
  contractName: string,
  address: string
): Promise<boolean> {
  try {
    const code = await provider.getCode(address);

    if (code === "0x") {
      log.error(`${contractName} (${address}) - No contract code found`);
      return false;
    }

    log.success(
      `${contractName} (${address.slice(0, 10)}...) - Contract verified`
    );
    return true;
  } catch (error: any) {
    log.error(`${contractName} - Failed to verify: ${error.message}`);
    return false;
  }
}

/**
 * Verify token decimals
 */
async function verifyTokenDecimals(
  provider: ethers.JsonRpcProvider,
  tokenName: string,
  address: string,
  expectedDecimals: number
): Promise<boolean> {
  try {
    const tokenContract = new ethers.Contract(
      address,
      [
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ],
      provider
    );

    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    if (Number(decimals) !== expectedDecimals) {
      log.error(
        `${tokenName} (${symbol}) - Wrong decimals: ${decimals} (expected ${expectedDecimals})`
      );
      return false;
    }

    log.success(
      `${tokenName} (${symbol}) - Address: ${address.slice(
        0,
        10
      )}... - Decimals: ${decimals} ✅`
    );
    return true;
  } catch (error: any) {
    log.error(`${tokenName} - Failed to verify: ${error.message}`);
    return false;
  }
}

/**
 * Main verification function
 */
async function verifyBSCConfiguration() {
  log.section("🟡 BSC CONFIGURATION VERIFICATION");

  let totalTests = 0;
  let passedTests = 0;

  // 1. Test RPC Endpoints
  log.section("1️⃣ Testing RPC Endpoints");
  for (const rpcUrl of BSC_CONFIG.rpcUrls) {
    totalTests++;
    const result = await testRPCEndpoint(rpcUrl);
    if (result) passedTests++;
  }

  // Get a working provider for remaining tests
  let provider: ethers.JsonRpcProvider | null = null;
  for (const rpcUrl of BSC_CONFIG.rpcUrls) {
    try {
      const testProvider = new ethers.JsonRpcProvider(rpcUrl);
      await testProvider.getNetwork();
      provider = testProvider;
      log.info(`Using ${rpcUrl} for remaining tests`);
      break;
    } catch {
      continue;
    }
  }

  if (!provider) {
    log.error(
      "❌ No working RPC endpoint found! Cannot continue verification."
    );
    return;
  }

  // 2. Verify Uniswap V3 Contracts
  log.section("2️⃣ Verifying Uniswap V3 Contracts");
  for (const [name, address] of Object.entries(BSC_CONFIG.contracts)) {
    totalTests++;
    const result = await verifyContract(provider, name, address);
    if (result) passedTests++;
  }

  // 3. Verify Token Contracts & Decimals
  log.section("3️⃣ Verifying Token Contracts & Decimals");
  for (const [name, tokenConfig] of Object.entries(BSC_CONFIG.tokens)) {
    totalTests++;
    const result = await verifyTokenDecimals(
      provider,
      name,
      tokenConfig.address,
      tokenConfig.expectedDecimals
    );
    if (result) passedTests++;
  }

  // 4. Test Factory Pool Query
  log.section("4️⃣ Testing Factory Pool Query");
  try {
    const factoryContract = new ethers.Contract(
      BSC_CONFIG.contracts.FACTORY,
      [
        "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
      ],
      provider
    );

    // Test query for USDC/WBNB pool
    totalTests++;
    const poolAddress = await factoryContract.getPool(
      BSC_CONFIG.tokens.USDC.address,
      BSC_CONFIG.tokens.WBNB.address,
      3000 // 0.3% fee
    );

    if (poolAddress === ethers.ZeroAddress) {
      log.warning(
        "USDC/WBNB pool does not exist yet (this is normal for new deployment)"
      );
      passedTests++; // Count as pass since function works
    } else {
      log.success(`USDC/WBNB pool found: ${poolAddress}`);
      passedTests++;
    }
  } catch (error: any) {
    log.error(`Factory pool query failed: ${error.message}`);
  }

  // 5. Verify Gas Prices
  log.section("5️⃣ Checking Current Gas Prices");
  try {
    const feeData = await provider.getFeeData();
    const gasPriceGwei = feeData.gasPrice
      ? Number(ethers.formatUnits(feeData.gasPrice, "gwei"))
      : 0;

    log.info(`Current Gas Price: ${gasPriceGwei.toFixed(2)} gwei`);

    if (gasPriceGwei > 10) {
      log.warning(
        `Gas price is relatively high for BSC (>${gasPriceGwei.toFixed(
          2
        )} gwei)`
      );
    } else {
      log.success("Gas price is normal for BSC");
    }

    totalTests++;
    passedTests++;
  } catch (error: any) {
    log.error(`Failed to get gas price: ${error.message}`);
    totalTests++;
  }

  // Final Summary
  log.section("📊 VERIFICATION SUMMARY");
  const percentage = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(
    `Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`
  );
  console.log(`Success Rate: ${percentage}%\n`);

  if (passedTests === totalTests) {
    log.success(
      "🎉 ALL TESTS PASSED! BSC configuration is correct and ready for production."
    );
  } else if (passedTests >= totalTests * 0.8) {
    log.warning(
      "⚠️  MOST TESTS PASSED. Some non-critical tests failed. Review the errors above."
    );
  } else {
    log.error(
      "❌ MANY TESTS FAILED. BSC configuration has critical issues. Please review and fix."
    );
  }

  // Configuration Details
  log.section("📝 BSC CONFIGURATION DETAILS");
  console.log(`Chain ID: ${BSC_CONFIG.chainId}`);
  console.log(`Network Name: ${BSC_CONFIG.name}`);
  console.log(`Factory: ${BSC_CONFIG.contracts.FACTORY}`);
  console.log(`Position Manager: ${BSC_CONFIG.contracts.POSITION_MANAGER}`);
  console.log(`Swap Router: ${BSC_CONFIG.contracts.SWAP_ROUTER}`);
  console.log(`WBNB: ${BSC_CONFIG.contracts.WBNB}\n`);

  log.info(
    "✅ Verification complete! Check BSC_INTEGRATION_GUIDE.md for usage examples."
  );
}

// Run verification
verifyBSCConfiguration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    log.error(`Verification failed with error: ${error.message}`);
    process.exit(1);
  });

