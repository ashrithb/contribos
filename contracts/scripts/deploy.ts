import { ethers } from "hardhat";

async function main() {
  // Real wallet addresses + demo addresses
  const contributors = [
    "0x5aF191F4a93dD5D830F6232b7c4a12A5f8ebd10E", // Main wallet (Alice)
    "0xbf50e468ffdc701A07af517215A961362147027C", // Bob (demo)
    "0x57CF531C2479b56cA4285e5FA5eF75369A709775", // Carol (demo)
    "0x45c3Bc818bd50baB7212a764B603aAD51893614B", // Agent wallet
  ];
  const weights = [40, 30, 20, 10]; // percentage weights

  console.log("Deploying PaymentSplitter...");
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const splitter = await PaymentSplitter.deploy(contributors, weights);
  await splitter.waitForDeployment();

  const address = await splitter.getAddress();
  console.log(`PaymentSplitter deployed to: ${address}`);
  console.log(`Contributors: ${contributors.join(", ")}`);
  console.log(`Weights: ${weights.join(", ")}`);
  console.log(`View on explorer: https://testnet.kitescan.ai/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
