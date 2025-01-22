import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      viaIR: true,
    },
  },

  networks: {
    hardhat: {
      chains: {
        8453: {
          hardforkHistory: {
            london: 24129518,
          },
        },
      },
    },
  },
};

export default config;
