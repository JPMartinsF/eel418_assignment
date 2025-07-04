const { run } = require("hardhat");

async function verify(contractAddress, constructorArgs) {
  console.log("🔍 Verifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs || [],
    });
    console.log("✅ Verification successful!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("⚠️ Contract already verified");
    } else {
      console.error("🛑 Verification failed:", error);
    }
  }
}

// Usage: 
// npx hardhat run scripts/verify.js --network sepolia --address 0x123...
module.exports = { verify };