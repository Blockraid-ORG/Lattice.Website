import BigNumber from "bignumber.js";

// Configure BigNumber for crypto precision
BigNumber.config({
  DECIMAL_PLACES: 20,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-20, 20],
});

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface TokenPriceData {
  price: BigNumber;
  priceNumber: number; // For backward compatibility
  change24h: number;
  formatted: string;
}

export class CoinGeckoService {
  private static readonly BASE_URL = "https://api.coingecko.com/api/v3";
  private static readonly PRICE_ENDPOINT = "/simple/price";

  // Cache untuk menyimpan harga selama 5 menit
  private static cache: Map<
    string,
    { data: TokenPriceData; timestamp: number }
  > = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  // Mapping token symbol ke CoinGecko ID
  private static readonly TOKEN_ID_MAP: Record<string, string> = {
    // Major cryptocurrencies
    BTC: "bitcoin",
    ETH: "ethereum",
    BNB: "binancecoin",
    MATIC: "matic-network",
    AVAX: "avalanche-2",
    ARB: "arbitrum",

    // Stablecoins
    USDC: "usd-coin",
    USDT: "tether",
    BUSD: "binance-usd",
    DAI: "dai",

    // DeFi tokens
    UNI: "uniswap",
    LINK: "chainlink",
    CAKE: "pancakeswap-token",
    WETH: "weth",

    // Additional tokens can be added here
  };

  /**
   * Mengambil harga token dari CoinGecko API
   */
  static async getTokenPrices(
    symbols: string[]
  ): Promise<Record<string, TokenPriceData>> {
    try {
      const uncachedSymbols: string[] = [];
      const result: Record<string, TokenPriceData> = {};

      // Periksa cache terlebih dahulu
      for (const symbol of symbols) {
        const cached = this.cache.get(symbol.toUpperCase());
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
          result[symbol] = cached.data;
        } else {
          uncachedSymbols.push(symbol);
        }
      }

      // Jika semua data ada di cache, kembalikan hasil
      if (uncachedSymbols.length === 0) {
        return result;
      }

      // Ambil CoinGecko IDs untuk token yang belum di-cache
      const coinIds = uncachedSymbols
        .map((symbol) => this.TOKEN_ID_MAP[symbol.toUpperCase()])
        .filter((id) => id) // Filter out undefined values
        .join(",");

      if (!coinIds) {
        // Jika tidak ada token yang bisa diambil dari CoinGecko, kembalikan default
        for (const symbol of uncachedSymbols) {
          result[symbol] = {
            price: new BigNumber(0),
            priceNumber: 0,
            change24h: 0,
            formatted: "$0",
          };
        }
        return result;
      }

      // Panggil API CoinGecko
      const response = await fetch(
        `${this.BASE_URL}${this.PRICE_ENDPOINT}?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoPriceResponse = await response.json();

      // Parse data dan update cache
      for (const symbol of uncachedSymbols) {
        const coinId = this.TOKEN_ID_MAP[symbol.toUpperCase()];
        const coinData = data[coinId];

        if (coinData) {
          const priceBN = new BigNumber(coinData.usd);
          const tokenPrice: TokenPriceData = {
            price: priceBN,
            priceNumber: coinData.usd,
            change24h: coinData.usd_24h_change || 0,
            formatted: this.formatPrice(priceBN),
          };

          result[symbol] = tokenPrice;

          // Update cache
          this.cache.set(symbol.toUpperCase(), {
            data: tokenPrice,
            timestamp: Date.now(),
          });
        } else {
          // Fallback jika data tidak ditemukan
          result[symbol] = {
            price: new BigNumber(0),
            priceNumber: 0,
            change24h: 0,
            formatted: "$0",
          };
        }
      }

      return result;
    } catch (error) {
      console.error("Error fetching token prices:", error);

      // Kembalikan fallback prices jika API gagal
      const fallback: Record<string, TokenPriceData> = {};
      for (const symbol of symbols) {
        fallback[symbol] = {
          price: new BigNumber(0),
          priceNumber: 0,
          change24h: 0,
          formatted: "$0",
        };
      }
      return fallback;
    }
  }

  /**
   * Mengambil harga satu token
   */
  static async getTokenPrice(symbol: string): Promise<TokenPriceData> {
    const prices = await this.getTokenPrices([symbol]);
    return (
      prices[symbol] || {
        price: new BigNumber(0),
        priceNumber: 0,
        change24h: 0,
        formatted: "$0",
      }
    );
  }

  /**
   * Format harga dengan mata uang menggunakan BigNumber untuk precision yang tepat
   */
  private static formatPrice(price: BigNumber): string {
    if (price.isZero()) return "$0";

    // For very small numbers (< 0.01), show full precision without trailing zeros
    if (price.lt(0.01)) {
      return `$${price.toFixed()}`;
    }

    // For numbers >= 0.01 but < 1, show up to 4 significant decimals
    if (price.lt(1)) {
      return `$${price.decimalPlaces(4).toFixed()}`;
    }

    // For numbers >= 1 but < 1000, show up to 2 decimal places
    if (price.lt(1000)) {
      return `$${price.decimalPlaces(2).toFixed()}`;
    }

    // For numbers >= 1000, format with commas and 2 decimal places
    const formatted = price.decimalPlaces(2).toFormat();
    return `$${formatted}`;
  }

  /**
   * Mendapatkan daftar token yang didukung
   */
  static getSupportedTokens(): string[] {
    return Object.keys(this.TOKEN_ID_MAP);
  }

  /**
   * Menambahkan token baru ke mapping
   */
  static addTokenMapping(symbol: string, coinGeckoId: string): void {
    this.TOKEN_ID_MAP[symbol.toUpperCase()] = coinGeckoId;
  }

  /**
   * Membersihkan cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}
