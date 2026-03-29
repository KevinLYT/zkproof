"use strict";

const { buildPoseidon } = require("circomlibjs");
const fs = require("fs");
const path = require("path");

const DEFAULT_SECRET = 12345n;

async function main() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const secretArg = process.argv[2];
  const secret = secretArg ? BigInt(secretArg) : DEFAULT_SECRET;

  const h = poseidon([F.e(secret)]);
  const publicHash = F.toString(h);

  const input = {
    secret: secret.toString(),
    publicHash,
  };

  const outPath = path.join(__dirname, "..", "input.json");
  fs.writeFileSync(outPath, JSON.stringify(input, null, 2) + "\n");

  console.log("Wrote input.json");
  console.log("  secret (private):     ", input.secret);
  console.log("  publicHash (public):  ", input.publicHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
