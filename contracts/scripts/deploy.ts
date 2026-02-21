import { ethers } from "hardhat";

async function main() {
  // Hardcoded contributor addresses for demo
  const contributors = [
    "0xA11c3000000000000000000000000000000A11c3", // Alice
    "0xB0bb0000000000000000000000000000000B0bb0", // Bob
    "0xCa101000000000000000000000000000000Ca101", // Carol
    "0xA93n7000000000000000000000000000000A93n7", // Agent-Reviewer
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
