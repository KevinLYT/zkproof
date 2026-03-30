"use strict";

/**
 * Maps snarkjs Groth16 JSON to Solidity verifyProof args.
 * b order matches snarkjs groth16.exportSolidityCallData (G2 transpose for Ethereum).
 */

const fs = require("fs");
const path = require("path");
const { unstringifyBigInts } = require("ffjavascript").utils;

function proofToSolidityArgs(proof, publicSignals) {
  const p = unstringifyBigInts(proof);
  const pub = unstringifyBigInts(publicSignals);

  const a = [p.pi_a[0].toString(), p.pi_a[1].toString()];
  const b = [
    [p.pi_b[0][1].toString(), p.pi_b[0][0].toString()],
    [p.pi_b[1][1].toString(), p.pi_b[1][0].toString()],
  ];
  const c = [p.pi_c[0].toString(), p.pi_c[1].toString()];
  const input = pub.map((x) => x.toString());

  return { a, b, c, input };
}

function main() {
  const repoRoot = path.join(__dirname, "..", "..");
  const proofPath = path.join(repoRoot, "build", "merkle_proof.json");
  const publicPath = path.join(repoRoot, "build", "merkle_public.json");

  const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
  const pub = JSON.parse(fs.readFileSync(publicPath, "utf8"));
  const args = proofToSolidityArgs(proof, pub);

  console.log(JSON.stringify(args, null, 2));
  console.log("\nSolidity call shape:");
  console.log(
    "verifyProof(uint[2] a, uint[2][2] b, uint[2] c, uint[1] input)"
  );
  console.log("input length:", args.input.length);
}

main();
