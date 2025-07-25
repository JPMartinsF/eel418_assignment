import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.30",
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;