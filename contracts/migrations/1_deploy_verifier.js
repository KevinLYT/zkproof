const Groth16Verifier = artifacts.require("Groth16Verifier");
const MyContract = artifacts.require("MyContract");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer) {
  await deployer.deploy(Groth16Verifier);
  const verifier = await Groth16Verifier.deployed();
  const inputPath = path.join(__dirname, "..", "..", "input-merkle.json");
  const { root } = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  await deployer.deploy(MyContract, verifier.address, root);
};
