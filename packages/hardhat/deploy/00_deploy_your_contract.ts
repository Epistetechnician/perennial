import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, Contract } from 'ethers';
import { formatUnits, parseUnits } from "ethers/lib/utils";
/**
 * Deploys a contract named "perennialprediction" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get current gas price for Sepolia
  
  // Adjust gas parameters to be more conservative

  console.log(`🚀 Deploying from address: ${deployer}`);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer);
  const balanceBigInt = BigInt(balance.toString()); // Convert BigNumber to BigInt
  console.log(`💰 Deployer balance: ${formatUnits(balance, "ether")} ETH`);

  // EAS Contract Address on Sepolia
  const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";

  try {
    // Deploy PerennialPredictionSchema with reduced gas limit
    console.log("🏗️ Deploying PerennialPredictionSchema...");
    const schemaDeployment = await deploy("PerennialPredictionSchema", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
      gasLimit: 2500000,
    });

    console.log(`✅ PerennialPredictionSchema deployed to: ${schemaDeployment.address}`);

    // Get the schema contract instance
    const schemaContract = await hre.ethers.getContractAt(
      "PerennialPredictionSchema",
      schemaDeployment.address
    );

    // Get the MARKET_CREATION_SCHEMA UID
    const SCHEMA_UID = await schemaContract.MARKET_CREATION_SCHEMA();
    console.log(`🔑 Using SCHEMA_UID: ${SCHEMA_UID}`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy MarketResolutionValidator with reduced gas limit
    console.log("🔨 Deploying MarketResolutionValidator...");
    const validatorDeployment = await deploy("MarketResolutionValidator", {
      from: deployer,
      args: [EAS_CONTRACT_ADDRESS, SCHEMA_UID],
      log: true,
      waitConfirmations: 1,
      gasLimit: 2500000,
    });

    console.log(`✅ MarketResolutionValidator deployed to: ${validatorDeployment.address}`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy PerennialPrediction with reduced gas limit
    console.log("🏗️ Deploying perennialprediction...");
    const predictionDeployment = await deploy("perennialprediction", {
      from: deployer,
      args: [
        deployer,
        EAS_CONTRACT_ADDRESS,
        SCHEMA_UID
      ],
      log: true,
      waitConfirmations: 1,
      gasLimit: 5000000,
    });

    console.log(`✅ PerennialPrediction deployed to: ${predictionDeployment.address}`);

    // Fund the contract if we have enough balance
    const fundingAmount = parseUnits("0.0005", "ether");
    const fundingAmountBigInt = BigInt(fundingAmount.toString()); // Convert to BigInt

    if (balanceBigInt > fundingAmountBigInt * BigInt(2)) { // Check if we have at least 2x the funding amount
      console.log("🔄 Funding contract...");
      
      const signer = await hre.ethers.getSigner(deployer);
      
      const fundingTx = await signer.sendTransaction({
        to: predictionDeployment.address,
        value: fundingAmount,
        gasLimit: 50000,
      });

      console.log("⏳ Waiting for funding transaction...");
      await fundingTx.wait(1);
      
      // Verify the funding
      const contractBalance = await hre.ethers.provider.getBalance(predictionDeployment.address);
      console.log(`💰 Contract funded! Balance: ${formatUnits(contractBalance, "ether")} ETH`);
    } else {
      console.log("⚠️ Insufficient balance for funding the contract");
    }

    // Verification
    if (hre.network.name !== "localhost" && hre.network.name !== "sepolia") {
      try {
        console.log("Waiting before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds delay

        console.log("Verifying contracts...");
       

      } catch (error) {
        console.error("Error during verification:", error);
      }
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }

  console.log("\n🎉 Deployment completed successfully!");
};

export default deployContracts;
deployContracts.tags = ["perennialpredictionschema", "marketresolutionvalidator", "perennialprediction"];
