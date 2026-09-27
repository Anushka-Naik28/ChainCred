const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting ChainCred Smart Contract Deployment...");

  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deploying contract with Admin wallet: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  const ChainCred = await ethers.getContractFactory("ChainCred");
  const chainCred = await ChainCred.deploy();
  await chainCred.waitForDeployment();

  const contractAddress = await chainCred.getAddress();
  console.log(`✅ ChainCred deployed successfully to: ${contractAddress}`);

  // Save Contract Address & Artifact ABI for Frontend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ChainCred.sol/ChainCred.json");
  let artifactAbi = [];

  if (fs.existsSync(artifactPath)) {
    const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    artifactAbi = artifactJson.abi;
  }

  const contractInfo = {
    address: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    abi: artifactAbi,
  };

  const libDir = path.join(__dirname, "../src/lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(libDir, "contractInfo.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  console.log(`📁 Contract info saved to src/lib/contractInfo.json`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
