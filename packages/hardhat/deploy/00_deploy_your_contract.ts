import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { parseUnits } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

const deployPerennialPrediction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const gasPrice = BigNumber.from("1500000000");
  
  // Deploy the contract without constructor arguments
  const deployment = await deploy("perennialprediction", {
    from: deployer,
    args: [], // Remove the constructor argument
    log: true,
    waitConfirmations: 1,
    gasLimit: 20000000,
    gasPrice: gasPrice,
  });

  // Fund the contract with 0.001 ETH
  const fundingAmount = parseUnits("0.001", "ether");
  const signer = await ethers.getSigner(deployer);
  
  await signer.sendTransaction({
    to: deployment.address,
    value: fundingAmount,
  });

  console.log(`Funded contract with ${ethers.formatEther(fundingAmount)} ETH at address: ${deployment.address}`);
};

export default deployPerennialPrediction;
deployPerennialPrediction.tags = ["perennialprediction"];
