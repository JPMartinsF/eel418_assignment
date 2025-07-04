const { ethers } = require("hardhat");

async function main() {
  // Compile contract
  const UFRJ_CRID = await ethers.getContractFactory("UFRJ_CRID");
  
  // Deploy
  console.log("🚀 Deploying UFRJ_CRID contract...");
  const contract = await UFRJ_CRID.deploy();
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", await contract.getAddress());
  console.log("📝 Admin address:", contract.runner.address); // Deployer becomes admin
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("🛑 Deployment failed:", error);
    process.exit(1);
  });