import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { Perennialprediction, MockERC20 } from "../typechain-types";

/**
 * Deploys a contract named "perennialprediction" using the deployer account and
 * constructor arguments set to the token address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPerennialPrediction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy a mock ERC20 token for testing purposes
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20Factory.deploy("Mock Token", "MTK", ethers.parseEther("1000000"));
  await mockERC20.waitForDeployment();

  const mockERC20Address = await mockERC20.getAddress();
  console.log("Mock ERC20 token deployed to:", mockERC20Address);

  // Deploy the perennialprediction contract
  const perennialprediction = await deploy("perennialprediction", {
    from: deployer,
    args: [mockERC20Address],
    log: true,
    autoMine: true,
  });

  console.log("📜 perennialprediction deployed to:", perennialprediction.address);

  // Add the deployer as a market creator
  const perennialpredictionContract = await ethers.getContractAt("perennialprediction", perennialprediction.address);
  await perennialpredictionContract.addMarketCreator(deployer);
  console.log("Added deployer as market creator:", deployer);
};

export default deployPerennialPrediction;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags perennialprediction
deployPerennialPrediction.tags = ["perennialprediction"];
