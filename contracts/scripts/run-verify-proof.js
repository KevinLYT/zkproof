"use strict";

/**
 * External chain: truffle migrate --network local8545, then:
 *   truffle exec scripts/run-verify-proof.js --network local8545
 * In-memory: use `npm test` (migrates + verifies in one process).
 */

const Groth16Verifier = artifacts.require("Groth16Verifier");
const MyContract = artifacts.require("MyContract");
const fs = require("fs");
const path = require("path");
const { unstringifyBigInts } = require("ffjavascript").utils;

function proofToSolidityArgs(proof, publicSignals) {
  const p = unstringifyBigInts(proof);
  const pub = unstringifyBigInts(publicSignals);
  return {
    a: [p.pi_a[0].toString(), p.pi_a[1].toString()],
    b: [
      [p.pi_b[0][1].toString(), p.pi_b[0][0].toString()],
      [p.pi_b[1][1].toString(), p.pi_b[1][0].toString()],
    ],
    c: [p.pi_c[0].toString(), p.pi_c[1].toString()],
    input: pub.map((x) => x.toString()),
  };
}

module.exports = async function (callback) {
  try {
    const verifier = await Groth16Verifier.deployed();
    const repoRoot = path.join(__dirname, "..", "..");
    const proof = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "build", "merkle_proof.json"), "utf8")
    );
    const pub = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "build", "merkle_public.json"), "utf8")
    );
    const { a, b, c, input } = proofToSolidityArgs(proof, pub);
    const ok = await verifier.verifyProof(a, b, c, input);
    console.log("verifyProof =>", ok);
    const zkMessage = await MyContract.deployed();
    const to = "0x0000000000000000000000000000000000000001";
    const content = "gm zk world";
    const tx = await zkMessage.sendMessageWithProof(to, content, a, b, c, input[2]);
    console.log("sendMessageWithProof tx =>", tx.tx);
    callback();
  } catch (err) {
    callback(err);
  }
};
