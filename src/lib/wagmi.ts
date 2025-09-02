import { createConfig, http } from "wagmi";
import { mainnet, sepolia, bsc, arbitrum } from "wagmi/chains";

export const config = createConfig({
  chains: [arbitrum, bsc, mainnet, sepolia],
  transports: {
    [arbitrum.id]: http(
      "https://arb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX"
    ),
    [bsc.id]: http(
      "https://bnb-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX"
    ),
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX"
    ),
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/dQz-sUBEu_d9geFmnNObX"
    ),
  },
});
