import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Perennialprediction, Perennialprediction__factory, MockERC20, MockERC20__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Perennialprediction", function () {
  let perennialprediction: Perennialprediction;
  let mockERC20: MockERC20;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const MINIMUM_STAKE = ethers.parseEther("100");

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockERC20
    const MockERC20Factory = new MockERC20__factory(owner);
    mockERC20 = await MockERC20Factory.deploy("Mock Token", "MTK", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();

    // Deploy Perennialprediction
    const PerennialpredictionFactory = new Perennialprediction__factory(owner);
    perennialprediction = await PerennialpredictionFactory.deploy(await mockERC20.getAddress());
    await perennialprediction.waitForDeployment();

    // Approve tokens for users
    await mockERC20.approve(await perennialprediction.getAddress(), ethers.parseEther("1000000"));
    await mockERC20.connect(user1).approve(await perennialprediction.getAddress(), ethers.parseEther("1000000"));
    await mockERC20.connect(user2).approve(await perennialprediction.getAddress(), ethers.parseEther("1000000"));

    // Transfer some tokens to users
    await mockERC20.transfer(user1.address, ethers.parseEther("10000"));
    await mockERC20.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Market Creation", function () {
    it("Should allow the owner to create a market", async function () {
      const duration = 60 * 60 * 24; // 1 day duration
      const latestTime = await time.latest();
      
      const tx = await perennialprediction.createMarket(
        "Test Market",
        "This is a test market",
        duration,
        false,
        0,
        0
      );

      await expect(tx).to.emit(perennialprediction, "MarketCreated").withArgs(1, "Test Market", latestTime + duration, false);
    });

    it("Should not allow non-owners to create a market", async function () {
      await expect(
        perennialprediction.connect(user1).createMarket(
          "Test Market",
          "This is a test market",
          60 * 60 * 24,
          false,
          0,
          0
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Buying and Selling Shares", function () {
    it("Should allow users to buy shares", async function () {
      const amount = ethers.parseEther("100");
      const tx = await perennialprediction.connect(user1).buyShares(1, true, amount);

      await expect(tx).to.emit(perennialprediction, "SharesBought").withArgs(1, user1.address, true, amount);
    });

    it("Should allow users to sell shares", async function () {
      const amount = ethers.parseEther("50");
      const tx = await perennialprediction.connect(user1).sellShares(1, true, amount);

      await expect(tx).to.emit(perennialprediction, "SharesSold").withArgs(1, user1.address, true, amount);
    });
  });

  describe("Creating Predictions", function () {
    it("Should allow users to create predictions", async function () {
      const tx = await perennialprediction.connect(user2).createPrediction(
        1,  // marketId
        false,  // isYes
        500,  // predictedValue
        80,  // confidence
        { value: MINIMUM_STAKE }  // Send the minimum stake amount
      );

      await expect(tx).to.emit(perennialprediction, "PredictionCreated").withArgs(1, user2.address, 1, false);
    });

    it("Should not allow predictions with insufficient stake", async function () {
      await expect(
        perennialprediction.connect(user2).createPrediction(
          1,  // marketId
          true,  // isYes
          600,  // predictedValue
          90,  // confidence
          { value: ethers.parseEther("0.000000000000000001") }  // 1 wei, which is less than MINIMUM_STAKE
        )
      ).to.be.revertedWith("Insufficient stake");
    });
  });

  describe("Resolving Markets and Predictions", function () {
    it("Should allow the owner to resolve a market", async function () {
      // Fast-forward time
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 25]); // 25 hours
      await ethers.provider.send("evm_mine", []);

      const tx = await perennialprediction.resolveMarket(1, true);

      await expect(tx).to.emit(perennialprediction, "MarketResolved").withArgs(1, true);
    });

    it("Should resolve predictions when resolving a market", async function () {
      await expect(perennialprediction.resolveMarket(1, true))
        .to.emit(perennialprediction, "PredictionResolved")
        .withArgs(1, false, 0); // The prediction was for "false", but the outcome was "true"
    });
  });

  describe("Claiming Rewards", function () {
    it("Should allow users to claim rewards for resolved markets", async function () {
      const tx = await perennialprediction.connect(user1).claimRewards(1);

      // We can't predict the exact reward amount, so we just check if the event is emitted
      await expect(tx).to.emit(mockERC20, "Transfer");
    });

    it("Should not allow claiming rewards for unresolved markets", async function () {
      await perennialprediction.createMarket("Test Market 2", "This is another test market", 60 * 60 * 24, false, 0, 0);

      await expect(perennialprediction.connect(user1).claimRewards(2)).to.be.revertedWith("Market is not resolved yet");
    });
  });
});
