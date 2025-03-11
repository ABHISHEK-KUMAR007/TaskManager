const hre = require("hardhat");

async function main() {
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();

  await taskManager.waitForDeployment();
  
  console.log("Contract deployed to:", taskManager.target);
  
  // const fs = require("fs");
  // const contractsDir = __dirname + "/../myproject/ABI";

  // if (!fs.existsSync(contractsDir)) {
  //   fs.mkdirSync(contractsDir);
  // }

  // fs.writeFileSync(
  //   contractsDir + "/TaskManager.json",
  //   JSON.stringify({
  //     address: taskManager.target,
  //     abi: JSON.parse(taskManager.interface.formatJson()),
  //   }, null, 2)
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});