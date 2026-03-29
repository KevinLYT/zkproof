"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const zkey = path.join(root, "build", "hash_final.zkey");
const wtns = path.join(root, "build", "witness.wtns");
const proof = path.join(root, "build", "proof.json");
const publicSignals = path.join(root, "build", "public.json");

execSync(
  `npx --no-install snarkjs groth16 prove "${zkey}" "${wtns}" "${proof}" "${publicSignals}"`,
  { stdio: "inherit", cwd: root, shell: true }
);
