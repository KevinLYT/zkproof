"use strict";

const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const vkey = path.join(root, "build", "verification_key.json");
const publicSignals = path.join(root, "build", "public.json");
const proof = path.join(root, "build", "proof.json");

execSync(
  `npx --no-install snarkjs groth16 verify "${vkey}" "${publicSignals}" "${proof}"`,
  { stdio: "inherit", cwd: root, shell: true }
);
