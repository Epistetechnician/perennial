import { expect } from "chai";
import { ethers } from "hardhat";
import { PerennialPredictionStrategy, Allo } from "../typechain-types";

describe("PerennialPredictionStrategy", function () {
  let perennialPrediction: PerennialPredictionStrategy;
  let allo: Allo;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const AlloFactory = await ethers.getContractFactory("Allo");
    allo = await AlloFactory.deploy(owner.address);
    await allo.waitForDeployment();

    const PerennialPredictionFactory = await ethers.getContractFactory("PerennialPredictionStrategy");
    perennialPrediction = await PerennialPredictionFactory.deploy(
      "0x1234...", // stakingToken address
      "0x5678...", // EAS address
      await allo.getAddress()
    );
    await perennialPrediction.waitForDeployment();
  });

  describe("Market Creation", function () {
    it("Should create a new market", async function () {
      await perennialPrediction.createMarket("Test Market", "Description", 86400, false, 0, 0);
      const marketCount = await perennialPrediction.marketCount();
      expect(marketCount).to.equal(1);
    });
  });

  describe("Buying and Selling Shares", function () {
    beforeEach(async function () {
      await perennialPrediction.createMarket("Test Market", "Description", 86400, false, 0, 0);
    });

    it("Should allow buying shares", async function () {
      await perennialPrediction.buyShares(1, true, { value: ethers.parseEther("0.1") });
      const market = await perennialPrediction.markets(1);
      expect(market.yesShares).to.be.gt(0);
    });

    it("Should allow selling shares", async function () {
      await perennialPrediction.buyShares(1, true, { value: ethers.parseEther("0.1") });
      const initialShares = (await perennialPrediction.markets(1)).yesShares;
      await perennialPrediction.sellShares(1, true, initialShares);
      const finalShares = (await perennialPrediction.markets(1)).yesShares;
      expect(finalShares).to.equal(0);
    });
  });

  // Add more tests as needed
});
