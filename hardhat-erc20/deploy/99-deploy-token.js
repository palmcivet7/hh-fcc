// const { ethers } = require("ethers");
// const fs = require("fs");
// require("dotenv").config();

// async function deployToken() {
//   const privateKey = process.env.PRIVATE_KEY;
//   const rpcUrl = process.env.SEPOLIA_RPC_URL;

//   const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
//   const signer = new ethers.Wallet(privateKey, provider);

//   // Replace with your own token name, symbol, and initial supply
//   const tokenName = "My Token";
//   const tokenSymbol = "MTK";
//   const initialSupply = ethers.utils.parseEther("1000000");

//   // Load the contract source code from a file
//   const contractPath = "../contracts/MyToken.sol";
//   const contractSource = fs.readFileSync(contractPath, "utf8");

//   // Compile the contract with your preferred Solidity compiler version
//   const compilerVersion = "0.8.7";
//   const compiledContract = await ethers.getContractFactory("MyToken", {
//     libraries: {},
//     solidity: {
//       version: compilerVersion,
//     },
//   });

//   // Deploy the contract and retrieve the contract address and transaction hash
//   const deployedContract = await compiledContract
//     .connect(signer)
//     .deploy(tokenName, tokenSymbol, initialSupply);
//   console.log(`Contract deployed at address: ${deployedContract.address}`);
//   console.log(`Transaction hash: ${deployedContract.deployTransaction.hash}`);

//   // Wait for the contract deployment to be confirmed and print the transaction receipt
//   await deployedContract.deployTransaction.wait();
//   const receipt = await provider.getTransactionReceipt(
//     deployedContract.deployTransaction.hash
//   );
//   console.log(`Transaction receipt: ${JSON.stringify(receipt, null, 2)}`);
// }

// deployToken();
