const { deployments, ethers, getNamedAccounts } = require("hardhat");
const {
    TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
} = require("hardhat/builtin-tasks/task-names");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          sendValue = ethers.utils.parseEther("1"); // "1000000000000000000" // 1 eth
          beforeEach(async function () {
              // deploy FundMe contract
              // using hardhat deploy
              // const accounts = await ethers.getSigners();
              // const accountZero = accounts[0];
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  // console.log(`this is deployer: ${deployer}`);
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single founder", async function () {
                  // arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceived = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceived;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allows us to withdraw with multiple funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceived = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceived;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // make sure funders reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });

              it("cheaperWithdraw testing...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceived = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceived;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // make sure funders reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
