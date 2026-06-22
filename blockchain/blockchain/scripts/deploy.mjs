import hardhat from "hardhat";

async function main() {
  const { network, artifacts } = hardhat;
  const { ethers } = await import("ethers");
  
  const artifact = await artifacts.readArtifact("SecurityLogs");
  
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("SecurityLogs deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});