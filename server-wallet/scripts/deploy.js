async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Wallet = await ethers.getContractFactory("ServerWallet");
  const wallet = await Wallet.deploy();
  
  await wallet.waitForDeployment();
  
  console.log("✅ ServerWallet deployed at:", await wallet.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
