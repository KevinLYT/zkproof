"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const zkey = path.join(root, "build", "merkle_final.zkey");
const wtns = path.join(root, "build", "merkle_witness.wtns");
const proof = path.join(root, "build", "merkle_proof.json");
const publicSignals = path.join(root, "build", "merkle_public.json");

execSync(
  `npx --no-install snarkjs groth16 prove "${zkey}" "${wtns}" "${proof}" "${publicSignals}"`,
  { stdio: "inherit", cwd: root, shell: true }
);
