import { createConfig, http } from "wagmi";
import { arbitrum, bsc, mainnet, sepolia } from "wagmi/chains";
// import { ARBITRUM_RPC_PROVIDERS } from "@/data/constants";

export const config = createConfig({
  chains: [arbitrum, bsc, mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
  },
});
